import { Document, Paragraph, TextRun, Packer, AlignmentType, HeadingLevel, SectionType, CommentRangeStart, CommentRangeEnd, CommentReference, ColumnBreak, LevelFormat, Header, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType } from "docx";
import { saveAs } from "file-saver";

// Font size constant (9pt = 18 half-points)
const FONT_SIZE = 18;

interface Question {
  id: string;
  content: string;
  questionNumber: number;
  passageTitle?: string;
}

// Helper function to parse text with underlines and create TextRuns
const parseTextWithUnderlines = (text: string, fontSize: number = FONT_SIZE): TextRun[] => {
  const parts = text.split(/(<u>.*?<\/u>)/g);
  const runs: TextRun[] = [];
  
  parts.forEach(part => {
    if (part.startsWith('<u>') && part.endsWith('</u>')) {
      // Extract content and create underlined TextRun
      const content = part.replace(/<\/?u>/g, '');
      runs.push(
        new TextRun({
          text: content,
          size: fontSize,
          font: "맑은 고딕",
          underline: {
            type: "single",
          },
        })
      );
    } else if (part) {
      // Regular text
      runs.push(
        new TextRun({
          text: part,
          size: fontSize,
          font: "맑은 고딕",
        })
      );
    }
  });
  
  return runs;
};

// Helper: detect if lines form a markdown table
const isMarkdownTableLine = (line: string): boolean => {
  return /^\|(.+\|)+\s*$/.test(line.trim());
};

const isMarkdownSeparatorLine = (line: string): boolean => {
  return /^\|[\s\-:]+(\|[\s\-:]+)+\|\s*$/.test(line.trim());
};

// Parse markdown table lines into a Word Table
const parseMarkdownTable = (tableLines: string[]): Table => {
  const borderStyle = BorderStyle.SINGLE;
  const cellBorder = { style: borderStyle, size: 1, color: "000000" };
  const cellBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };

  const dataRows = tableLines.filter(line => !isMarkdownSeparatorLine(line));

  // Full content width for A4 with 850 DXA side margins = 11906 - 1700 = 10206
  const TABLE_WIDTH = 10206;
  const firstRowCells = dataRows[0]
    ? dataRows[0].split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1)
    : [];
  const colCount = Math.max(firstRowCells.length, 1);
  const baseColWidth = Math.floor(TABLE_WIDTH / colCount);
  const columnWidths = Array.from({ length: colCount }, (_, i) =>
    i === colCount - 1 ? TABLE_WIDTH - baseColWidth * (colCount - 1) : baseColWidth
  );

  const rows = dataRows.map((line, rowIdx) => {
    const cells = line.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1).map(c => c.trim());

    return new TableRow({
      children: cells.map((cellText, colIdx) =>
        new TableCell({
          borders: cellBorders,
          width: { size: columnWidths[colIdx] ?? baseColWidth, type: WidthType.DXA },
          shading: rowIdx === 0 ? { fill: "E8EDF2", type: ShadingType.CLEAR } : undefined,
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          children: [
            new Paragraph({
              children: parseTextWithUnderlines(cellText, FONT_SIZE),
              spacing: { before: 0, after: 0 },
              alignment: AlignmentType.CENTER,
            })
          ]
        })
      )
    });
  });

  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    columnWidths,
    rows,
  });
};

