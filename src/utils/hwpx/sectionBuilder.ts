// Build section0.xml — 2-column layout, justified, with proper paragraph structure.
// secPr/ctrl live inside first paragraph's first run per OWPML spec.

export interface HwpxParagraph {
  text: string;
  pageBreak?: boolean;
  columnBreak?: boolean;
  /** When set, render as a single-cell bordered table (box) containing these lines. */
  boxLines?: string[];
}

const xmlEscape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Body width: 59528 - 4252*2 = 51024. With 2 cols + 1984 gap (7mm): (51024-1984)/2 = 24520
const COL_HORZSIZE = 24520;

const SEC_PR = `<hp:secPr id="" textDirection="HORIZONTAL" spaceColumns="1984" tabStop="8000" tabStopVal="4000" tabStopUnit="HWPUNIT" outlineShapeIDRef="1" memoShapeIDRef="0" textVerticalWidthHead="0" masterPageCnt="0">

  <hp:grid lineGrid="0" charGrid="0" wonggojiFormat="0"/>
  <hp:startNum pageStartsOn="BOTH" page="0" pic="0" tbl="0" equation="0"/>
  <hp:visibility hideFirstHeader="0" hideFirstFooter="0" hideFirstMasterPage="0" border="SHOW_ALL" fill="SHOW_ALL" hideFirstPageNum="0" hideFirstEmptyLine="0" showLineNumber="0"/>
  <hp:lineNumberShape restartType="0" countBy="0" distance="0" startNumber="0"/>
  <hp:pagePr landscape="WIDELY" width="59528" height="84186" gutterType="LEFT_ONLY">
    <hp:margin header="4252" footer="2835" gutter="0" left="4252" right="4252" top="1417" bottom="1417"/>
  </hp:pagePr>
  <hp:footNotePr>
    <hp:autoNumFormat type="DIGIT" userChar="" prefixChar="" suffixChar=")" supscript="0"/>
    <hp:noteLine length="-1" type="SOLID" width="0.12 mm" color="#000000"/>
    <hp:noteSpacing betweenNotes="283" belowLine="567" aboveLine="850"/>
    <hp:numbering type="CONTINUOUS" newNum="1"/>
    <hp:placement place="EACH_COLUMN" beneathText="0"/>
  </hp:footNotePr>
  <hp:endNotePr>
    <hp:autoNumFormat type="DIGIT" userChar="" prefixChar="" suffixChar=")" supscript="0"/>
    <hp:noteLine length="14692344" type="SOLID" width="0.12 mm" color="#000000"/>
    <hp:noteSpacing betweenNotes="0" belowLine="567" aboveLine="850"/>
    <hp:numbering type="CONTINUOUS" newNum="1"/>
    <hp:placement place="END_OF_DOCUMENT" beneathText="0"/>
  </hp:endNotePr>
  <hp:pageBorderFill type="BOTH" borderFillIDRef="1" textBorder="PAPER" headerInside="0" footerInside="0" fillArea="PAPER">
    <hp:offset left="1417" right="1417" top="1417" bottom="1417"/>
  </hp:pageBorderFill>
  <hp:pageBorderFill type="EVEN" borderFillIDRef="1" textBorder="PAPER" headerInside="0" footerInside="0" fillArea="PAPER">
    <hp:offset left="1417" right="1417" top="1417" bottom="1417"/>
  </hp:pageBorderFill>
  <hp:pageBorderFill type="ODD" borderFillIDRef="1" textBorder="PAPER" headerInside="0" footerInside="0" fillArea="PAPER">
    <hp:offset left="1417" right="1417" top="1417" bottom="1417"/>
  </hp:pageBorderFill>
</hp:secPr>
<hp:ctrl>
  <hp:colPr id="" type="NEWSPAPER" layout="LEFT" colCount="2" sameSz="1" sameGap="1984"/>
</hp:ctrl>`;

// Empty linesegarray forces the viewer (Hangul) to recompute line wrapping.
// A single lineseg makes all wrapped lines overlap at the same vertpos.
const LINESEG = `<hp:linesegarray/>`;

