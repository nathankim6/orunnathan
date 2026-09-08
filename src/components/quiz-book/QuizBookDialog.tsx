import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Printer, BookOpen, Upload, Loader2, FileText } from "lucide-react";
import mammoth from "mammoth";
import { useToast } from "@/hooks/use-toast";
interface ParsedQuestion {
  number: number;
  content: string;
  answer: string;
  explanation: string;
  passageTitle?: string;
  isWorkbook?: boolean; // grammar/vocab workbook — answer shown inline
  workbookAnswerLabel?: string; // "어법 정답" or "어휘 정답"
}
// Clean unwanted text patterns from input
// Extract passage title from text like "[Lesson 5] content" -> { title, text }
// Skips known tags like [서답형], [OUTPUT] etc.
const extractPassageTitle = (text: string): { title: string; text: string } => {
  const knownTags = ['서답형', 'OUTPUT', '정답', '해설'];
  const match = text.match(/^\[([^\]]+)\]\s*/);
  if (match && !knownTags.includes(match[1])) {
    return { title: match[1], text: text.substring(match[0].length) };
  }
  // Also try after [서답형] tag
  if (match && match[1] === '서답형') {
    const afterTag = text.substring(match[0].length);
    const secondMatch = afterTag.match(/^\[([^\]]+)\]\s*/);
    if (secondMatch && !knownTags.includes(secondMatch[1])) {
      return { title: secondMatch[1], text: text.substring(0, match[0].length) + afterTag.substring(secondMatch[0].length) };
    }
  }
  return { title: '', text };
};