// Clean and convert content for Word format
const cleanContent = (content: string): string => {
  return content
    .replace(/\[OUTPUT\]/g, '')
    // Remove "문제:" for order questions
    .replace(/문제:\s*\n?/g, '')
    // Remove [선지] text
    .replace(/\[선지\]\s*/g, '')
    // 정답과 해설의 밑줄 표시 제거 및 정규화 (우선 처리)
    .replace(/\*\*\[정답\]\*\*/g, '[정답]')
    .replace(/\*\*\[해설\]\*\*/g, '[해설]')
    .replace(/\*\*정답\s*[:：]?\s*\*\*/g, '[정답]')
    .replace(/\*\*해설\s*[:：]?\s*\*\*/g, '[해설]')
    // 정답:, 정답 :, 정답 등 모든 패턴을 [정답]으로 통일
    .replace(/정답\s*[:：]\s*/g, '[정답] ')
    .replace(/해설\s*[:：]\s*/g, '[해설] ')
    .replace(/(^|\n)정답\s+/gm, '$1[정답] ')
    .replace(/(^|\n)해설\s+/gm, '$1[해설] ')
    .replace(/\[정답\]\s+\[정답\]/g, '[정답]') // 중복 제거
    .replace(/\[해설\]\s+\[해설\]/g, '[해설]') // 중복 제거
    .replace(/\n+(다음 빈칸에 들어갈 말로 가장 적절한 것을 고르시오\.)/g, '$1')
    .replace(/(다음 빈칸에 들어갈 말로 가장 적절한 것을 고르시오\.)\n\n/g, '$1\n')
    .replace(/\n\n+(다음 글의.*?것은\?)/g, '\n$1')
    .replace(/(다음 글의.*?것은\?)\n\n/g, '$1\n')
    .replace(/(\[정답\].*?)\n\n(\[해설\])/g, '$1\n$2')
    .replace(/(\[정답\].*?)\n(\[해설\])/g, '$1\n$2')
    // Ensure exactly one blank line before [정답] - improved pattern
    .replace(/(⑤[^\n]+)\n*\s*(\[정답\])/g, '$1\n\n$2') // After last choice
    .replace(/([^⑤\n])\n*\s*(\[정답\])/g, '$1\n\n$2') // Any other case
    .replace(/\n{3,}(\[정답\])/g, '\n\n$1') // Reduce multiple blank lines to exactly one
    // AFTER processing other patterns, ensure <보기> questions have exactly one blank line before choices
    .replace(/(j\.\s*[^\n]+)\n(①)/g, '$1\n\n$2')
    .replace(/(\[서답형\] 다음 글을 읽고, 물음에 답하시오\.)\n\n/g, '$1\n')
    .replace(/(다음 글의 내용과 일치하도록.*?쓰시오\.)\n\n/g, '$1\n')
    // 정답/해설 영역의 모든 별표 제거 (밑줄/굵게 금지)
    .replace(/(\[정답\][\s\S]*)/, (m) => m.replace(/\*/g, ''))
    .replace(/\*\*(.*?)\*\*/g, '<u>$1</u>') // Convert ** to <u> tags
    .replace(/\/\/ =+\s*정답\s*및?\s*해설\s*=+/gi, ''); // Remove existing separator comments
};