// Tokenize text supporting **bold** and <u>underline</u> (and <b>) markers
interface Run { text: string; bold: boolean; underline: boolean; }
function tokenize(text: string): Run[] {
  // First convert **...** to <b>...</b>
  const normalized = text.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  const runs: Run[] = [];
  let bold = false, underline = false;
  const re = /<\/?(b|u)>/gi;
  let lastIdx = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(normalized)) !== null) {
    if (m.index > lastIdx) runs.push({ text: normalized.slice(lastIdx, m.index), bold, underline });
    const closing = m[0].startsWith("</");
    const tag = m[1].toLowerCase();
    if (tag === "b") bold = !closing;
    else if (tag === "u") underline = !closing;
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < normalized.length) runs.push({ text: normalized.slice(lastIdx), bold, underline });
  // Strip any other html-ish tags
  return runs
    .map(r => ({ ...r, text: r.text.replace(/<\/?[a-zA-Z][^>]*>/g, "") }))
    .filter(r => r.text.length > 0);
}

function charPrId(bold: boolean, underline: boolean): number {
  // Underlined text should always render as plain (non-bold, non-italic) + underline
  if (underline) return 8;
  if (bold) return 7;
  return 0;
}

function runsXml(text: string): string {
  const runs = tokenize(text);
  if (runs.length === 0) return `<hp:run charPrIDRef="0"><hp:t/></hp:run>`;
  return runs.map(r => `<hp:run charPrIDRef="${charPrId(r.bold, r.underline)}"><hp:t>${xmlEscape(r.text)}</hp:t></hp:run>`).join("");
}

function paraInner(text: string): string {
  return `${runsXml(text)}${LINESEG}`;
}

// --- Markdown table → HWPX table ---
// Detects | col | col | rows (with optional separator line)
function isTableLine(line: string): boolean {
  return /^\s*\|(.+\|)+\s*$/.test(line);
}
function isSeparatorLine(line: string): boolean {
  return /^\s*\|[\s\-:]+(\|[\s\-:]+)+\|\s*$/.test(line);
}

function parseTableRows(lines: string[]): string[][] {
  return lines
    .filter(l => !isSeparatorLine(l))
    .map(l => l.trim().replace(/^\|/, "").replace(/\|\s*$/, "").split("|").map(c => c.trim()));
}