const normalizeParsedDocumentText = (text: string): string => {
  let result = text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed.startsWith('#')) return line;

      const normalized = trimmed.replace(/^#+\s*/, '').trim();
      if (/^page\s+\d+$/i.test(normalized)) return '';
      if (/^images from page/i.test(normalized)) return '';
      if (/^문제$/i.test(normalized)) return '';
      if (/^어법\s*정답$/i.test(normalized)) return '';
      if (/^어휘\s*정답$/i.test(normalized)) return '';
      if (/^정답\s*및\s*해설$/i.test(normalized)) return '';
      return normalized;
    })
    .join('\n')
    .replace(/^\s*##\s*Page\s+\d+.*$/gim, '')
    .replace(/^\s*###\s*Images from page.*$/gim, '')
    .replace(/^\s*-\s*`parsed-documents:.*$/gm, '')
    .replace(/\(full page screenshot\)/g, '')
    // Strip structural sub-labels like "밑줄 친 부분:", "선택지:" that appear as standalone lines
    .replace(/^\s*밑줄\s*친\s*부분\s*[:：]\s*$/gm, '')
    .replace(/^\s*선택지\s*[:：]\s*$/gm, '')
    .replace(/^\s*정답\s*선택지\s*$/gm, '')
    .replace(/^\s*어법\s*오류\s*설명\s*[:：]?\s*$/gm, '')
    .replace(/^\s*어휘\s*오류\s*설명\s*[:：]?\s*$/gm, '');

  // Merge orphaned circled-number lines: when ① is alone on a line and next line has text,
  // merge them (common artifact from Word "# ①" headings)
  result = result.replace(
    /^([①②③④⑤])\s*\n+(?!\s*[①②③④⑤\n|])([\s\S]*?)(?=\n\s*[①②③④⑤]|\n\s*\n|\n\s*\||$)/gm,
    '$1 $2'
  );

  // Remove truly orphaned ① that appears alone on a line with NO following text to merge
  // (artifact from "# ①" heading that had nothing after it)
  result = result.replace(/^\s*[①②③④⑤]\s*$/gm, '');

  return result;
};

const cleanUnwantedText = (text: string): string => {
  return normalizeParsedDocumentText(text)
    .replace(/^#+\s*(?:수정된\s*)?문제.*$/gm, '')
    .replace(/^---+$/gm, '')
    .replace(/\[(?:OUTPUT|OUPUT|출력|output)\]\s*/gi, '')
    // Normalize bolded question numbers from Word parsing while preserving other bold text
    .replace(/^\s*\*\*(\d+\.)\s*\*\*/gm, '$1 ')
    .replace(/^\s*\n/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    // Decode HTML entities from document parser
    .replace(/&#x3C;/g, '<')
    .replace(/&#x3E;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();
};

const parseQuestions = (text: string): ParsedQuestion[] => {
  const questions: ParsedQuestion[] = [];
  
  if (!text || !text.trim()) return questions;

  // Split off the answer section if "===== 정답 및 해설 =====" separator exists
  let questionSection = text;
  let answerSection = "";
  const answerSeparatorPattern = /={3,}\s*정답\s*(?:및|&)\s*해설\s*={3,}/;
  const sepMatch = text.match(answerSeparatorPattern);
  if (sepMatch && sepMatch.index !== undefined) {
    questionSection = text.substring(0, sepMatch.index).trim();
    answerSection = text.substring(sepMatch.index + sepMatch[0].length).trim();
  }

  // Auto-detect answer sections without explicit separator
  // Look for consecutive answer-only blocks: "N.\n[정답]..." pattern at the end of the file
  if (!answerSection) {
    // Find the first occurrence of a standalone answer block pattern:
    // a line with just a number, followed by [정답] on the next line
    const answerBlockStarts: number[] = [];
    const answerBlockDetector = /(?:^|\n)\s*(\d+)\.\s*\n\s*\[정답\]/g;
    let detectMatch;
    while ((detectMatch = answerBlockDetector.exec(questionSection)) !== null) {
      answerBlockStarts.push(detectMatch.index);
    }
    
    // If we find 3+ consecutive answer blocks, treat from the first one as the answer section
    if (answerBlockStarts.length >= 3) {
      const firstAnswerIdx = answerBlockStarts[0];
      // Verify this isn't in the middle of a question by checking if there's 
      // actual question content (with passages) after this point
      const afterText = questionSection.substring(firstAnswerIdx);
      const hasQuestionContent = /(?:다음|글\s*\(가\)|주어진|아래)\s*글/.test(afterText);
      if (!hasQuestionContent) {
        answerSection = questionSection.substring(firstAnswerIdx).trim();
        questionSection = questionSection.substring(0, firstAnswerIdx).trim();
      }
    }
  }

  // Parse answer section into a map: questionNumber -> { answer, explanation }
  const answerMap = new Map<number, { answer: string; explanation: string }>();
  if (answerSection) {
    const answerBlocks = answerSection.split(/(?=(?:^|\n)\s*\d+\.?\s)/g).filter(b => b.trim());
    for (const block of answerBlocks) {
      const numMatch = block.match(/^\s*(\d+)\.?\s/);
      if (!numMatch) continue;
      const num = parseInt(numMatch[1], 10);
      let answer = "";
      let explanation = "";
      const ansIdx = block.indexOf("[정답]");
      const expIdx = block.indexOf("[해설]");
      if (ansIdx !== -1 && expIdx !== -1) {
        if (ansIdx < expIdx) {
          answer = block.substring(ansIdx + 4, expIdx).trim();
          explanation = block.substring(expIdx + 4).trim();
        } else {
          explanation = block.substring(expIdx + 4, ansIdx).trim();
          answer = block.substring(ansIdx + 4).trim();
        }
      } else if (ansIdx !== -1) {
        answer = block.substring(ansIdx + 4).trim();
      } else if (expIdx !== -1) {
        explanation = block.substring(expIdx + 4).trim();
      }
      answer = answer.split('\n')[0].trim();
      answerMap.set(num, { answer, explanation });
    }
  }
  
  // Extract title metadata from <!--TITLE:xxx-->N. pattern
  const titleMap = new Map<number, string>();
  const commentTitleRegex = /<!--TITLE:(.+?)-->(\d+)\./g;
  let titleMatch;
  while ((titleMatch = commentTitleRegex.exec(questionSection)) !== null) {
    titleMap.set(parseInt(titleMatch[2], 10), titleMatch[1]);
  }
  
  // Also extract bracket titles like [EPICAC-9] before question numbers
  const knownTags = ['서답형', 'OUTPUT', 'OUPUT', '출력', '정답', '해설', 'output'];
  const bracketTitleRegex = /\[([^\]]+)\]\s*(\d+)\./g;
  let bracketMatch;
  while ((bracketMatch = bracketTitleRegex.exec(questionSection)) !== null) {
    const potentialTitle = bracketMatch[1].trim();
    if (!knownTags.some(tag => potentialTitle.toLowerCase() === tag.toLowerCase())) {
      const qNum = parseInt(bracketMatch[2], 10);
      if (!titleMap.has(qNum)) {
        titleMap.set(qNum, potentialTitle);
      }
    }
  }
  
  // Remove title comments and bracket titles before further processing
  let processedText = questionSection
    .replace(/<!--TITLE:.+?-->/g, '')
    .replace(/\[([^\]]*)\]\s*(?=\d+\.)/gm, (match, title) => {
      if (knownTags.some(tag => title.trim().toLowerCase() === tag.toLowerCase())) return match;
      return '';
    });
  
  const cleanedText = cleanUnwantedText(processedText);

  // Insert a missing newline before concatenated question starts like
  // "... life.46. 다음 글의 ..." or "... life.46다음 글의 ..."
  const normalizedQuestionBoundaries = cleanedText.replace(
    /([^\n])\s*(\d+)\.?\s*(\s*(?:\*\*\s*)?(?:\[서답형\]\s*)?(?:다음|글\s*\(가\)|주어진|아래|["“']))/g,
    '$1\n$2.$3'
  );
  
  // Protect T/F sub-item numbering from being split as separate questions
  // Replace "1. statement (T/F)" patterns with a placeholder to prevent splitting
  const tfProtected = normalizedQuestionBoundaries.replace(
    /(\n\s*)(\d+)\.\s+(.*?\(T\/F\))/g,
    (match, prefix, num, rest) => `${prefix}__TF${num}__ ${rest}`
  );
  
  // Protect numbered lines inside [정답] and [해설] sections from being split as separate questions
  // e.g., grammar correction answers: "1. *makes* → make (설명)"
  // and explanation lines: "1. 주어 'constant foehn winds'는..."
  const answerProtected = tfProtected
    .replace(
      /\[정답\]([\s\S]*?)(?=\[해설\]|$)/g,
      (match) => match.replace(/(\n\s*)(\d+)\.\s+/g, '$1__ANS$2__ ')
    )
    .replace(
      /\[해설\]([\s\S]*?)(?=\[정답\]|\n\s*\d+\.\s*\n\s*\[정답\]|\n\s*\d+\.\s*(?:\[서답형\]\s*)?(?:다음|글\s*\(가\)|주어진|아래|밑줄|빈칸|윗글|[""'])|$)/g,
      (match) => match.replace(/(\n\s*)(\d+)\.\s+/g, '$1__EXP$2__ ')
    );
  
  // Split by question number pattern (e.g., "1.", "2.", "10." etc.)
  const questionBlocks = answerProtected.split(/(?=(?:^|\n)\s*(?:\*\*)?\d+\.\s*(?:\*\*)?)/g).filter(block => block.trim())
    // Restore T/F numbering after splitting
    .map(block => block.replace(/__TF(\d+)__/g, '$1.'))
    // Restore answer numbering after splitting
    .map(block => block.replace(/__ANS(\d+)__\s/g, '$1. '))
    // Restore explanation numbering after splitting
    .map(block => block.replace(/__EXP(\d+)__\s/g, '$1. '));

  
  // All possible answer/explanation tag patterns (ordered by specificity)
  const findAnswerExplanation = (text: string): { content: string; answer: string; explanation: string; isWorkbook?: boolean; workbookAnswerLabel?: string } => {
    let answer = "";
    let explanation = "";
    let content = text;

    const parseWorkbookAnswerText = (rawAnswerText: string) => {
      return rawAnswerText
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .join(' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
    };

    text = text
      .replace(/\r\n/g, '\n')
      .replace(/^\s*정답\s*및\s*해설\s*[:：]?\s*/i, '')
      .replace(/\n\s*정답\s*및\s*해설\s*[:：]?\s*/gi, '\n')
      .trim();
    
    // Strategy 0-A: Grammar/Vocab workbook inline answer block
    // e.g. "어법 정답\n(1)that (2)in ..."
    const inlineWorkbookAnswerPattern = /\n\s*(어법|어휘)\s*정답\s*\n([\s\S]+)$/;
    const inlineWorkbookAnswerMatch = text.match(inlineWorkbookAnswerPattern);
    if (inlineWorkbookAnswerMatch && inlineWorkbookAnswerMatch.index !== undefined) {
      content = text.substring(0, inlineWorkbookAnswerMatch.index).trim();
      answer = parseWorkbookAnswerText(inlineWorkbookAnswerMatch[2]);
      const answerLabel = `${inlineWorkbookAnswerMatch[1]} 정답`;
      return { content, answer, explanation, isWorkbook: true, workbookAnswerLabel: answerLabel };
    }

    // Strategy 0-B: Grammar/Vocab workbook answer table
    // Detect "어법 정답" or "어휘 정답" followed by pipe-delimited table
    const grammarAnswerPattern = /\n\s*(?:어법|어휘)\s*정답\s*\n((?:\s*\|[^\n]+\|\s*\n?)+)/;
    const grammarAnswerMatch = text.match(grammarAnswerPattern);
    if (grammarAnswerMatch && grammarAnswerMatch.index !== undefined) {
      content = text.substring(0, grammarAnswerMatch.index).trim();
      const tableText = grammarAnswerMatch[1];
      const answerParts: string[] = [];
      const tableRows = tableText.split('\n').filter((line) => line.trim().startsWith('|'));

      for (const row of tableRows) {
        const cells = row.split('|').filter((cell) => cell.trim()).map((cell) => cell.trim());
        if (cells.length >= 2 && !cells.every((cell) => /^-+$/.test(cell))) {
          answerParts.push(`${cells[0]} ${cells[1]}`);
        }
      }

      answer = answerParts.join(' ');
      const tableLabel = grammarAnswerMatch[0].includes('어법') ? '어법 정답' : '어휘 정답';
      return { content, answer, explanation, isWorkbook: true, workbookAnswerLabel: tableLabel };
    }

    // Strategy 1: Bracketed tags [정답], [해설]
    const bracketAnswerIdx = text.indexOf("[정답]");
    const bracketExplIdx = text.indexOf("[해설]");
    
    if (bracketAnswerIdx !== -1 || bracketExplIdx !== -1) {
      if (bracketAnswerIdx !== -1 && bracketExplIdx !== -1) {
        if (bracketAnswerIdx < bracketExplIdx) {
          content = text.substring(0, bracketAnswerIdx).trim();
          answer = text.substring(bracketAnswerIdx + 4, bracketExplIdx).trim();
          explanation = text.substring(bracketExplIdx + 4).trim();
        } else {
          content = text.substring(0, bracketExplIdx).trim();
          explanation = text.substring(bracketExplIdx + 4, bracketAnswerIdx).trim();
          answer = text.substring(bracketAnswerIdx + 4).trim();
        }
      } else if (bracketAnswerIdx !== -1) {
        content = text.substring(0, bracketAnswerIdx).trim();
        answer = text.substring(bracketAnswerIdx + 4).trim();
      } else {
        content = text.substring(0, bracketExplIdx).trim();
        explanation = text.substring(bracketExplIdx + 4).trim();
      }
      // For multi-line numbered answers (e.g., grammar correction: "1. *X* → Y"), keep all lines
      const isMultiLineAnswer = /^\s*\d+\.\s+/.test(answer) && answer.split('\n').filter(l => /^\s*\d+\.\s+/.test(l)).length >= 2;
      return { content, answer: isMultiLineAnswer ? answer.trim() : answer.split('\n')[0].trim(), explanation };
    }
    
    // Strategy 2: Various unbracketed patterns
    // Match patterns like: "정답: ②", "정답 : ②", "정답은 ②번", "정답② ", "② 정답"
    // These typically appear AFTER the last choice (⑤...) on a new line
    const answerPatterns = [
      // "정답: ②" or "정답 : ②번입니다" etc.
      /\n\s*정답\s*[:：]\s*([^\n]*)/,
      // "정답은 ②번입니다" or "정답은 ②"
      /\n\s*정답은\s+([^\n]*)/,
      // "② 정답" at start of line (after choices section)
      /\n\s*([①②③④⑤])\s*정답\s*/,
      // "⑤ ... 정답" - answer marker at end of a choice line (after all 5 choices)
      /([①②③④⑤][^\n①②③④⑤]*?)\s+정답\s*$/m,
      // Standalone circled number on its own line after choices (like "②")
      /(?<=⑤[^\n]*\n)\s*([①②③④⑤])\s*$/m,
    ];
    
    const explanationPatterns = [
      // "해설:" or "해설 :" 
      /\n\s*해설\s*[:：]\s*/,
      // "해설 정답은" or just "해설\n"
      /\n\s*해설\s+/,
      // "[해설]" already handled above, but also 〈해설〉
      /\n\s*[〈<]해설[〉>]\s*/,
    ];
    
    // Try to find answer section first
    let answerStartIdx = -1;
    let answerMatch: RegExpMatchArray | null = null;
    
    for (const pattern of answerPatterns) {
      const match = text.match(pattern);
      if (match && match.index !== undefined) {
        // Validate: answer marker should be AFTER the last choice (①-⑤)
        const lastChoiceIdx = Math.max(
          text.lastIndexOf('⑤'),
          text.lastIndexOf('5.')
        );
        if (match.index > lastChoiceIdx || lastChoiceIdx === -1) {
          answerMatch = match;
          answerStartIdx = match.index;
          break;
        }
      }
    }
    
    // Try to find explanation section
    let explStartIdx = -1;
    let explMatch: RegExpMatchArray | null = null;
    
    for (const pattern of explanationPatterns) {
      const match = text.match(pattern);
      if (match && match.index !== undefined) {
        explMatch = match;
        explStartIdx = match.index;
        break;
      }
    }
    
    // Extract based on what was found
    if (answerStartIdx !== -1 && explStartIdx !== -1) {
      const firstIdx = Math.min(answerStartIdx, explStartIdx);
      content = text.substring(0, firstIdx).trim();
      
      if (answerStartIdx < explStartIdx) {
        const answerText = text.substring(answerStartIdx, explStartIdx);
        answer = answerText.replace(/^\n?\s*정답\s*[:：]?\s*(?:은\s+)?/i, '').trim();
        // Handle "⑤ ... 정답" format - extract the circled number
        if (!answer && answerMatch) {
          answer = answerMatch[1] || '';
        }
        explanation = text.substring(explStartIdx).replace(/^\n?\s*(?:해설|[〈<]해설[〉>])\s*[:：]?\s*/i, '').trim();
      } else {
        explanation = text.substring(explStartIdx, answerStartIdx).replace(/^\n?\s*(?:해설|[〈<]해설[〉>])\s*[:：]?\s*/i, '').trim();
        const answerText = text.substring(answerStartIdx);
        answer = answerText.replace(/^\n?\s*정답\s*[:：]?\s*(?:은\s+)?/i, '').trim();
        if (!answer && answerMatch) {
          answer = answerMatch[1] || '';
        }
      }
    } else if (answerStartIdx !== -1) {
      content = text.substring(0, answerStartIdx).trim();
      const answerSection = text.substring(answerStartIdx);
      // Check if explanation is embedded in the answer section (multi-line)
      const answerClean = answerSection.replace(/^\n?\s*정답\s*[:：]?\s*(?:은\s+)?/i, '').replace(/^\n?\s*([①②③④⑤])\s*정답\s*/i, '$1').trim();
      const answerLineBreak = answerClean.indexOf('\n');
      if (answerLineBreak !== -1) {
        answer = answerClean.substring(0, answerLineBreak).trim();
        const rest = answerClean.substring(answerLineBreak).trim();
        // Check if remainder looks like explanation
        if (rest.length > 20) {
          explanation = rest.replace(/^해설\s*[:：]?\s*/i, '').trim();
        }
      } else {
        answer = answerClean;
      }
      if (!answer && answerMatch) {
        answer = answerMatch[1] || '';
      }
    } else if (explStartIdx !== -1) {
      content = text.substring(0, explStartIdx).trim();
      explanation = text.substring(explStartIdx).replace(/^\n?\s*(?:해설|[〈<]해설[〉>])\s*[:：]?\s*/i, '').trim();
    }
    
    // Strategy 3: Fallback - look for answer pattern after the last ⑤ choice line
    if (!answer && !explanation) {
      // Find if there's a Korean paragraph after the last English choice that looks like an answer/explanation
      const lastFiveIdx = text.lastIndexOf('⑤');
      if (lastFiveIdx !== -1) {
        const afterFive = text.substring(lastFiveIdx);
        // Find end of the ⑤ choice line
        const endOfFiveLine = afterFive.indexOf('\n');
        if (endOfFiveLine !== -1) {
          const remainder = afterFive.substring(endOfFiveLine).trim();
          // If remainder starts with Korean or circled number, it's likely answer/explanation
          if (remainder && /^[가-힣①②③④⑤\d]/.test(remainder)) {
            content = text.substring(0, lastFiveIdx + endOfFiveLine).trim();
            // Try to extract answer from first line
            const remainderLines = remainder.split('\n');
            const firstLine = remainderLines[0].trim();
            
            // Check if first line is just an answer marker
            const simpleAnswer = firstLine.match(/^([①②③④⑤])\s*(?:번\s*)?(?:정답)?$/);
            if (simpleAnswer) {
              answer = simpleAnswer[1];
              if (remainderLines.length > 1) {
                explanation = remainderLines.slice(1).join('\n').trim();
              }
            } else {
              // Check for "②번입니다" or "정답은 ②번" patterns
              const ansNum = firstLine.match(/([①②③④⑤])\s*번?\s*(?:입니다|이다|입니다\.)?/);
              if (ansNum) {
                answer = ansNum[1];
                explanation = remainder.replace(firstLine, '').trim();
                if (!explanation && firstLine.length > 10) {
                  explanation = firstLine;
                }
              } else if (firstLine.length > 30) {
                // Long text after choices - likely explanation with embedded answer
                const embeddedAns = firstLine.match(/([①②③④⑤])\s*번/);
                if (embeddedAns) {
                  answer = embeddedAns[1];
                }
                explanation = remainder;
              }
            }
          }
        }
      }
    }
    
    // Clean answer: only keep first line, remove trailing garbage
    answer = answer.split('\n')[0].trim();
    // Remove trailing "해설" if accidentally included
    answer = answer.replace(/\s*해설\s*[:：]?\s*$/, '').trim();
    
    return { content, answer, explanation };
  };
  
  questionBlocks.forEach((block) => {
    let lines = block.trim();
    
    if (lines.startsWith('#') || lines.match(/^[-=]+$/)) return;
    
    const numberMatch = lines.match(/^(?:\*\*)?(\d+)\.\s*(?:\*\*)?/);
    if (!numberMatch) return;
    
    const questionNumber = parseInt(numberMatch[1], 10);
    
    const { content: rawContent, answer: inlineAnswer, explanation: inlineExplanation, isWorkbook, workbookAnswerLabel } = findAnswerExplanation(lines);
    
    // Remove the question number from content while preserving the rest of the formatting
    let content = rawContent.replace(/^(?:\*\*)?\d+\.\s*(?:\*\*)?\s*/, '').trim();

    // Strip structural labels: "문제 유형:", "지문:", "선택지:", "밑줄 친 부분:" etc.
    content = content
      .replace(/^문제\s*유형\s*[:：]\s*\S+\s*/i, '')
      .replace(/^\s*지문\s*[:：]\s*/im, '')
      .replace(/^\s*선택지\s*[:：]\s*/im, '')
      .replace(/^\s*밑줄\s*친\s*부분\s*[:：]\s*/im, '')
      .trim();
    
    // Extract passage title from pre-extracted titleMap
    let passageTitle = titleMap.get(questionNumber) || '';
    // Also try bracket-based title extraction [Title] at start of content
    if (!passageTitle) {
      const titleMatch = content.match(/^\[([^\]]+)\]\s*/);
      if (titleMatch) {
        const potentialTitle = titleMatch[1];
        const knownTags = ['서답형', 'OUTPUT', 'OUPUT', '출력', '정답', '해설'];
        if (!knownTags.includes(potentialTitle)) {
          passageTitle = potentialTitle;
          content = content.substring(titleMatch[0].length);
        }
      }
    }
    
    // Remove only structural markdown noise, but keep actual bold text from Word
    content = content
      .replace(/^#+\s*/gm, '')
      .trim();
    
    const hasRealContent = content.length > 0 && content !== '.';
    
    if (hasRealContent) {
      // Merge answer from the separate answer section if available
      const sectionAnswer = answerMap.get(questionNumber);
      const finalAnswer = inlineAnswer || sectionAnswer?.answer || '';
      const finalExplanation = inlineExplanation || sectionAnswer?.explanation || '';

      questions.push({
        number: questionNumber,
        content,
        answer: finalAnswer,
        explanation: finalExplanation,
        passageTitle: passageTitle || undefined,
        isWorkbook: isWorkbook || false,
        workbookAnswerLabel: workbookAnswerLabel || undefined
      });
    }
  });
  
  return questions;
};
interface QuizBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialQuestions?: string[];
}
export function QuizBookDialog({
  open,
  onOpenChange,
  initialQuestions
}: QuizBookDialogProps) {
  const { toast } = useToast();
  const [inputText, setInputText] = useState("");
  const [title, setTitle] = useState("ORUN ENGLISH EXERCISE BOOK");
  const [subtitle, setSubtitle] = useState("");
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const printRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.docx')) {
      toast({
        title: "파일 형식 오류",
        description: "Word 문서(.docx) 파일만 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }

    setIsParsingFile(true);
    setUploadedFileName(file.name);

    try {
      const arrayBuffer = await file.arrayBuffer();
      // Use convertToHtml to preserve <u> tags for underlined text
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;

      // Convert HTML to plain text while preserving <u> tags and structure
      const domParser = new DOMParser();
      const parsedDoc = domParser.parseFromString(html, 'text/html');
      
      // Global counter for <ol><li> numbering (mammoth wraps each numbered item in separate <ol>)
      let globalListCounter = 0;
      
      const extractText = (node: Node): string => {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.textContent || '';
        }
        if (node.nodeType !== Node.ELEMENT_NODE) return '';
        
        const el = node as Element;
        const tag = el.tagName.toLowerCase();
        
        // Preserve <u> tags for underlined text (①<u>word</u> patterns)
        if (tag === 'u') {
          const inner = Array.from(el.childNodes).map(extractText).join('');
          return `<u>${inner}</u>`;
        }
        
        // Preserve <strong>/<em> for bold/italic
        if (tag === 'strong' || tag === 'b') {
          const inner = Array.from(el.childNodes).map(extractText).join('');
          return `**${inner}**`;
        }

        // Handle <li> inside <ol> - prepend question number
        if (tag === 'li' && el.parentElement?.tagName.toLowerCase() === 'ol') {
          globalListCounter++;
          const children = Array.from(el.childNodes).map(extractText).join('');
          return `${globalListCounter}. ${children}\n`;
        }
        
        const children = Array.from(el.childNodes).map(extractText).join('');
        
        // Add newlines for block elements
        if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br'].includes(tag)) {
          return children + '\n';
        }
        
        return children;
      };
      
      let text = extractText(parsedDoc.body);
      
      // Clean up excessive newlines
      text = text.replace(/\n{3,}/g, '\n\n').trim();
      
      setInputText(text);
      toast({
        title: "파일 업로드 완료",
        description: `${file.name} 파일을 성공적으로 파싱했습니다.`,
      });
    } catch (error) {
      console.error("Error parsing file:", error);
      toast({
        title: "파일 파싱 오류",
        description: "Word 파일을 읽는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsParsingFile(false);
      // Reset file input so same file can be re-uploaded
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  
  // When dialog opens with initial questions, set them automatically
  useEffect(() => {
    if (open && initialQuestions && initialQuestions.length > 0) {
      setInputText(initialQuestions.join("\n\n"));
    }
  }, [open, initialQuestions]);
  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;800&family=Orbitron:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Noto Sans KR', sans-serif; }
          @page { size: A4; margin: 0; }
          @media print {
            body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .quiz-page { page-break-after: always; }
            .quiz-page:last-child { page-break-after: auto; }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };
  const handleClose = () => {
    setInputText("");
    onOpenChange(false);
  };

  // Live preview parsing - titles are now extracted from <!--TITLE:...--> metadata in parseQuestions
  const rawQuestions = parseQuestions(inputText);
  // Renumber sequentially after filtering out failed generations
  const liveQuestions = rawQuestions.map((q, idx) => ({ ...q, number: idx + 1 }));

  // Estimate question "weight" for pagination
  // weight 1 = small (can fit 2 per column), weight 2 = large (needs full column alone)
  const getQuestionWeight = (q: ParsedQuestion): number => {
    if (q.isWorkbook) return 4;
    
    const contentLength = q.content.length;
    const lineCount = q.content.split('\n').filter(l => l.trim()).length;
    const hasOptions = /[①②③④⑤]/.test(q.content);
    const hasTable = /\|.*\|/.test(q.content);
    const hasSummaryBox = /<box>/.test(q.content) || /\[요약문\]/.test(q.content);
    
    // Large - takes a full column (1 question per column)
    if (contentLength > 900 || lineCount > 16) return 2;
    if ((hasOptions || hasTable || hasSummaryBox) && (contentLength > 600 || lineCount > 12)) return 2;
    // Small - can pair 2 per column
    return 1;
  };

  // Distribute questions into pages with 2-column layout
  // Goal: left col gets questions, right col gets questions
  // Small questions: 2 per column (4 per page), Large questions: 1 per column
  const questionPages: ParsedQuestion[][] = [];
  let i = 0;
  
  while (i < liveQuestions.length) {
    const page: ParsedQuestion[] = [];
    let leftWeight = 0;
    let rightWeight = 0;
    const MAX_COL_WEIGHT = 2; // Each column can hold weight 2 (two small or one large)
    
    // Fill left column first, then right column
    while (i < liveQuestions.length) {
      const q = liveQuestions[i];
      const w = getQuestionWeight(q);
      
      if (w >= 4) {
        // Workbook: full page
        if (page.length > 0) break;
        page.push(q);
        i++;
        break;
      }
      
      if (leftWeight + w <= MAX_COL_WEIGHT) {
        page.push(q);
        leftWeight += w;
        i++;
      } else if (rightWeight + w <= MAX_COL_WEIGHT) {
        page.push(q);
        rightWeight += w;
        i++;
      } else {
        break;
      }
    }
    
    if (page.length > 0) {
      questionPages.push(page);
    }
  }
  
  // Balance: if last page has only 1 small question, steal from previous page
  if (questionPages.length > 1) {
    const lastPage = questionPages[questionPages.length - 1];
    if (lastPage.length === 1 && getQuestionWeight(lastPage[0]) === 1) {
      const prevPage = questionPages[questionPages.length - 2];
      if (prevPage.length >= 3) {
        const stolen = prevPage.pop()!;
        lastPage.unshift(stolen);
      }
    }
  }

  // Create answer pages (compact - many answers per page with 2 columns)
  // Only include questions that have answer or explanation, sorted by number
  const questionsWithAnswers = liveQuestions
    .filter(q => (q.answer || q.explanation) && !q.isWorkbook)
    .sort((a, b) => a.number - b.number);
  
  // Dynamically paginate answers based on content length to prevent overflow
  const answerPages: ParsedQuestion[][] = [];
  let currentPage: ParsedQuestion[] = [];
  let currentWeight = 0;
  const MAX_WEIGHT_PER_PAGE = 30;
  
  for (const q of questionsWithAnswers) {
    const explanationLength = (q.explanation || '').length + (q.answer || '').length;
    // Longer explanations get more weight
    let weight = 1;
    if (explanationLength > 500) weight = 4;
    else if (explanationLength > 300) weight = 3;
    else if (explanationLength > 150) weight = 2;
    
    if (currentWeight + weight > MAX_WEIGHT_PER_PAGE && currentPage.length > 0) {
      answerPages.push(currentPage);
      currentPage = [];
      currentWeight = 0;
    }
    currentPage.push(q);
    currentWeight += weight;
  }
  if (currentPage.length > 0) {
    answerPages.push(currentPage);
  }
  const totalQuestionPages = questionPages.length;
  const totalAnswerPages = answerPages.length;
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw] max-h-[95vh] w-[1600px] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-slate-800 to-slate-700">
          <DialogTitle className="flex items-center gap-2 text-xl text-white">
            <BookOpen className="w-5 h-5 text-amber-400" />
            문제집 생성기
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-[calc(95vh-80px)]">
          {/* Left Panel - Input */}
          <div className="w-[400px] flex-shrink-0 border-r bg-slate-50 overflow-y-auto p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                문서 제목 (헤더)
              </label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="\uC633\uC740\uC601\uC5B4 EXERCISE BOOK" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                부제목 (선택사항)
              </label>
              <Input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="예: Chapter 1 - 동사의 시제" />
            </div>
            {/* Word File Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Word 파일 업로드 (.docx)
              </label>
              <div
                onClick={() => !isParsingFile && fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:border-slate-500 hover:bg-slate-100 transition-colors"
              >
                {isParsingFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
                    <span className="text-sm text-slate-600">파일 분석 중...</span>
                  </div>
                ) : uploadedFileName ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="w-5 h-5 text-slate-600" />
                    <span className="text-sm text-slate-700">{uploadedFileName}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Upload className="w-5 h-5 text-slate-400" />
                    <span className="text-sm text-slate-500">클릭하여 Word 파일 업로드</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                생성된 문제를 붙여넣기 하세요
              </label>
              <Textarea value={inputText} onChange={e => setInputText(e.target.value)} className="min-h-[300px] font-mono text-sm" placeholder="문제를 여기에 붙여넣기 또는 위에서 Word 파일 업로드.." />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={handleClose} size="sm">
                취소
              </Button>
              <Button onClick={handlePrint} disabled={liveQuestions.length === 0} className="flex-1 gap-2 bg-slate-800 hover:bg-slate-700 text-white" size="sm">
                <Printer className="w-4 h-4" />
                PDF로 저장 / 인쇄
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              * 오른쪽에서 실시간 미리보기를 확인할 수 있습니다.
            </p>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="flex-1 overflow-y-auto bg-slate-300 p-6">
            {liveQuestions.length === 0 ? <div className="flex items-center justify-center h-full text-slate-500">
                <div className="text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">미리보기</p>
                  <p className="text-sm">왼쪽에 문제를 입력하면 여기에 표시됩니다.</p>
                </div>
              </div> : <div ref={printRef} className="space-y-6">
                {/* Question Pages */}
                {questionPages.map((pageQuestions, pageIndex) => {
                  // Check if page has a workbook question (full-width, single column)
                  const isWorkbookPage = pageQuestions.some(q => q.isWorkbook);
                  
                  // For normal pages: distribute into left/right columns by weight
                  const leftCol: ParsedQuestion[] = [];
                  const rightCol: ParsedQuestion[] = [];
                  if (!isWorkbookPage) {
                    let leftW = 0;
                    let rightW = 0;
                    pageQuestions.forEach((q) => {
                      const w = getQuestionWeight(q);
                      if (leftW <= rightW) {
                        leftCol.push(q);
                        leftW += w;
                      } else {
                        rightCol.push(q);
                        rightW += w;
                      }
                    });
                  }
                  
                  return (
                    <div key={`q-${pageIndex}`} className="quiz-page bg-white mx-auto" style={{
                      width: "210mm",
                      minHeight: "297mm",
                      padding: "8mm 10mm",
                      fontFamily: "'Noto Sans KR', sans-serif",
                      fontSize: "8pt",
                      lineHeight: "1.5",
                      boxSizing: "border-box",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                      display: "flex",
                      flexDirection: "column"
                    }}>
                      <PageHeader title={title} subtitle={subtitle} />

                      {isWorkbookPage ? (
                        <div style={{ flex: 1 }}>
                          {pageQuestions.map((q, i) => <QuestionBlock key={i} question={q} isFullWidth />)}
                        </div>
                      ) : (
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          columnGap: "6mm",
                          flex: 1,
                          alignContent: "start"
                        }}>
                          <div style={{
                            paddingRight: "4mm",
                            borderRight: "1px solid #e2e8f0",
                            display: "flex",
                            flexDirection: "column",
                            gap: "4mm"
                          }}>
                            {leftCol.map((q, i) => <QuestionBlock key={i} question={q} />)}
                          </div>
                          <div style={{
                            paddingLeft: "4mm",
                            display: "flex",
                            flexDirection: "column",
                            gap: "4mm"
                          }}>
                            {rightCol.map((q, i) => <QuestionBlock key={i} question={q} />)}
                          </div>
                        </div>
                      )}

                      <PageFooter pageNum={pageIndex + 1} totalPages={totalQuestionPages + totalAnswerPages} />
                    </div>
                  );
                })}

                {/* Answer/Explanation Pages */}
                {answerPages.map((pageAnswers, pageIndex) => <div key={`a-${pageIndex}`} className="quiz-page bg-white mx-auto" style={{
              width: "210mm",
              minHeight: "297mm",
              padding: "8mm 10mm",
              fontFamily: "'Noto Sans KR', sans-serif",
              fontSize: "9pt",
              lineHeight: "1.6",
              boxSizing: "border-box",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
              display: "flex",
              flexDirection: "column"
            }}>
                    {/* Header for Answer Section */}
                    <header style={{
                background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                padding: "8px 14px",
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                      <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px"
                }}>
                        <img src="/lovable-uploads/orun-academy-new-logo.jpg" alt="Logo" style={{
                    height: "28px",
                    width: "auto",
                    borderRadius: "6px"
                  }} />
                        <div style={{
                    fontSize: "11pt",
                    fontWeight: "700",
                    fontFamily: "'Orbitron', sans-serif",
                    color: "#fff",
                    letterSpacing: "1px"
                  }}>
                          {title} - 정답 및 해설
                        </div>
                      </div>
                      <div style={{
                  fontSize: "9pt",
                  color: "#94a3b8",
                  fontWeight: "500"
                }}>
                        {totalQuestionPages + pageIndex + 1} / {totalQuestionPages + totalAnswerPages}
                      </div>
                    </header>

                    {/* Two-column layout for answers - flowing top to bottom, left then right */}
                    <div style={{
                columnCount: 2,
                columnGap: "3mm",
                flex: 1
              }}>
                      {pageAnswers.map((q, idx) => <AnswerBlock key={idx} question={q} />)}
                    </div>

                    <PageFooter pageNum={totalQuestionPages + pageIndex + 1} totalPages={totalQuestionPages + totalAnswerPages} />
                  </div>)}
              </div>}
          </div>
        </div>
      </DialogContent>
    </Dialog>;
}
function PageHeader({
  title,
  subtitle
}: {
  title: string;
  subtitle?: string;
}) {
  return <header style={{
    background: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)",
    padding: "10px 16px",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden"
  }}>
      {/* Decorative geometric pattern overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        opacity: 0.08,
        backgroundImage: `
          repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.5) 8px, rgba(255,255,255,0.5) 9px),
          repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(255,255,255,0.5) 8px, rgba(255,255,255,0.5) 9px)
        `,
        pointerEvents: "none"
      }} />
      {/* Left accent line */}
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: "3px",
        background: "linear-gradient(180deg, #f59e0b, #eab308, #f59e0b)"
      }} />
      {/* Right decorative dots */}
      <div style={{
        position: "absolute",
        right: "60px",
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        gap: "4px",
        opacity: 0.15
      }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            backgroundColor: "#fff"
          }} />
        ))}
      </div>
      {/* Bottom accent stripe */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "2px",
        background: "linear-gradient(90deg, #f59e0b 0%, #eab308 30%, transparent 60%)"
      }} />
      <div style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      position: "relative",
      zIndex: 1
    }}>
        <img src="/lovable-uploads/orun-academy-new-logo.jpg" alt="Logo" style={{
        height: "28px",
        width: "auto",
        borderRadius: "6px"
      }} />
        <div style={{
        fontSize: "11pt",
        fontWeight: "700",
        fontFamily: "'Orbitron', sans-serif",
        color: "#fff",
        letterSpacing: "1px"
      }}>
          {title}
        </div>
      </div>
      {subtitle && <div style={{
      fontSize: "9pt",
      fontWeight: "500",
      fontFamily: "'Noto Sans KR', sans-serif",
      color: "rgba(255,255,255,0.85)",
      textAlign: "right",
      position: "relative",
      zIndex: 1
    }}>
          {subtitle}
        </div>}
    </header>;
}
function PageFooter({
  pageNum,
  totalPages
}: {
  pageNum: number;
  totalPages: number;
}) {
  return <footer style={{
    marginTop: "auto",
    paddingTop: "12px",
    borderTop: "2px solid #1e293b",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  }}>
      <span style={{
      fontSize: "8pt",
      color: "#64748b",
      fontWeight: "500"
    }}>
        © {new Date().getFullYear()} ORUN ENGLISH
      </span>
      <span style={{
      fontSize: "9pt",
      color: "#1e293b",
      fontWeight: "600"
    }}>
        {pageNum} / {totalPages}
      </span>
      <span style={{
      fontSize: "8pt",
      color: "#94a3b8"
    }}>
        All rights reserved.
      </span>
    </footer>;
}
function QuestionBlock({
  question,
  isFullWidth = false
}: {
  question: ParsedQuestion;
  isFullWidth?: boolean;
}) {
  return <article style={{
    marginBottom: "16px"
  }}>
      {/* Question content with number */}
      <div style={{
      fontSize: isFullWidth ? "9.5pt" : "9pt",
      color: "#1e293b",
      lineHeight: isFullWidth ? "2.0" : "1.9",
      fontFamily: "'Noto Sans KR', sans-serif"
    }}>
        <QuestionContent content={question.content} questionNumber={question.number} isFullWidth={isFullWidth} passageTitle={question.passageTitle} />
      </div>

      {/* Inline answer for workbook-type questions */}
      {question.isWorkbook && question.answer && (
        <div style={{
          marginTop: "14px",
          fontSize: isFullWidth ? "8.5pt" : "7.5pt",
          lineHeight: "1.7",
          color: "#6b7280"
        }}>
          <div style={{
            fontWeight: "700",
            fontSize: isFullWidth ? "9pt" : "8pt",
            marginBottom: "6px",
            color: "#6b7280"
          }}>
            {question.number}. {question.workbookAnswerLabel || '정답'}
          </div>
          <div style={{
            fontWeight: "500",
            lineHeight: "1.8",
            color: "#6b7280"
          }}>
            {question.answer}
          </div>
        </div>
      )}
    </article>;
}
function AnswerBlock({
  question
}: {
  question: ParsedQuestion;
}) {
  return <div style={{
    padding: "4px 6px",
    borderBottom: "1px solid #e2e8f0",
    fontSize: "8pt",
    lineHeight: "1.6",
    breakInside: "avoid"
  }}>
      <div style={{
      display: "flex",
      gap: "4px",
      alignItems: "flex-start"
    }}>
        <span style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "16px",
        height: "16px",
        backgroundColor: "#1e293b",
        color: "#fff",
        borderRadius: "3px",
        fontSize: "8pt",
        fontWeight: "700",
        flexShrink: 0
      }}>
          {question.number}
        </span>
        <div
          contentEditable
          suppressContentEditableWarning
          style={{ flex: 1, outline: "none", cursor: "text" }}
        >
          <div style={{
            fontWeight: "700",
            color: "#1e293b",
            fontSize: "8pt"
          }}>
            정답: <span style={{
              color: "#1e293b",
              fontWeight: "600",
              whiteSpace: "pre-wrap"
            }}>{question.answer.replace(/\*/g, '').replace(/\[\[/g, '').replace(/\]\]/g, '')}</span>
          </div>
          {question.explanation && <div style={{
            color: "#475569",
            fontSize: "7.5pt",
            marginTop: "1px",
            whiteSpace: "pre-wrap"
          }}>
            {question.explanation.replace(/\*/g, '').replace(/\[\[/g, '').replace(/\]\]/g, '')}
          </div>}
        </div>
      </div>
    </div>;
}
// Preprocess grammar-style underlines: ①word → ①<u>word</u>
function preprocessGrammarUnderlines(text: string): string {
  if (!text || text.includes('<u>')) return text;
  // Check for markers followed by text (with or without space)
  const hasPattern = /[①-⑤ⓐ-ⓕ]\s*[a-zA-Z]/.test(text);
  if (!hasPattern) return text;

  // Check if markers are embedded within a longer passage (어휘-style)
  // In vocabulary questions, markers appear inline within sentences: "...that ①enhance the..."
  // In these cases, only underline the word(s) immediately after the marker (1-3 words)
  const textWithoutMarkers = text.replace(/[①-⑤ⓐ-ⓕ]/g, '').trim();
  const isEmbeddedInPassage = textWithoutMarkers.length > 150 && 
    !/^[①-⑤ⓐ-ⓕ]/.test(text.trim());

  if (isEmbeddedInPassage) {
    // Vocabulary-style: only underline 1-3 words right after the marker
    return text.replace(
      /([①-⑤ⓐ-ⓕ])\s*([a-zA-Z]+(?:\s+[a-zA-Z]+){0,2})/g,
      (match, num, words) => {
        const clean = words.trim();
        if (clean.length < 1) return match;
        return `${num}<u>${clean}</u>`;
      }
    );
  }

  // For referential inference style: markers before full sentences
  // Underline from marker to the next marker, period+space+Capital, or end
  return text.replace(
    /([①-⑤ⓐ-ⓕ])\s*([a-zA-Z][^①-⑤ⓐ-ⓕ]*?)(?=\s*[①-⑤ⓐ-ⓕ]|\.\s+[A-Z]|\.\s*$|,\s+(?:and |but |or |so )|$)/g,
    (match, num, phrase) => {
      const clean = phrase.trim();
      if (clean.length < 1) return match;
      return `${num}<u>${clean}</u>`;
    }
  );
}

// Helper function to render text with <u> tags as actual underlines
function renderWithUnderlines(text: string): React.ReactNode {
  if (!text) return null;
  
  // Split by <u>...</u> pattern
  const parts = text.split(/(<u>.*?<\/u>)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('<u>') && part.endsWith('</u>')) {
      // Extract content between <u> and </u>
      const content = part.slice(3, -4);
      return <span key={index} style={{ textDecoration: 'underline' }}>{content}</span>;
    }
    return part;
  });
}

function QuestionContent({
  content,
  questionNumber,
  isFullWidth = false,
  passageTitle
}: {
  content: string;
  questionNumber: number;
  isFullWidth?: boolean;
  passageTitle?: string;
}) {
  // Smart parsing: handle both line-separated and continuous text
  const parseContent = () => {
    let passageText = "";
    let questionText = "";
    let instructionText = "";
    let choiceLines: string[] = [];
    let boxiLines: string[] = [];
    let conditionSection = "";
    let subQuestions: string[] = [];
    let orderBlocks: { label: string; text: string }[] = []; // (A), (B), (C) blocks
    let tableData: string[][] = []; // For table format data
    let summaryBox = ""; // Summary sentence with (A), (B) blanks
    let blankAnswerLines: string[] = []; // Standalone (A)/(B)/(C) answer lines under summary/questions

    // Clean up content first - normalize parsed Word headings and remove unwanted markers
    let remaining = normalizeParsedDocumentText(content)
      .replace(/^---+$/gm, '')
      .replace(/^문제\s*$/gm, '')
      .replace(/^선택지\s*$/gm, '')
      .replace(/^### Images from page.*$/gm, '')
      .replace(/`parsed-documents:.*?`/g, '')
      .replace(/\(full page screenshot\)/g, '')
      .replace(/^지문\s*[:：]\s*$/gm, '')
      .replace(/^정답\s*및\s*해설\s*[:：]?\s*$/gim, '')
      .replace(/^\s*\[?요약문\]?\s*$/gim, '')
      // Decode HTML entities from document parser
      .replace(/&#x3C;/g, '<')
      .replace(/&#x3E;/g, '>')
      .replace(/&amp;/g, '&')
      .trim();

    // Check if this is a [서답형] question
    const isSeodapType = remaining.includes('[서답형]') || remaining.includes('서답형');
    remaining = remaining.replace(/\[서답형\]\s*/g, '').trim();

    // Extract explicit labeled instruction block first: "문제 발문: ..."
    const labeledInstructionMatch = remaining.match(/^\s*문제\s*발문\s*[:：]\s*([\s\S]*?)(?=\n\s*지문\s*[:：]|\n\s*\[?정답|\n\s*정답\s*및\s*해설|$)/i);
    if (labeledInstructionMatch) {
      instructionText = labeledInstructionMatch[1].trim();
      remaining = remaining.substring(labeledInstructionMatch[0].length).trim();
    }

    // Remove structural labels that should not appear in rendered passage
    remaining = remaining
      .replace(/^\s*지문\s*[:：]\s*/i, '')
      .replace(/\n\s*지문\s*[:：]\s*/gi, '\n')
      .replace(/\n\s*정답\s*및\s*해설\s*[:：]?\s*$/gi, '')
      .replace(/\n\s*밑줄\s*친\s*부분\s*[:：]\s*\n/gi, '\n')
      .replace(/\n\s*어법\s*오류\s*설명\s*[:：]?\s*$/gim, '')
      .replace(/\n\s*어휘\s*오류\s*설명\s*[:：]?\s*$/gim, '')
      .replace(/\n\s*정답\s*선택지\s*$/gim, '')
      .trim();

    // Extract Korean instruction - comprehensive patterns
    if (!instructionText) {
      const instructionPatterns = [
        // Match instruction ending with parenthetical note like (단, ...말 것)
        /^(.*?(?:단어는\?|사실은\?|것은\?|않은 것은\?|고르시오\.|고르시오|쓰시오\.|쓰시오|것을 고르시오\.|것을 고르시오|개인가\?|맞는 것은\?|틀린 것은\?|알맞은 것은\?|적절한 것은\?|옳은 것은\?|일치하는 것은\?|일치하지 않는 것은\?|가장 적절한 것은\?|찾아 쓰시오\.|찾아 그대로 쓰시오\.|것을 찾아 쓰시오\.|고치시오\.|올바르게 고치시오\.|바꾸어 쓰시오\.|답하시오\.|답하시오|완성하시오\.|완성하시오|모두 고르시오\.|몇 개인가\?|것은 몇 개인가\?|어느 것인가\?|설명으로 옳지 않은 것은\?|대화는\?|질문을 모두 고르시오\.)(?:\s*\([^)]*\))?)\s*/i,
        /^(다음 글의 .*?가장 적절한 것은\?(?:\s*\([^)]*\))?)\s*/,
        /^(다음 글의 .*?고르시오\.?(?:\s*\([^)]*\))?)\s*/,
        /^(다음 중 .*?고르시오\.?(?:\s*\([^)]*\))?)\s*/,
        /^(다음 글의 .*?사실은\?(?:\s*\([^)]*\))?)\s*/,
        /^(글\s*\(가\).*?단어는\?(?:\s*\([^)]*\))?)\s*/,
        /^(다음 중 .*?것은\?(?:\s*\([^)]*\))?)\s*/,
        /^(다음 .*?쓰시오\.?(?:\s*\([^)]*\))?)\s*/,
        /^(주어진 .*?고르시오\.?(?:\s*\([^)]*\))?)\s*/,
        /^(글의 흐름으로 보아.*?고르시오\.?(?:\s*\([^)]*\))?)\s*/,
        /^([가-힣\s,\-~〈〉<>()\[\]A-C0-9?。.!\/\"\':;""''…─①-⑤]*?[?。.\)])(?=\s*[A-Z(글])/,
      ];
      
      for (const pattern of instructionPatterns) {
        const match = remaining.match(pattern);
        if (match && match[1].trim() && match[1].trim().length > 5) {
          instructionText = match[1].trim();
          remaining = remaining.substring(match[0].length).trim();
          break;
        }
      }
    }

    instructionText = instructionText.replace(/^문제\s*발문\s*[:：]\s*/i, '').trim();
    
    // Fallback: Korean text before first English sentence
    if (!instructionText) {
      const fallbackMatch = remaining.match(/^([^A-Za-z]*?[가-힣][^A-Za-z]*?[?。.])(?=\s*[A-Z])/);
      if (fallbackMatch && fallbackMatch[1].trim() && fallbackMatch[1].length > 3) {
        instructionText = fallbackMatch[1].trim();
        remaining = remaining.substring(fallbackMatch[0].length).trim();
      }
    }

    // Add [서답형] tag if detected
    if (isSeodapType && instructionText) {
      instructionText = `[서답형] ${instructionText}`;
    } else if (isSeodapType && !instructionText) {
      instructionText = '[서답형]';
    }

    // Detect if this is a summary blank question (has (A), (B) blanks for summary)
    // Exclude table questions that also mention (A)
    const isTableQuestion = /표로\s*정리|표\s*빈칸|표에서/.test(instructionText);
    const isSummaryBlankQuestion = !isTableQuestion && (/빈칸\s*\(A\)|\(A\)\s*[,와과]\s*\(B\)|요약/).test(instructionText);

    // Extract summary sentence with (A)/(B)/(C) blanks BEFORE order block extraction
    if (isSummaryBlankQuestion) {
      const summaryPattern = /([^\n]*\(A\)\s*[_]*[^\n]*(?:\(B\)\s*[_]*[^\n]*)?(?:\(C\)\s*[_]*[^\n]*)?)/;
      const summaryMatch = remaining.match(summaryPattern);
      if (summaryMatch) {
        summaryBox = summaryMatch[1].trim().replace(/^\[?요약문\]?\s*/i, '');
        remaining = remaining.replace(summaryMatch[0], '').trim();
      }

      remaining = remaining
        .replace(/^\s*\(A\)\s+\(B\)(?:\s+\(C\))?\s*$/gm, '')
        .trim();

      const standaloneBlankLines = [...remaining.matchAll(/^\s*(\([A-C]\))\s*(?:_{2,}|\u00a0|\s)*$/gm)];
      if (standaloneBlankLines.length > 0) {
        blankAnswerLines = standaloneBlankLines.map((match) => `${match[1]} ____________`);
        remaining = remaining.replace(/^\s*\([A-C]\)\s*(?:_{2,}|\u00a0|\s)*$/gm, '').trim();
      }
    }

    // Extract (A), (B), (C) order blocks for order questions - skip for summary/table questions
    if (!isSummaryBlankQuestion && !isTableQuestion) {
      const orderBlockPattern = /\(([ABC])\)\s*([\s\S]*?)(?=\([ABC]\)|[①②③④⑤]|$)/g;
      let orderMatch;
      const tempOrderBlocks: { label: string; text: string }[] = [];
      while ((orderMatch = orderBlockPattern.exec(remaining)) !== null) {
        const label = orderMatch[1];
        const text = orderMatch[2].trim();
        if (text.length > 10) {
          tempOrderBlocks.push({ label, text });
        }
      }
      if (tempOrderBlocks.length >= 2) {
        orderBlocks = tempOrderBlocks;
        remaining = remaining.replace(/\([ABC]\)\s*[\s\S]*?(?=\([ABC]\)|[①②③④⑤]|$)/g, '').trim();
      }
    }

    // Extract table format data (| header | content | or | ① | text | format)
    const tableLines = remaining.split('\n').filter(l => l.trim().startsWith('|') && l.trim().endsWith('|'));
    if (tableLines.length >= 2) {
      const tempTableRows: string[][] = [];
      for (const line of tableLines) {
        // Split by | but keep empty cells (for grammar correction empty answer tables)
        const rawCells = line.split('|');
        // Remove first and last empty strings from leading/trailing |
        const cells = rawCells.slice(1, -1).map(c => c.trim());
        // Skip separator rows like |------|------|
        if (cells.length >= 2 && !cells.every(c => /^-+$/.test(c))) {
          tempTableRows.push(cells);
        }
      }
      if (tempTableRows.length >= 2) {
        tableData = tempTableRows;
        // Remove all table lines from remaining
        tableLines.forEach(line => {
          remaining = remaining.replace(line, '');
        });
        // Also remove separator rows
        remaining = remaining.replace(/\|\s*-+\s*(\|\s*-+\s*)+\|/g, '').trim();
        remaining = remaining.trim();
      }
    }

    // For table questions: also detect non-pipe table formats
    // e.g., header lines followed by aligned content with (A) blanks
    if (isTableQuestion && tableData.length === 0) {
      // Try to find a structured block that looks like a table
      // Common format: lines with consistent tab/space separation
      const lines = remaining.split('\n');
      const tabSeparatedLines = lines.filter(l => l.includes('\t') || /\s{3,}/.test(l.trim()));
      if (tabSeparatedLines.length >= 2) {
        const tempRows: string[][] = [];
        for (const line of tabSeparatedLines) {
          const cells = line.split(/\t|\s{3,}/).map(c => c.trim()).filter(c => c);
          if (cells.length >= 2) {
            tempRows.push(cells);
          }
        }
        if (tempRows.length >= 2) {
          tableData = tempRows;
          tabSeparatedLines.forEach(line => {
            remaining = remaining.replace(line, '');
          });
          remaining = remaining.trim();
        }
      }
    }

    // Extract [조건] or <조건> section
    const conditionPatterns = [
      /\[조건\]([\s\S]*?)(?=\[정답\]|\[해설\]|[①②③④⑤]|주제문:|빈칸:|$)/,
      /<조건>([\s\S]*?)(?:<\/조건>|$)/,
      /[〈<]조건[〉>]([\s\S]*?)(?=[〈<]\/조건[〉>]|$)/,
    ];
    for (const pattern of conditionPatterns) {
      const match = remaining.match(pattern);
      if (match && !conditionSection) {
        conditionSection = match[1].trim();
        remaining = remaining.replace(match[0], '').trim();
      }
    }

    // Extract sub-questions (1), (2) for 서답형 - but not (A), (B), (C)
    // Skip for grammar/vocab workbook format where (N)[opt1/opt2] are inline choices
    const isWorkbookInlineChoices = /\(\d+\)\s*\[[^\]]+\/[^\]]+\]/.test(remaining);
    if (!isWorkbookInlineChoices) {
      const subQuestionPattern = /\((\d+)\)\s*([^(]*?)(?=\(\d+\)|[①②③④⑤]|$)/g;
      let subMatch;
      while ((subMatch = subQuestionPattern.exec(remaining)) !== null) {
        const subText = subMatch[0].trim();
        if (subText.length > 5) {
          subQuestions.push(subText);
        }
      }
      if (subQuestions.length > 0) {
        subQuestions.forEach(sq => {
          remaining = remaining.replace(sq, '');
        });
        remaining = remaining.trim();
      }
    }

    const hasInsertPassageMarkers = /\(\s*①\s*\)/.test(remaining) && /\(\s*⑤\s*\)/.test(remaining);
    const isInsertQuestionLike = /주어진\s*문장.*들어가|들어가기에.*적절한|흐름으로 보아.*주어진|흐름으로 보아.*적절한/.test(instructionText)
      || (/주어진\s*문장/.test(content) && hasInsertPassageMarkers)
      || (!instructionText && hasInsertPassageMarkers);

    // Extract choices - multiple formats
    // First, detect if ①-⑤ are inline passage markers vs separate choice lines
    const isInlineGrammarMarkers = (() => {
      // Insert-sentence questions: ①-⑤ are position markers in the passage, NOT choices
      if (isInsertQuestionLike) return true; // Keep ①-⑤ inline as insertion points
      
      // ⓐ~ⓕ inline markers: these questions have ⓐ-ⓕ underlined in passage but ①-⑤ as choices
      // So we should NOT return true for these - ①-⑤ should still be extracted as choices
      const hasInlineCircleLetterMarkers = /밑줄\s*친\s*ⓐ|ⓐ\s*~\s*ⓕ|ⓐ\s*~\s*ⓔ/.test(instructionText);
      if (hasInlineCircleLetterMarkers) return false; // ①-⑤ are choices, not inline
      
      // Inline ①-⑤ marker question types: grammar/vocab, irrelevant sentence, referential inference
      const inlineMarkerKeywords = /어법|낱말|문법|어휘|의미하는\s*대상이\s*다른/;
      
      // For keyword-based detection, ALSO verify markers actually appear inline in text
      // (not on separate lines as standalone choices)
      const hasInlineKeyword = inlineMarkerKeywords.test(instructionText);
      const hasFlowKeyword = /흐름|관계\s*없는|무관한/.test(instructionText);
      
      // Check if markers appear inline within English text on the same line
      const lines = remaining.split('\n');
      let markersInline = false;
      for (const line of lines) {
        if (/[A-Za-z0-9.,;'"\)][^\S\n]*[①②③④⑤][^\S\n]*[A-Za-z]/.test(line)) {
          markersInline = true;
          break;
        }
      }
      
      // Grammar/vocab keywords: trust keyword + inline check
      if (hasInlineKeyword && markersInline) return true;
      // Pure inline detection (no keyword needed)
      if (markersInline) return true;
      // Grammar/vocab keywords alone (어법/낱말) are strong enough without inline check
      if (hasInlineKeyword && !hasFlowKeyword) return true;
      // Flow/irrelevant keywords REQUIRE inline verification (Q14 has separate ①-⑤ choices)
      if (hasFlowKeyword && markersInline) return true;
      
      return false;
    })();

    // For Q20-style: numbered lines like "1. ① text" - strip the leading number prefix
    // so that ①-⑤ can be detected as choices normally.
    // Only do this when numbered items each start with a circled number.
    const numberedCirclePattern = /(?:^|\n)\s*\d+\.\s*([①②③④⑤])/g;
    const numberedCircleMatches = [...remaining.matchAll(numberedCirclePattern)];
    if (numberedCircleMatches.length >= 3) {
      remaining = remaining.replace(/(?:^|\n)\s*\d+\.\s*([①②③④⑤])/g, '\n$1');
    }

    let extractedChoiceSource = "";

    // Format 1: ①②③④⑤ as separate choices (NOT inline grammar markers)
    const circleChoiceIndex = remaining.search(/[①②③④⑤]/);
    if (circleChoiceIndex !== -1 && tableData.length === 0 && !isInlineGrammarMarkers) {
      const choicesSection = remaining.substring(circleChoiceIndex);
      const beforeChoices = remaining.substring(0, circleChoiceIndex);
      extractedChoiceSource = choicesSection;
      
      // Parse circle choices
      const choicePattern = /([①②③④⑤][^①②③④⑤]*)/g;
      const choices = choicesSection.match(choicePattern);
      if (choices) {
        choiceLines = choices.map(c => c.trim()).filter(c => c.length > 1);
      }
      remaining = beforeChoices.trim();
    }

    // Format 2: "- ①" prefix format (from markdown list)
    if (choiceLines.length === 0 && !isInlineGrammarMarkers) {
      const dashChoicePattern = /-\s*([①②③④⑤][^\n-]*)/g;
      const dashMatches = remaining.matchAll(dashChoicePattern);
      for (const match of dashMatches) {
        if (match[1]) {
          choiceLines.push(match[1].trim());
        }
      }
      if (choiceLines.length > 0) {
        extractedChoiceSource = remaining.match(/-\s*[①②③④⑤][^\n-]*/g)?.join('\n') || extractedChoiceSource;
        remaining = remaining.replace(/-\s*[①②③④⑤][^\n-]*/g, '').trim();
      }
    }

    // Format 3: Numbered choices "1. text", "2. text" (only if no circle choices)
    // BUT: detect T/F items and keep them as part of the passage, not as choices
    // Also: protect short numbered word bank items (e.g., "1. habits", "2. simple") from being treated as choices
    const isTFQuestion = /옳고\s*그름|T\/?F|True\s*(?:or|\/)\s*False/.test(instructionText);
    
    if (choiceLines.length === 0 && !isTFQuestion) {
      const numberedPattern = /(?:^|\n)\s*(\d)\.\s+(?!.*percent|.*years|.*century)([^\n]+)/g;
      const numMatches = [...remaining.matchAll(numberedPattern)];
      // Only use if we have exactly 5 consecutive numbered items
      if (numMatches.length >= 3 && numMatches.length <= 5) {
        const numbers = numMatches.map(m => parseInt(m[1]));
        const isConsecutive = numbers.every((n, i) => i === 0 || n === numbers[i-1] + 1);
        // Check if items are too short (word bank, not real choices) - avg length < 20 chars
        const avgLength = numMatches.reduce((sum, m) => sum + m[2].trim().length, 0) / numMatches.length;
        const isWordBank = avgLength < 20;
        if (isConsecutive && numbers[0] === 1 && !isWordBank) {
          choiceLines = numMatches.map(m => `${m[1]}. ${m[2].trim()}`);
          extractedChoiceSource = numMatches.map(m => m[0]).join('\n');
          numMatches.forEach(m => {
            remaining = remaining.replace(m[0], '');
          });
          remaining = remaining.trim();
        }
      }
    }

    // If insertion markers were mistakenly extracted as choices, restore them to the passage.
    if (isInsertQuestionLike && extractedChoiceSource && /\(\s*①\s*\)/.test(extractedChoiceSource)) {
      remaining = [remaining, extractedChoiceSource].filter(Boolean).join('\n').trim();
      choiceLines = [];
      extractedChoiceSource = "";
    }

    // Detect if ⓐ~ⓕ are inline passage markers (underlined in text)
    const hasInlineCircleLetters = /ⓐ\s*~\s*ⓕ|ⓐ\s*~\s*ⓔ|밑줄\s*친\s*ⓐ|ⓐ.*ⓑ.*ⓒ/.test(instructionText);

    // Extract labeled 〈보기〉 or [보기] sections FIRST (before unlabeled)
    // Use smarter terminator: ① only counts as terminator if it's on a new line after blank line,
    // or if it's clearly a choice line (not a question ending with ?)
    const labeledBoxiPattern = /[〈<\[]보기[\d]?[〉>\]]\s*\n?([\s\S]*?)(?=\n\s*\n\s*[①②③④⑤]|[〈<\[]보기|\[정답\]|$)/g;
    const labeledMatches = remaining.matchAll(labeledBoxiPattern);
    let hasLabeledBoxi = false;
    for (const match of labeledMatches) {
      hasLabeledBoxi = true;
      const boxiContent = match[1].trim();
      if (boxiContent) {
        // Check if it contains ⓐⓑⓒ items
        if (/[ⓐⓑⓒⓓⓔⓕⓖⓗ]/.test(boxiContent)) {
          const parts = boxiContent.split(/(?=[ⓐⓑⓒⓓⓔⓕⓖⓗ])/).filter(p => p.trim());
          boxiLines = [...boxiLines, ...parts.map(p => p.trim())];
        } else if (/[①②③④⑤]/.test(boxiContent)) {
          // Boxi items use ①②③ markers (e.g., questions in 보기)
          const parts = boxiContent.split(/(?=[①②③④⑤])/).filter(p => p.trim());
          boxiLines = [...boxiLines, ...parts.map(p => p.trim())];
        } else {
          // Simple text boxi - split by newlines for multi-line content
          const lines = boxiContent.split('\n').filter(l => l.trim());
          if (lines.length > 1) {
            boxiLines = [...boxiLines, ...lines.map(l => l.trim())];
          } else {
            boxiLines.push(boxiContent);
          }
        }
      }
    }
    remaining = remaining.replace(/[〈<\[]보기[\d]?[〉>\]]\s*\n?[\s\S]*?(?=\n\s*\n\s*[①②③④⑤]|[〈<\[]보기|\[정답\]|$)/g, '').trim();

    // Extract unlabeled 보기 section (ⓐ~ⓗ items) - ONLY if ⓐ-ⓕ are NOT inline passage markers
    if (!hasInlineCircleLetters && !hasLabeledBoxi) {
      const boxiPattern = /(ⓐ[\s\S]*?)(?=[①②③④⑤]|$)/;
      const boxiMatch = remaining.match(boxiPattern);
      if (boxiMatch && boxiMatch[0].length > 5) {
        const boxiContent = boxiMatch[0];
        // Split by circle letters
        const parts = boxiContent.split(/(?=[ⓐⓑⓒⓓⓔⓕⓖⓗ])/).filter(p => p.trim());
        boxiLines = parts.map(p => p.trim());
        remaining = remaining.replace(boxiMatch[0], '').trim();
      }
    }

    // Extract Q) question part
    const qPatterns = [
      /Q[.)：:]\s*([\s\S]+?)(?=\n\s*[①②③④⑤ⓐ]|\n\s*\|)/i,
      /Q[.)：:]\s*(.+?)(?=[①②③④⑤ⓐ]|$)/i,
    ];
    for (const pattern of qPatterns) {
      const match = remaining.match(pattern);
      if (match) {
        questionText = match[1].trim();
        remaining = remaining.replace(match[0], '').trim();
        break;
      }
    }

    // Extract "Examples:" section as a second 보기 block
    const examplesMatch = remaining.match(/\n\s*Examples?\s*[:：]?\s*\n([\s\S]*?)(?=[①②③④⑤]|$)/i);
    if (examplesMatch) {
      const exContent = examplesMatch[1].trim();
      // Parse as table or line items
      const exTableLines = exContent.split('\n').filter(l => l.trim().startsWith('|') && l.trim().endsWith('|'));
      if (exTableLines.length >= 2) {
        // Table format examples - convert to boxi items
        for (const line of exTableLines) {
          const cells = line.split('|').filter(c => c.trim()).map(c => c.trim());
          if (cells.length >= 2 && !cells.every(c => /^-+$/.test(c))) {
            boxiLines.push(cells.join(' '));
          }
        }
      }
      remaining = remaining.replace(examplesMatch[0], '').trim();
    }

    // Extract alphabetic items (a-j) in 보기 sections (Q40-style)
    const alphabeticItemPattern = /(?:^|\n)\s*-?\s*([a-j])\.\s+([^\n]+)/g;
    const alphaMatches = [...remaining.matchAll(alphabeticItemPattern)];
    if (alphaMatches.length >= 3) {
      const alphaItems = alphaMatches.map(m => `${m[1]}. ${m[2].trim()}`);
      boxiLines = [...boxiLines, ...alphaItems];
      alphaMatches.forEach(m => {
        remaining = remaining.replace(m[0], '');
      });
      remaining = remaining.trim();
    }

    // Handle T/F items in table format (pipe-delimited with (T/F) column)
    if (isTFQuestion && tableData.length > 0) {
      // Check if table has (T/F) column
      const hasTFColumn = tableData.some(row => row.some(cell => /\(T\/F\)/.test(cell)));
      if (hasTFColumn) {
        // Convert table rows to T/F items
        const tfTableItems = tableData
          .filter(row => !row.every(c => /^-+$/.test(c)))
          .map(row => {
            const content = row.filter(cell => !/\(T\/F\)/.test(cell)).join(' ').trim();
            return content ? `${content} (T/F)` : '';
          })
          .filter(Boolean);
        if (tfTableItems.length > 0) {
          // Append to passage as T/F items
          remaining = remaining + '\n' + tfTableItems.map((item, i) => `${i + 1}. ${item}`).join('\n');
          tableData = []; // consumed
        }
      }
    }

    // Final cleanup
    remaining = remaining
      .replace(/^---+$/gm, '')
      .replace(/^\s*\n+/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // Handle table data: if it looks like choices (first column is ①②③④⑤), convert to choices
    // Otherwise keep as table for rendering
    if (tableData.length > 0 && choiceLines.length === 0) {
      const firstCols = tableData.map(r => r[0]);
      const isChoiceTable = firstCols.some(c => /[①②③④⑤]/.test(c));
      if (isChoiceTable) {
        choiceLines = tableData.filter(r => /[①②③④⑤]/.test(r[0])).map(r => r.join(' '));
        tableData = []; // consumed as choices
      }
    }

    // What's left is the passage
    passageText = remaining.trim();

    // For insert-sentence questions: extract the given sentence
    let givenSentence = "";
    const isInsertQuestion = isInsertQuestionLike;
    if (isInsertQuestion && passageText) {
      const normalizedPassage = passageText.replace(/\r\n/g, '\n').trim();
      const nonEmptyLines = normalizedPassage.split('\n').map(line => line.trim()).filter(Boolean);
      const markerLineIndex = nonEmptyLines.findIndex(line => /\(\s*①\s*\)|\(\s*②\s*\)|\(\s*③\s*\)|\(\s*④\s*\)|\(\s*⑤\s*\)/.test(line));

      // Word 원본은 보통 "주어진 문장"이 별도 문단, 본문이 다음 문단으로 분리되어 있음.
      if (markerLineIndex > 0) {
        givenSentence = nonEmptyLines.slice(0, markerLineIndex).join('\n').trim();
        passageText = nonEmptyLines.slice(markerLineIndex).join('\n').trim();
      } else {
        const paragraphs = normalizedPassage.split(/\n\s*\n/).map(paragraph => paragraph.trim()).filter(Boolean);
        const markerParagraphIndex = paragraphs.findIndex(paragraph => /\(\s*①\s*\)|\(\s*②\s*\)|\(\s*③\s*\)|\(\s*④\s*\)|\(\s*⑤\s*\)/.test(paragraph));

        if (markerParagraphIndex > 0) {
          givenSentence = paragraphs.slice(0, markerParagraphIndex).join('\n\n').trim();
          passageText = paragraphs.slice(markerParagraphIndex).join('\n\n').trim();
        } else {
          const markerMatch = normalizedPassage.match(/^(.+?[.!?])\s*(?:\(\s*①\s*\)|①\s)/);
          if (markerMatch && markerMatch[1].trim().length > 20) {
            givenSentence = markerMatch[1].trim();
            passageText = normalizedPassage.substring(markerMatch[1].length).trim();
          }
        }
      }
    }

    return {
      displayInstruction: instructionText,
      passageText,
      questionText,
      choiceLines,
      boxiLines,
      conditionSection,
      subQuestions,
      orderBlocks,
      summaryBox,
      blankAnswerLines,
      tableData,
      givenSentence
    };
  };

  const { displayInstruction, passageText, questionText, choiceLines, boxiLines, conditionSection, subQuestions, orderBlocks, summaryBox, blankAnswerLines, tableData, givenSentence } = parseContent();

  return <div style={{
    display: "flex",
    flexDirection: "column",
    gap: isFullWidth ? "12px" : "10px"
  }}>
      {/* Passage title */}
      {passageTitle && (
        <div style={{
          fontSize: isFullWidth ? "7pt" : "6.5pt",
          color: "#94a3b8",
          fontStyle: "italic",
          marginBottom: "-6px"
        }}>
          📄 {passageTitle}
        </div>
      )}
      {/* Question number and instruction */}
      <div style={{
        display: "flex",
        gap: "8px",
        alignItems: "flex-start"
      }}>
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: isFullWidth ? "28px" : "24px",
          height: isFullWidth ? "28px" : "24px",
          backgroundColor: "#1e293b",
          color: "#fff",
          borderRadius: "4px",
          fontSize: isFullWidth ? "11pt" : "10pt",
          fontWeight: "700",
          flexShrink: 0
        }}>
          {questionNumber}
        </span>
        <span
          contentEditable
          suppressContentEditableWarning
          style={{
            fontWeight: "600",
            paddingTop: "2px",
            fontSize: isFullWidth ? "10pt" : "9pt",
            outline: "none",
            cursor: "text",
            minWidth: "20px"
          }}
          dangerouslySetInnerHTML={{ __html: displayInstruction.replace(/<보기>/g, '〈보기〉').replace(/<조건>/g, '〈조건〉').replace(/<u>(.*?)<\/u>/g, '<u>$1</u>') || '&nbsp;' }}
        />
      </div>

      {/* Given sentence box for insert-sentence questions */}
      {givenSentence && <div
        contentEditable
        suppressContentEditableWarning
        style={{
          padding: isFullWidth ? "10px 14px" : "8px 10px",
          border: "1px solid #cbd5e1",
          borderRadius: "4px",
          fontSize: isFullWidth ? "9.5pt" : "8.5pt",
          lineHeight: isFullWidth ? "2.0" : "1.8",
          textAlign: "justify" as const,
          outline: "none",
          cursor: "text"
        }}
        dangerouslySetInnerHTML={{ __html: givenSentence }}
      />}

      {/* Passage */}
      {passageText && (() => {
        // For T/F questions, split passage from numbered T/F items
        const isTF = /옳고\s*그름|T\/?F|True\s*(?:or|\/)\s*False/.test(displayInstruction);
        // For dual passage questions: 글 (가) / 글 (나)
        const hasDualPassage = /글\s*\(가\)/.test(passageText);
        
        let mainPassage = passageText;
        let tfItems = "";
        let passageGa = "";
        let passageNa = "";
        
        if (isTF) {
          const tfMatch = passageText.match(/(\n\s*1\.\s+[A-Z])/);
          if (tfMatch && tfMatch.index !== undefined) {
            mainPassage = passageText.substring(0, tfMatch.index).trim();
            tfItems = passageText.substring(tfMatch.index).trim();
          }
        } else if (hasDualPassage) {
          // Split by 글 (가) and 글 (나)
          const gaMatch = passageText.match(/글\s*\(가\)\s*/);
          const naMatch = passageText.match(/글\s*\(나\)\s*/);
          if (gaMatch && naMatch && gaMatch.index !== undefined && naMatch.index !== undefined) {
            passageGa = passageText.substring(gaMatch.index + gaMatch[0].length, naMatch.index).trim();
            passageNa = passageText.substring(naMatch.index + naMatch[0].length).trim();
            mainPassage = ""; // Don't render the combined passage
          }
        }
        
        // For workbook inline choices, render as plain flowing text without box
        const isWorkbookPassage = /\(\d+\)\s*\[[^\]]+\/[^\]]+\]/.test(mainPassage || passageGa || '');
        
        const passageStyle = {
          textAlign: "justify" as const,
          textIndent: isWorkbookPassage ? "0" : "1.5em",
          padding: isWorkbookPassage ? "4px 0" : (isFullWidth ? "14px 16px" : "10px 12px"),
          backgroundColor: isWorkbookPassage ? "transparent" : "#f8fafc",
          border: isWorkbookPassage ? "none" : "1px solid #e2e8f0",
          borderRadius: "4px",
          lineHeight: isFullWidth ? "2.0" : "1.8",
          fontSize: isFullWidth ? "9.5pt" : "8.5pt",
          outline: "none",
          cursor: "text"
        };
        
        const isUnderlineQuestion = /밑줄\s*친\s*부분/.test(displayInstruction);
        
        const isGrammarCorrectionQuestion = /어법상\s*어색한\s*부분.*고치시오|어색한\s*부분을\s*바르게\s*고치시오/.test(displayInstruction);
        
        // Extract quoted phrase from 함의추론 (implication) questions to underline in passage
        const implicationQuoteMatch = displayInstruction.match(/["""]([^"""]+)["""]\s*이?\s*\(가\)\s*다음\s*글에서\s*의미/);
        const implicationQuote = implicationQuoteMatch?.[1]?.trim();
        
        const processHtml = (text: string) => {
          // Escape Korean angle-bracket tags that would be eaten by HTML
          let processed = text
            .replace(/<보기>/g, '〈보기〉')
            .replace(/<조건>/g, '〈조건〉')
            .replace(/<요약문>/g, '〈요약문〉')
            .replace(/<선택된 문장>/g, '〈선택된 문장〉')
            .replace(/<\/보기>/g, '')
            .replace(/<\/조건>/g, '')
            .replace(/<\/요약문>/g, '')
            // Catch any remaining unknown <Korean> tags
            .replace(/<([가-힣\s]+)>/g, '〈$1〉')
            .replace(/<\/[가-힣\s]+>/g, '');

          // For grammarCorrectionUnderline: convert [[text]] to <u>text</u>
          processed = processed.replace(/\[\[([^\]]+?)\]\]/g, '<u>$1</u>');
          
          // For grammar correction questions (밑줄X), skip underline preprocessing entirely
          processed = isGrammarCorrectionQuestion ? processed : preprocessGrammarUnderlines(processed);
          
          // For grammar correction questions, strip *text* markers entirely (no underlines)
          if (isGrammarCorrectionQuestion) {
            processed = processed.replace(/\*([^*\n]+?)\*/g, '$1');
            // Also remove any <u> tags that might have been generated
            processed = processed.replace(/<u>(.*?)<\/u>/g, '$1');
          }
          
          // For "밑줄 친 부분" questions, convert markdown-style underlines to HTML
          if (isUnderlineQuestion) {
            // Convert **bold** markers to underline (AI often uses bold for underlined text)
            processed = processed.replace(/\*\*([^*]+?)\*\*/g, '<u>$1</u>');
            // Convert __text__ (double underscore) to underline
            processed = processed.replace(/__([^_]+?)__/g, '<u>$1</u>');
            // Convert _text_ (single underscore around words, not blanks) to underline
            // But avoid matching blank lines (____) 
            processed = processed.replace(/(?<![_\w])_([^_]{2,}?)_(?![_\w])/g, '<u>$1</u>');
          } else {
            // Preserve Word bold formatting for normal uploaded questions
            processed = processed.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
          }
          
          // For 함의추론 questions, underline the quoted phrase in the passage
          if (implicationQuote) {
            const escaped = implicationQuote.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            processed = processed.replace(new RegExp(escaped, 'g'), `<u>${implicationQuote}</u>`);
          }
          
          // Render remaining long underscores as blank lines
          processed = processed.replace(/_{4,}/g, '<span style="display:inline-block;min-width:120px;border-bottom:1px solid #1e293b">&nbsp;</span>');
          
          // Render grammar workbook inline choices: (N)[opt1/opt2] → styled inline
          processed = processed.replace(
            /\((\d+)\)\s*\[([^\]]+?)\/([^\]]+?)\]/g,
            (_, num, opt1, opt2) =>
              `<span style="font-weight:700;color:#1e40af">(<span style="font-size:90%">${num}</span>)</span><span style="font-weight:700">[<span style="text-decoration:underline">${opt1}</span>/<span style="text-decoration:underline">${opt2}</span>]</span>`
          );

          // Bold [Korean text] (10+ chars) for 배열영작 passages
          processed = processed.replace(
            /\[([가-힣\s,.\-~!?'"()]{10,})\]/g,
            '<strong>[$1]</strong>'
          );

          // Bold (A) [opt1 / opt2] for vocabularyThreeBlanks/grammarSelection inline in passage
          processed = processed.replace(
            /\(([ABC])\)\s*\[([^\]]+)\]/g,
            '($1) <strong>[$2]</strong>'
          );
          
          return processed;
        };
        
        return <>
          {/* Dual passage: 글 (가) / 글 (나) */}
          {passageGa && <>
            <div style={{ fontSize: "8pt", fontWeight: "700", color: "#1e293b", marginBottom: "2px" }}>글 (가)</div>
            <div contentEditable suppressContentEditableWarning style={passageStyle}
              dangerouslySetInnerHTML={{ __html: processHtml(passageGa) }} />
            <div style={{ fontSize: "8pt", fontWeight: "700", color: "#1e293b", marginTop: "8px", marginBottom: "2px" }}>글 (나)</div>
            <div contentEditable suppressContentEditableWarning style={passageStyle}
              dangerouslySetInnerHTML={{ __html: processHtml(passageNa) }} />
          </>}
          
          {/* Single passage */}
          {mainPassage && <div contentEditable suppressContentEditableWarning style={passageStyle}
            dangerouslySetInnerHTML={{ __html: processHtml(mainPassage) }} />}
          
          {/* T/F items */}
          {tfItems && <div
            contentEditable suppressContentEditableWarning
            style={{
              padding: isFullWidth ? "10px 14px" : "8px 10px",
              border: "1px solid #e2e8f0",
              borderRadius: "4px",
              marginTop: "6px",
              fontSize: isFullWidth ? "9pt" : "8.5pt",
              lineHeight: "2.0",
              outline: "none",
              cursor: "text"
            }}
            dangerouslySetInnerHTML={{ __html: tfItems
              .split('\n').filter(l => l.trim())
              .map(line => `<div style="padding:2px 0">${line.trim()}</div>`)
              .join('')
            }}
          />}
        </>;
      })()}

      {/* Summary sentence box with (A), (B), (C) blanks */}
      {summaryBox && <div
        contentEditable
        suppressContentEditableWarning
        style={{
          padding: isFullWidth ? "10px 14px" : "8px 10px",
          border: "1px solid #d1d5db",
          borderRadius: "3px",
          marginTop: "4px",
          fontSize: isFullWidth ? "9pt" : "8.5pt",
          lineHeight: "1.9",
          textAlign: "justify",
          outline: "none",
          cursor: "text"
        }}
        dangerouslySetInnerHTML={{ __html: summaryBox
          .replace(/\(A\)\s*_+/g, '(A) ____________')
          .replace(/\(B\)\s*_+/g, '(B) ____________')
          .replace(/\(C\)\s*_+/g, '(C) ____________')
        }}
      />}

      {blankAnswerLines.length > 0 && <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        marginTop: "4px"
      }}>
        {blankAnswerLines.map((line, idx) => <div
          key={idx}
          contentEditable
          suppressContentEditableWarning
          style={{
            padding: isFullWidth ? "6px 10px" : "4px 8px",
            border: "1px solid #e2e8f0",
            borderRadius: "3px",
            fontSize: isFullWidth ? "8.8pt" : "8pt",
            lineHeight: "1.8",
            outline: "none",
            cursor: "text"
          }}
        >
          {line}
        </div>)}
      </div>}

      {/* Table rendering */}
      {tableData.length > 0 && <table style={{
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "6px",
        fontSize: isFullWidth ? "8.5pt" : "7.5pt"
      }}>
        <tbody>
          {tableData.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {row.map((cell, cellIdx) => {
                // Highlight (A) blanks in table cells
                const isBlank = /^\s*\(A\)\s*$/.test(cell);
                return (
                  <td key={cellIdx} contentEditable suppressContentEditableWarning style={{
                    border: "1px solid #d1d5db",
                    padding: cell.trim() ? "4px 8px" : "8px 8px",
                    fontWeight: rowIdx === 0 ? "600" : "400",
                    backgroundColor: rowIdx === 0 ? "#f8fafc" : "transparent",
                    outline: "none",
                    cursor: "text",
                    minHeight: cell.trim() ? "auto" : "24px",
                    ...(isBlank ? { fontWeight: "700" } : {})
                  }}>
                    {cell || '\u00A0'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>}

      {/* Order Blocks (A), (B), (C) for sequence questions */}
      {orderBlocks.length > 0 && <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        marginTop: "8px"
      }}>
          {orderBlocks.map((block, idx) => (
            <div key={idx} style={{
              padding: isFullWidth ? "10px 12px" : "6px 8px",
              border: "1px solid #d1d5db",
              borderRadius: "3px",
              position: "relative",
              marginTop: "4px"
            }}>
              <span style={{
                fontWeight: "700",
                fontSize: isFullWidth ? "9pt" : "8pt",
                marginRight: "6px"
              }}>
                ({block.label})
              </span>
              <span
                contentEditable
                suppressContentEditableWarning
                style={{
                  fontSize: isFullWidth ? "9pt" : "8pt",
                  lineHeight: "1.8",
                  textAlign: "justify",
                  outline: "none",
                  cursor: "text"
                }}
                dangerouslySetInnerHTML={{ __html: block.text.replace(/<u>(.*?)<\/u>/g, '<u>$1</u>') }}
              />
            </div>
          ))}
        </div>}

      {/* 조건 Section */}
      {conditionSection && <div style={{
        padding: isFullWidth ? "12px 16px" : "10px 12px",
        border: "1px solid #cbd5e1",
        borderRadius: "4px",
        marginTop: "4px"
      }}>
          <div style={{
            fontSize: "8pt",
            fontWeight: "700",
            color: "#1e293b",
            marginBottom: "8px",
            borderBottom: "1px dashed #cbd5e1",
            paddingBottom: "4px"
          }}>
            〈조건〉
          </div>
          <div
            contentEditable
            suppressContentEditableWarning
            style={{
              fontSize: isFullWidth ? "9pt" : "8pt",
              lineHeight: "1.7",
              whiteSpace: "pre-wrap",
              outline: "none",
              cursor: "text"
            }}
            dangerouslySetInnerHTML={{ __html: conditionSection.split('\n').map(line => 
              line.startsWith('-') ? `• ${line.substring(1).trim()}` : line
            ).join('<br/>') }}
          />
        </div>}

      {/* Sub-questions for 서답형 */}
      {subQuestions.length > 0 && <div
        contentEditable
        suppressContentEditableWarning
        style={{
          padding: isFullWidth ? "12px 16px" : "10px 12px",
          backgroundColor: "#eff6ff",
          border: "1px solid #3b82f6",
          borderRadius: "4px",
          marginTop: "4px",
          fontSize: isFullWidth ? "9pt" : "8pt",
          lineHeight: "1.8",
          outline: "none",
          cursor: "text"
        }}
        dangerouslySetInnerHTML={{ __html: subQuestions.map(sq => {
          const jesiMatch = sq.match(/제시어\s*[:：]\s*(.+?)(?=→|$)/);
          const arrowMatch = sq.match(/→\s*(.*)/);
          const mainText = sq.match(/^\(\d+\)[^제]*/)?.[0]?.trim() || sq.split('제시어')[0].trim();
          let html = `<div style="font-weight:600;color:#1e40af;margin-bottom:6px">${mainText}</div>`;
          if (jesiMatch) {
            html += `<div style="color:#475569;padding:4px 8px;background:#f1f5f9;border-radius:3px;margin-bottom:4px"><span style="font-weight:600">제시어:</span> ${jesiMatch[1].trim()}</div>`;
          }
          if (arrowMatch) {
            html += `<div>→ <span style="border-bottom:1px solid #1e293b;padding-bottom:2px;min-width:200px;display:inline-block">_______________________________________________</span></div>`;
          }
          return html;
        }).join('<div style="border-bottom:1px dashed #93c5fd;margin:12px 0"></div>') }}
      />}

      {/* Question (Q) Section */}
      {questionText && <div
        contentEditable
        suppressContentEditableWarning
        style={{
          padding: isFullWidth ? "10px 14px" : "8px 10px",
          border: "1px solid #d1d5db",
          borderRadius: "3px",
          marginTop: "4px",
          fontWeight: "500",
          fontSize: isFullWidth ? "9.5pt" : "8.5pt",
          lineHeight: "1.8",
          outline: "none",
          cursor: "text"
        }}
        dangerouslySetInnerHTML={{ __html: `<span style="font-weight:700;margin-right:6px">Q.</span>${questionText.replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')}` }}
      />}

      {/* 보기 Section */}
      {boxiLines.length > 0 && <div style={{
        padding: isFullWidth ? "10px 14px" : "8px 10px",
        border: "1px solid #d1d5db",
        borderRadius: "3px",
        marginTop: "4px"
      }}>
          <div style={{
            fontSize: "8pt",
            fontWeight: "700",
            color: "#1e293b",
            marginBottom: "6px",
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: "4px"
          }}>
            〈보기〉
          </div>
          <div
            contentEditable
            suppressContentEditableWarning
            style={{ outline: "none", cursor: "text" }}
            dangerouslySetInnerHTML={{ __html: boxiLines.map(line => {
              const cleanLine = line.replace(/<보기>|\(보기\)|[〈<]보기[\d]?[〉>]/g, '').trim();
              if (!cleanLine) return '';
              return `<div style="padding:3px 0;font-size:${isFullWidth ? '9pt' : '8pt'};line-height:1.7">${cleanLine}</div>`;
            }).join('') }}
          />
        </div>}

      {/* Choices */}
      {choiceLines.length > 0 && <div
        contentEditable
        suppressContentEditableWarning
        style={{
          marginTop: "6px",
          display: "flex",
          flexDirection: "column",
          gap: "3px",
          outline: "none",
          cursor: "text"
        }}
        dangerouslySetInnerHTML={{ __html: choiceLines.map((choice, idx) => {
          let cleanChoice = choice.replace(/^-\s*/, '').trim()
            .replace(/_{4,}/g, '<span style="display:inline-block;min-width:100px;border-bottom:1px solid #1e293b">&nbsp;</span>')
            // Bold (A) [opt1 / opt2] patterns for vocabularyThreeBlanks/grammarSelection
            .replace(/\(([ABC])\)\s*\[([^\]]+)\]/g, '($1) <strong>[$2]</strong>')
            // Bold **text** markdown
            .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
          return `<div style="padding:${isFullWidth ? '5px 10px' : '4px 8px'};font-size:${isFullWidth ? '9pt' : '8pt'};border-radius:3px;line-height:1.6">${cleanChoice}</div>`;
        }).join('') }}
      />}
    </div>;
}