const createWordDocument = async (questions: Question[], addComments: boolean = false, documentTitle: string = "문제") => {
  const paragraphs: Paragraph[] = [];
  const comments: { id: number; author: string; date: Date; children: Paragraph[] }[] = [];

  // Load background image
  let backgroundImageBuffer;
  try {
    const response = await fetch('/assets/word-page-background.jpg');
    backgroundImageBuffer = await response.arrayBuffer();
  } catch (error) {
    console.warn("Could not load background image:", error);
  }

  // Create header with title
  const questionHeader = new Header({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: documentTitle,
            bold: true,
            size: FONT_SIZE,
            font: "맑은 고딕",
          })
        ],
        alignment: AlignmentType.CENTER,
      })
    ],
  });

  // Questions section
  questions.forEach((question, index) => {
    // Add passage title if available (small gray text)
    if (question.passageTitle) {
      paragraphs.push(new Paragraph({
        children: [
          new TextRun({
            text: `[${question.passageTitle}]`,
            size: 14, // 7pt
            font: "맑은 고딕",
            color: "999999",
            italics: true,
          })
        ],
        spacing: { before: index === 0 ? 0 : 200, after: 40 },
      }));
    }

    const cleanedContent = cleanContent(question.content);
    const parts = cleanedContent.split(/(\[정답\])/);
    let questionPart = parts[0].trim();
    
    // Extract answer/explanation for comment
    let answerText = '';
    if (addComments && parts.length > 1) {
      answerText = parts.slice(1).join('')
        .replace(/\[정답\]\s*/, '정답: ')
        .replace(/\[해설\]\s*/, '\n해설: ')
        .replace(/\*\*/g, '')
        .replace(/<\/?u>/g, '')
        .trim();
      
      // Create comment for this question
      comments.push({
        id: index,
        author: "문제출제기",
        date: new Date(),
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: answerText,
                size: 18,
              })
            ]
          })
        ]
      });
    }

    // Handle insert question with border for given sentence and no underlines
    const isInsertQuestion = questionPart.includes('글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳을 고르시오');
    const isOrderQuestion = questionPart.includes('주어진 글 다음에 이어질 글의 순서로 가장 적절한 것을 고르시오') ||
      questionPart.includes('다음 글의 순서로 가장 적절한 것을 고르시오');
    
    // Remove underlines for insert questions and order questions
    if (isInsertQuestion || isOrderQuestion) {
      questionPart = questionPart
        .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove ** formatting
        .replace(/<u>(.*?)<\/u>/g, '$1'); // Remove <u> tags if any
    }
    
    const questionLines = questionPart.split('\n').map(line => line.trim());
    let foundGivenSentence = false;
    let foundFirstSentence = false;
    let isFirstLineOfQuestion = true;
    
    for (let lineIndex = 0; lineIndex < questionLines.length; lineIndex++) {
      const line = questionLines[lineIndex];
      
      // Skip the blank line immediately after the first line (Korean question prompt)
      if (!line && lineIndex === 1) {
        continue;
      }

      // Detect markdown table: collect consecutive table lines
      if (isMarkdownTableLine(line) || isMarkdownSeparatorLine(line)) {
        const tableLines: string[] = [line];
        while (lineIndex + 1 < questionLines.length && 
               (isMarkdownTableLine(questionLines[lineIndex + 1]) || isMarkdownSeparatorLine(questionLines[lineIndex + 1]))) {
          lineIndex++;
          tableLines.push(questionLines[lineIndex]);
        }
        // Only render as table if we have at least header + separator + 1 data row
        if (tableLines.length >= 3) {
          paragraphs.push(parseMarkdownTable(tableLines) as unknown as Paragraph);
          continue;
        }
        // Otherwise fall through to render as normal lines
      }
      
      // If this is an empty line, add a blank paragraph
      if (!line) {
        paragraphs.push(new Paragraph({ spacing: { before: 0, after: 80 } }));
        continue;
      }
      
      if (line.trim()) {
        // Check if this is the given sentence in insert question
        const isGivenSentence = isInsertQuestion && 
          !foundGivenSentence && 
          !line.includes('글의 흐름으로 보아') && 
          !line.includes('가장 적절한 곳을 고르시오') &&
          !line.match(/^\s*\(\s*[①-⑤]\s*\)/) &&
          line.length > 10;

        // Check if this is the first sentence in order question
        const isFirstSentence = isOrderQuestion &&
          !foundFirstSentence &&
          !line.includes('주어진 글 다음에 이어질 글의 순서로') &&
          !line.includes('다음 글의 순서로') &&
          !line.includes('가장 적절한 것을 고르시오') &&
          !line.match(/^\s*\([A-C]\)/) &&
          !line.match(/^\s*[①-⑤]/) &&
          line.length > 10;
        
        if (isGivenSentence) {
          foundGivenSentence = true;
        }
        if (isFirstSentence) {
          foundFirstSentence = true;
        }
        
        // Build runs for this line and prefix question number on the first line
        let runs: (TextRun | CommentRangeStart | CommentRangeEnd | CommentReference)[] = (isInsertQuestion || isOrderQuestion)
          ? [new TextRun({ text: line, size: FONT_SIZE, font: "맑은 고딕" })]
          : parseTextWithUnderlines(line, FONT_SIZE);
        
        if (lineIndex === 0) {
          // Add comment range to the question number
          if (addComments) {
            runs = [
              new CommentRangeStart(index),
              new TextRun({ text: `${index + 1}. `, bold: true, size: FONT_SIZE, font: "맑은 고딕" }),
              new CommentRangeEnd(index),
              new CommentReference(index),
              ...runs,
            ];
          } else {
            runs = [
              new TextRun({ text: `${index + 1}. `, bold: true, size: FONT_SIZE, font: "맑은 고딕" }),
              ...runs,
            ];
          }
        }
        // First line of each question starts at same height (no before spacing)
        paragraphs.push(
          new Paragraph({
            children: runs,
            spacing: { before: 0, after: lineIndex === questionLines.length - 1 ? 200 : 80 },
            alignment: AlignmentType.JUSTIFIED,
            border: (isGivenSentence || isFirstSentence) ? {
              top: { style: "single", size: 1, color: "000000" },
              bottom: { style: "single", size: 1, color: "000000" },
              left: { style: "single", size: 1, color: "000000" },
              right: { style: "single", size: 1, color: "000000" }
            } : undefined
          })
        );
      }
    }
    
    // Add column break after each question (one question per column)
    paragraphs.push(
      new Paragraph({
        children: [new ColumnBreak()],
        spacing: { before: 0, after: 0, line: 0 },
      })
    );
  });

  // Only add answer section if not using comments
  if (!addComments) {
    // Separator comment - Add page break for answers
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "",
          })
        ],
        pageBreakBefore: true,
      })
    );


    // Answers section title
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "===== 정답 및 해설 =====",
            bold: true,
            size: FONT_SIZE,
            font: "맑은 고딕",
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 }
      })
    );

    // Answers section
    questions.forEach((question, index) => {
      const cleanedContent = cleanContent(question.content);
      const parts = cleanedContent.split(/(\[정답\])/);
      
      if (parts.length > 1) {
        const answerPart = parts.slice(1).join('').trim();
        
        // Add question number
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${index + 1}. `,
                bold: true,
                size: FONT_SIZE,
                font: "맑은 고딕",
              })
            ],
            spacing: { before: index % 4 === 0 && index > 0 ? 300 : 100, after: 100 },
            alignment: AlignmentType.JUSTIFIED
          })
        );

        // Add answer content WITHOUT any underlines (for all question types)
        const answerLines = answerPart.split('\n').filter(line => line.trim());
        
        answerLines.forEach((line, lineIndex) => {
          if (line.trim()) {
            // Remove all underlines from answer/explanation sections
            const processedLine = line
              .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove ** formatting
              .replace(/<u>(.*?)<\/u>/g, '$1'); // Remove <u> tags if any
            
            paragraphs.push(
              new Paragraph({
                children: [new TextRun({ text: processedLine, size: FONT_SIZE, font: "맑은 고딕" })],
                spacing: { after: lineIndex === answerLines.length - 1 ? 150 : 60 },
                alignment: AlignmentType.JUSTIFIED
              })
            );
          }
        });
      }
    });
  }

  // Create document with all paragraphs at once
  const doc = new Document({
    comments: addComments ? {
      children: comments.map(c => ({
        id: c.id,
        author: c.author,
        date: c.date,
        children: c.children,
      }))
    } : undefined,
    sections: [{
      properties: {
        page: {
          size: {
            width: 11906,  // A4 width in twips
            height: 16838, // A4 height in twips
          },
          margin: {
            top: 1134,   // 20mm for header space
            right: 850,  // 15mm in twips
            bottom: 850, // 15mm in twips
            left: 850,   // 15mm in twips
            header: 567, // 10mm header distance
          },
          pageNumbers: {
            start: 1,
            formatType: "decimal",
          }
        },
        column: {
          space: 708, // 0.5 inch spacing between columns in twips
          count: 2,   // 2 columns
        },
        ...(backgroundImageBuffer && {
          pageBackground: {
            image: {
              data: backgroundImageBuffer,
              type: "jpg",
            }
          }
        })
      },
      headers: {
        default: questionHeader,
      },
      children: paragraphs
    }]
  });

  return doc;
};

export const generateWordDocument = async (questions: Question[], withComments: boolean = false, documentTitle: string = "문제") => {
  if (!questions || questions.length === 0) {
    throw new Error("저장할 문제가 없습니다.");
  }

  try {
    const doc = await createWordDocument(questions, withComments, documentTitle);
    const blob = await Packer.toBlob(doc);
    const filename = `${documentTitle}.docx`;
    saveAs(blob, filename);
    return { success: true };
  } catch (error) {
    console.error("Word document generation error:", error);
    throw new Error("Word 문서 저장 중 오류가 발생했습니다.");
  }
};

// Generate Word document with comments only (questions only, no answer section)
export const generateWordDocumentWithComments = async (questions: Question[], documentTitle: string = "문제") => {
  return generateWordDocument(questions, true, documentTitle);
};

// Generate Word document with endnotes on separate last page (with auto-numbering)
export const generateWordDocumentWithEndnotes = async (questions: Question[], documentTitle: string = "문제") => {
  if (!questions || questions.length === 0) {
    throw new Error("저장할 문제가 없습니다.");
  }

  try {
    const questionParagraphs: Paragraph[] = [];
    const answerData: { text: string }[] = [];

    // Create header with title for questions section
    const questionHeader = new Header({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: documentTitle,
              bold: true,
              size: FONT_SIZE,
              font: "맑은 고딕",
            })
          ],
          alignment: AlignmentType.CENTER,
        })
      ],
    });

    // Create header with title for answers section
    const answerHeader = new Header({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: "===== 정답 및 해설 =====",
              bold: true,
              size: FONT_SIZE,
              font: "맑은 고딕",
            })
          ],
          alignment: AlignmentType.CENTER,
        })
      ],
    });

    // Questions section
    questions.forEach((question, index) => {
      const cleanedContent = cleanContent(question.content);
      const parts = cleanedContent.split(/(\[정답\])/);
      let questionPart = parts[0].trim();
      
      // Extract answer/explanation for endnote page
      if (parts.length > 1) {
        const answerText = parts.slice(1).join('')
          .replace(/\[정답\]\s*/, '정답: ')
          .replace(/\[해설\]\s*/, '\n해설: ')
          .replace(/\*\*/g, '')
          .replace(/<\/?u>/g, '')
          .trim();
        
        answerData.push({ text: answerText });
      }

      // Handle insert question and order question formatting
      const isInsertQuestion = questionPart.includes('글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳을 고르시오');
      const isOrderQuestion = questionPart.includes('주어진 글 다음에 이어질 글의 순서로 가장 적절한 것을 고르시오') ||
        questionPart.includes('다음 글의 순서로 가장 적절한 것을 고르시오');
      
      if (isInsertQuestion || isOrderQuestion) {
        questionPart = questionPart
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/<u>(.*?)<\/u>/g, '$1');
      }
      
      const questionLines = questionPart.split('\n').map(line => line.trim());
      let foundGivenSentence = false;
      let foundFirstSentence = false;
      
      for (let lineIndex = 0; lineIndex < questionLines.length; lineIndex++) {
        const line = questionLines[lineIndex];
        if (!line && lineIndex === 1) {
          continue;
        }

        // Detect markdown table
        if (isMarkdownTableLine(line) || isMarkdownSeparatorLine(line)) {
          const tableLines: string[] = [line];
          while (lineIndex + 1 < questionLines.length && 
                 (isMarkdownTableLine(questionLines[lineIndex + 1]) || isMarkdownSeparatorLine(questionLines[lineIndex + 1]))) {
            lineIndex++;
            tableLines.push(questionLines[lineIndex]);
          }
          if (tableLines.length >= 3) {
            questionParagraphs.push(parseMarkdownTable(tableLines) as unknown as Paragraph);
            continue;
          }
        }
        
        if (!line) {
          questionParagraphs.push(new Paragraph({ spacing: { before: 0, after: 80 } }));
          continue;
        }
        
        if (line.trim()) {
          const isGivenSentence = isInsertQuestion && 
            !foundGivenSentence && 
            !line.includes('글의 흐름으로 보아') && 
            !line.includes('가장 적절한 곳을 고르시오') &&
            !line.match(/^\s*\(\s*[①-⑤]\s*\)/) &&
            line.length > 10;

          const isFirstSentence = isOrderQuestion &&
            !foundFirstSentence &&
            !line.includes('주어진 글 다음에 이어질 글의 순서로') &&
            !line.includes('다음 글의 순서로') &&
            !line.includes('가장 적절한 것을 고르시오') &&
            !line.match(/^\s*\([A-C]\)/) &&
            !line.match(/^\s*[①-⑤]/) &&
            line.length > 10;
          
          if (isGivenSentence) {
            foundGivenSentence = true;
          }
          if (isFirstSentence) {
            foundFirstSentence = true;
          }
          
          const runs: TextRun[] = (isInsertQuestion || isOrderQuestion)
            ? [new TextRun({ text: line, size: FONT_SIZE, font: "맑은 고딕" })]
            : parseTextWithUnderlines(line, FONT_SIZE);
          
          // First line of each question uses auto-numbering (no before spacing for consistent alignment)
          if (lineIndex === 0) {
            questionParagraphs.push(
              new Paragraph({
                children: runs,
                numbering: {
                  reference: "question-numbering",
                  level: 0,
                },
                spacing: { before: 0, after: 80 },
                alignment: AlignmentType.JUSTIFIED,
                border: (isGivenSentence || isFirstSentence) ? {
                  top: { style: "single", size: 1, color: "000000" },
                  bottom: { style: "single", size: 1, color: "000000" },
                  left: { style: "single", size: 1, color: "000000" },
                  right: { style: "single", size: 1, color: "000000" }
                } : undefined
              })
            );
          } else {
            questionParagraphs.push(
              new Paragraph({
                children: runs,
                spacing: { before: 0, after: lineIndex === questionLines.length - 1 ? 200 : 80 },
                alignment: AlignmentType.JUSTIFIED,
                indent: { left: 360 }, // Indent continuation lines to align with numbered text
                border: (isGivenSentence || isFirstSentence) ? {
                  top: { style: "single", size: 1, color: "000000" },
                  bottom: { style: "single", size: 1, color: "000000" },
                  left: { style: "single", size: 1, color: "000000" },
                  right: { style: "single", size: 1, color: "000000" }
                } : undefined
              })
            );
          }
        }
      }
      
      // Add column break after each question (one question per column)
      questionParagraphs.push(
        new Paragraph({
          children: [new ColumnBreak()],
          spacing: { before: 0, after: 0, line: 0 },
        })
      );
    });

    // Create answer page paragraphs
    const answerParagraphs: Paragraph[] = [];

    // Add each answer with auto-numbering (matches question numbers)
    answerData.forEach((answer, idx) => {
      const answerLines = answer.text.split('\n').filter(line => line.trim());
      
      answerLines.forEach((line, lineIdx) => {
        const runs: TextRun[] = [
          new TextRun({ 
            text: line, 
            size: FONT_SIZE, 
            font: "맑은 고딕" 
          })
        ];
        
        // First line of each answer uses auto-numbering
        if (lineIdx === 0) {
          answerParagraphs.push(
            new Paragraph({
              children: runs,
              numbering: {
                reference: "answer-numbering",
                level: 0,
              },
              spacing: { 
                before: idx % 4 === 0 && idx > 0 ? 250 : 100, 
                after: answerLines.length === 1 ? 120 : 50 
              },
              alignment: AlignmentType.JUSTIFIED
            })
          );
        } else {
          answerParagraphs.push(
            new Paragraph({
              children: runs,
              spacing: { 
                before: 0, 
                after: lineIdx === answerLines.length - 1 ? 120 : 50 
              },
              indent: { left: 360 },
              alignment: AlignmentType.JUSTIFIED
            })
          );
        }
      });
    });

    // Create document with numbering definitions and two sections
    const doc = new Document({
      numbering: {
        config: [
          {
            reference: "question-numbering",
            levels: [
              {
                level: 0,
                format: LevelFormat.DECIMAL,
                text: "%1.",
                alignment: AlignmentType.LEFT,
                style: {
                  run: {
                    bold: true,
                    size: FONT_SIZE,
                    font: "맑은 고딕",
                  },
                  paragraph: {
                    indent: { left: 284, hanging: 284 },
                  },
                },
              },
            ],
          },
          {
            reference: "answer-numbering",
            levels: [
              {
                level: 0,
                format: LevelFormat.DECIMAL,
                text: "%1.",
                alignment: AlignmentType.LEFT,
                style: {
                  run: {
                    bold: true,
                    size: FONT_SIZE,
                    font: "맑은 고딕",
                  },
                  paragraph: {
                    indent: { left: 284, hanging: 284 },
                  },
                },
              },
            ],
          },
        ],
      },
      sections: [
        {
          properties: {
            page: {
              size: { width: 11906, height: 16838 },
              margin: { top: 1134, right: 850, bottom: 850, left: 850, header: 567 },
              pageNumbers: { start: 1, formatType: "decimal" }
            },
            column: { space: 708, count: 2 },
          },
          headers: {
            default: questionHeader,
          },
          children: questionParagraphs
        },
        {
          properties: {
            page: {
              size: { width: 11906, height: 16838 },
              margin: { top: 1134, right: 850, bottom: 850, left: 850, header: 567 },
            },
            column: { space: 708, count: 2 },
          },
          headers: {
            default: answerHeader,
          },
          children: answerParagraphs
        }
      ]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${documentTitle}.docx`);
    return { success: true };
  } catch (error) {
    console.error("Word document with endnotes generation error:", error);
    throw new Error("Word 문서 저장 중 오류가 발생했습니다.");
  }
};

export const generateHWPDocument = async (questions: Question[]) => {
  if (!questions || questions.length === 0) {
    throw new Error("저장할 문제가 없습니다.");
  }

  try {
    const { convertToHWP } = await import("@/utils/hancomConverter");
    const doc = await createWordDocument(questions, false);
    const result = await convertToHWP(doc, "문제와정답", "hwp");
    return result;
  } catch (error) {
    console.error("HWP document generation error:", error);
    throw new Error("HWP 문서 저장 중 오류가 발생했습니다.");
  }
};