function buildTableXml(lines: string[], paraId: number): string {
  const rows = parseTableRows(lines);
  if (rows.length === 0) return "";
  const colCnt = Math.max(...rows.map(r => r.length));
  const rowCnt = rows.length;
  const tableWidth = COL_HORZSIZE; // fit column width
  const rowHeight = 800;

  // Compute per-column widths: if the first column looks like an option-number
  // column (short markers like ①~⑤ or digits), give it a snug width and split
  // the rest equally across the remaining columns.
  const NUMBER_RE = /^\s*(?:[①-⑳]|[0-9]{1,2}[.)]?|[가-힣]\.)\s*$/;
  const firstColIsNumbers =
    colCnt >= 2 &&
    rows.filter(r => r[0] !== undefined && r[0] !== "").every(r => NUMBER_RE.test(r[0] ?? ""));

  let colWidths: number[];
  if (firstColIsNumbers) {
    const numCol = 1600; // snug for ① etc.
    const remaining = tableWidth - numCol;
    const other = Math.floor(remaining / (colCnt - 1));
    colWidths = Array.from({ length: colCnt }, (_, i) => (i === 0 ? numCol : other));
    // Absorb rounding into the last column
    const used = colWidths.reduce((a, b) => a + b, 0);
    colWidths[colWidths.length - 1] += tableWidth - used;
  } else {
    const even = Math.floor(tableWidth / colCnt);
    colWidths = Array.from({ length: colCnt }, (_, i) => even);
    const used = colWidths.reduce((a, b) => a + b, 0);
    colWidths[colWidths.length - 1] += tableWidth - used;
  }

  const trXml = rows.map((row, rIdx) => {
    const cells = Array.from({ length: colCnt }, (_, cIdx) => {
      const text = row[cIdx] ?? "";
      return `<hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="0" borderFillIDRef="1">
        <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
          <hp:p id="0" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
            ${runsXml(text)}
            <hp:linesegarray/>
          </hp:p>
        </hp:subList>
        <hp:cellAddr colAddr="${cIdx}" rowAddr="${rIdx}"/>
        <hp:cellSpan colSpan="1" rowSpan="1"/>
        <hp:cellSz width="${colWidths[cIdx]}" height="${rowHeight}"/>
        <hp:cellMargin left="141" right="141" top="141" bottom="141"/>
      </hp:tc>`;
    }).join("");
    return `<hp:tr>${cells}</hp:tr>`;
  }).join("");

  // Table sits inside a paragraph/run as a control
  return `<hp:p id="${paraId}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="0">
      <hp:tbl id="" zOrder="0" numberingType="TABLE" textWrap="TOP_AND_BOTTOM" textFlow="BOTH_SIDES" lock="0" dropcapstyle="None" pageBreak="CELL" repeatHeader="1" rowCnt="${rowCnt}" colCnt="${colCnt}" cellSpacing="0" borderFillIDRef="1" noAdjust="0">
        <hp:sz width="${tableWidth}" widthRelTo="ABSOLUTE" height="${rowHeight * rowCnt}" heightRelTo="ABSOLUTE" protect="0"/>
        <hp:pos treatAsChar="0" affectLSpacing="0" flowWithText="1" allowOverlap="0" holdAnchorAndSO="0" vertRelTo="PARA" horzRelTo="PARA" vertAlign="TOP" horzAlign="LEFT" vertOffset="0" horzOffset="0"/>
        <hp:outMargin left="0" right="0" top="0" bottom="0"/>
        <hp:inMargin left="510" right="510" top="141" bottom="141"/>
        ${trXml}
      </hp:tbl>
    </hp:run>
    <hp:linesegarray/>
  </hp:p>`;
}

// Build a 1x1 bordered table containing multiple paragraphs (used to render <box>...</box> blocks)
function buildBoxXml(lines: string[], paraId: number): string {
  const tableWidth = COL_HORZSIZE;
  const innerParas = (lines.length > 0 ? lines : [""])
    .map((t, idx) => `<hp:p id="${idx}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
      ${runsXml(t)}
      <hp:linesegarray/>
    </hp:p>`)
    .join("");
  const rowHeight = 800 * Math.max(1, lines.length);

  return `<hp:p id="${paraId}" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="0">
      <hp:tbl id="" zOrder="0" numberingType="TABLE" textWrap="TOP_AND_BOTTOM" textFlow="BOTH_SIDES" lock="0" dropcapstyle="None" pageBreak="CELL" repeatHeader="1" rowCnt="1" colCnt="1" cellSpacing="0" borderFillIDRef="3" noAdjust="0">
        <hp:sz width="${tableWidth}" widthRelTo="ABSOLUTE" height="${rowHeight}" heightRelTo="ABSOLUTE" protect="0"/>
        <hp:pos treatAsChar="0" affectLSpacing="0" flowWithText="1" allowOverlap="0" holdAnchorAndSO="0" vertRelTo="PARA" horzRelTo="PARA" vertAlign="TOP" horzAlign="LEFT" vertOffset="0" horzOffset="0"/>
        <hp:outMargin left="0" right="0" top="0" bottom="0"/>
        <hp:inMargin left="510" right="510" top="141" bottom="141"/>
        <hp:tr>
          <hp:tc name="" header="0" hasMargin="0" protect="0" editable="0" dirty="0" borderFillIDRef="3">
            <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="TOP" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">
              ${innerParas}
            </hp:subList>
            <hp:cellAddr colAddr="0" rowAddr="0"/>
            <hp:cellSpan colSpan="1" rowSpan="1"/>
            <hp:cellSz width="${tableWidth}" height="${rowHeight}"/>
            <hp:cellMargin left="283" right="283" top="283" bottom="283"/>
          </hp:tc>
        </hp:tr>
      </hp:tbl>
    </hp:run>
    <hp:linesegarray/>
  </hp:p>`;
}

