// HWPX document generator
// - 2-column justified layout
// - Skips passage title
// - Collects answers/explanations and appends as separated section at the end

import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  MIMETYPE,
  VERSION_XML,
  CONTAINER_XML,
  MANIFEST_XML,
  CONTENT_HPF,
  HEADER_XML,
  SETTINGS_XML,
} from "./hwpx/templates";
import { buildSectionXml, HwpxParagraph } from "./hwpx/sectionBuilder";

interface Question {
  id: string;
  content: string;
  questionNumber: number;
  passageTitle?: string;
}

// Normalize answer/explanation markers in raw content
function normalizeContent(raw: string): string {
  return raw
    .replace(/\*\*\[정답\]\*\*/g, "[정답]")
    .replace(/\*\*\[해설\]\*\*/g, "[해설]")
    .replace(/\*\*정답\s*[:：]?\s*\*\*/g, "[정답]")
    .replace(/\*\*해설\s*[:：]?\s*\*\*/g, "[해설]")
    .replace(/정답\s*[:：]\s*/g, "[정답] ")
    .replace(/해설\s*[:：]\s*/g, "[해설] ")
    // Remove the "===== 정답 및 해설 =====" header from body (shown only on answer page)
    .replace(/=+\s*정답\s*및\s*해설\s*=+/g, "")
    // Preserve **bold** and <u>underline</u> for sectionBuilder to tokenize
    // Strip bold/underline markers specifically around "영영풀이"
    .replace(/\*\*\s*영영풀이\s*\*\*/g, "영영풀이")
    .replace(/<u>\s*영영풀이\s*<\/u>/gi, "영영풀이")
    ;
}

// Split a question's content into [body, answerSection]
function splitQuestion(raw: string): { body: string; answer: string } {
  const cleaned = normalizeContent(raw);
  const idx = cleaned.indexOf("[정답]");
  if (idx === -1) return { body: cleaned, answer: "" };
  return {
    body: cleaned.slice(0, idx).trimEnd(),
    answer: cleaned.slice(idx).trim(),
  };
}

function bodyParagraphs(q: Question): HwpxParagraph[] {
  const { body } = splitQuestion(q.content);
  // Ensure exactly one space between circled number markers (①-⑩) and following text
  let compact = body.replace(/([①-⑩])\s*/g, "$1 ");

  // Normalize <box> / </box> so each tag is on its own line, even if AI inlined them
  compact = compact
    .replace(/<box>\s*/g, "\n<box>\n")
    .replace(/\s*<\/box>/g, "\n</box>\n")
    .replace(/\n{3,}/g, "\n\n");

  const lines = compact.split(/\r?\n/).filter((l, i) => !(i === 0 && !l.trim()));
  const paras: HwpxParagraph[] = [];
  const stripMarkers = (s: string) =>
    s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/<\/?b>/gi, "");

  const firstIdx = lines.findIndex(l => l.trim().length > 0);
  if (firstIdx >= 0) {
    lines[firstIdx] = `${q.questionNumber}.${stripMarkers(lines[firstIdx].trim())}`;
  } else {
    lines.unshift(`${q.questionNumber}.`);
  }

  // Group <box>...</box> blocks into a single bordered paragraph
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed === "<box>") {
      const boxLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== "</box>") {
        if (lines[i].trim().length > 0) boxLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip </box>
      if (boxLines.length > 0) paras.push({ text: "", boxLines });
      continue;
    }
    // Skip stray </box> just in case
    if (trimmed === "</box>") { i++; continue; }
    paras.push({ text: line });
    i++;
  }
  paras.push({ text: "" });
  return paras;
}

function answerParagraphs(q: Question): HwpxParagraph[] {
  const { answer } = splitQuestion(q.content);
  if (!answer) return [];
  const paras: HwpxParagraph[] = [];
  paras.push({ text: `[${q.questionNumber}번]` });
  const lines = answer.split(/\r?\n/);
  for (const line of lines) {
    paras.push({ text: line });
  }
  paras.push({ text: "" });
  return paras;
}

export async function generateHwpxDocument(
  questions: Question[],
  title: string = "문제"
): Promise<void> {
  const paragraphs: HwpxParagraph[] = [];

  // ---- Question section (no inline title; title goes into page header) ----
  // Layout: 2 questions per page, one per column (left column, right column)
  for (let qi = 0; qi < questions.length; qi++) {
    const q = questions[qi];
    const qParas = bodyParagraphs(q);
    if (qi > 0 && qParas.length > 0) {
      if (qi % 2 === 0) {
        // New page for every odd question (3rd, 5th, ...)
        qParas[0] = { ...qParas[0], pageBreak: true };
      } else {
        // Move to the right column for the 2nd question of each page
        qParas[0] = { ...qParas[0], columnBreak: true };
      }
    }
    paragraphs.push(...qParas);
  }

  // ---- Answer & Explanation section (new page) ----
  const answers = questions.flatMap(answerParagraphs);
  if (answers.length > 0) {
    paragraphs.push({ text: "정답 및 해설", pageBreak: true });
    paragraphs.push({ text: "" });
    paragraphs.push(...answers);
  }

  const sectionXml = buildSectionXml(paragraphs, title);

  const zip = new JSZip();
  zip.file("mimetype", MIMETYPE, { compression: "STORE" });
  zip.file("version.xml", VERSION_XML);
  zip.file("settings.xml", SETTINGS_XML);
  zip.folder("META-INF")!.file("container.xml", CONTAINER_XML);
  zip.folder("META-INF")!.file("manifest.xml", MANIFEST_XML);
  const contents = zip.folder("Contents")!;
  contents.file("content.hpf", CONTENT_HPF);
  contents.file("header.xml", HEADER_XML);
  contents.file("section0.xml", sectionXml);

  const blob = await zip.generateAsync({
    type: "blob",
    mimeType: "application/hwp+zip",
    compression: "DEFLATE",
  });
  saveAs(blob, `${title}.hwpx`);
}