export function buildSectionXml(paragraphs: HwpxParagraph[], headerText?: string): string {
  const paras = paragraphs.length > 0 ? paragraphs : [{ text: "" }];

  // Optional page header (머리말) — centered
  const headerCtrl = headerText && headerText.trim()
    ? `<hp:run charPrIDRef="0"><hp:ctrl><hp:header id="" applyPageType="BOTH">
        <hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="TOP" linkListIDRef="0" linkListNextIDRef="0" textWidth="51024" textHeight="0" hasTextRef="0" hasNumRef="0">
          <hp:p id="0" paraPrIDRef="20" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
            <hp:run charPrIDRef="0"><hp:t>${xmlEscape(headerText)}</hp:t></hp:run>
            <hp:linesegarray/>
          </hp:p>
        </hp:subList>
      </hp:header></hp:ctrl></hp:run>`
    : "";

  // First paragraph carries secPr/ctrl + its own text
  const first = `<hp:p id="0" paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">
    <hp:run charPrIDRef="0">${SEC_PR}</hp:run>
    ${headerCtrl}
    ${paraInner(paras[0].text)}
  </hp:p>`;

  // For remaining paragraphs, detect contiguous markdown-table blocks and emit as tables
  const restItems: string[] = [];
  const remaining = paras.slice(1);
  let i = 0;
  let pid = 1;
  while (i < remaining.length) {
    const p = remaining[i];
    if (p.boxLines) {
      restItems.push(buildBoxXml(p.boxLines, pid++));
      i++;
      continue;
    }
    if (isTableLine(p.text) || isSeparatorLine(p.text)) {
      const block: string[] = [];
      while (i < remaining.length && (isTableLine(remaining[i].text) || isSeparatorLine(remaining[i].text))) {
        block.push(remaining[i].text);
        i++;
      }
      if (block.length >= 2) {
        restItems.push(buildTableXml(block, pid++));
        continue;
      } else {
        // single line — render as text
        block.forEach(t => {
          restItems.push(`<hp:p id="${pid++}" paraPrIDRef="1" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">${paraInner(t)}</hp:p>`);
        });
        continue;
      }
    }
    const pb = p.pageBreak ? '1' : '0';
    const cb = (p.pageBreak || p.columnBreak) ? '1' : '0';
    restItems.push(`<hp:p id="${pid++}" paraPrIDRef="1" styleIDRef="0" pageBreak="${pb}" columnBreak="${cb}" merged="0">${paraInner(p.text)}</hp:p>`);
    i++;
  }
  const rest = restItems.join("\n");

  return `<?xml version='1.0' encoding='UTF-8'?>
<hs:sec xmlns:ha="http://www.hancom.co.kr/hwpml/2011/app" xmlns:hp="http://www.hancom.co.kr/hwpml/2011/paragraph" xmlns:hp10="http://www.hancom.co.kr/hwpml/2016/paragraph" xmlns:hs="http://www.hancom.co.kr/hwpml/2011/section" xmlns:hc="http://www.hancom.co.kr/hwpml/2011/core" xmlns:hh="http://www.hancom.co.kr/hwpml/2011/head" xmlns:hhs="http://www.hancom.co.kr/hwpml/2011/history" xmlns:hm="http://www.hancom.co.kr/hwpml/2011/master-page" xmlns:hpf="http://www.hancom.co.kr/schema/2011/hpf" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf/" xmlns:ooxmlchart="http://www.hancom.co.kr/hwpml/2016/ooxmlchart" xmlns:hwpunitchar="http://www.hancom.co.kr/hwpml/2016/HwpUnitChar" xmlns:epub="http://www.idpf.org/2007/ops" xmlns:config="urn:oasis:names:tc:opendocument:xmlns:config:1.0">
  ${first}
  ${rest}
</hs:sec>`;
}
