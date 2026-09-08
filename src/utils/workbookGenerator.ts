import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  AlignmentType,
  BorderStyle,
  PageOrientation,
  Table,
  TableRow,
  TableCell,
  WidthType,
  VerticalAlign,
  ShadingType,
  HeadingLevel,
  PageBreak,
  Tab,
  TabStopType,
  TabStopPosition,
} from "docx";
import { saveAs } from "file-saver";

// Premium color scheme - Gold & Ivory
const COLORS = {
  gold: "C9A962",
  darkGold: "A67C00",
  lightGold: "F5E6B8",
  ivory: "FFFFF0",
  cream: "FFF8DC",
  warmGray: "4A4A4A",
  accent: "8B7355",
};

// Parse question content to separate answer and explanation
const parseQuestionContent = (content: string): { 
  question: string; 
  answer: string; 
  explanation: string;
} => {
  let question = content;
  let answer = "";
  let explanation = "";

  // Extract answer
  const answerMatch = content.match(/(?:\[정답\]|\[답\]|정답[:：]?|답[:：]?)\s*(.+?)(?=\[해설\]|\[설명\]|해설[:：]?|$)/is);
  if (answerMatch) {
    answer = answerMatch[1].trim();
  }

  // Extract explanation
  const explanationMatch = content.match(/(?:\[해설\]|\[설명\]|해설[:：]?|설명[:：]?)\s*(.+?)$/is);
  if (explanationMatch) {
    explanation = explanationMatch[1].trim();
  }

  // Clean question part
  const questionEndMatch = content.search(/(?:\[정답\]|\[답\]|정답[:：]?|답[:：]?)/i);
  if (questionEndMatch > 0) {
    question = content.substring(0, questionEndMatch).trim();
  }

  return { question, answer, explanation };
};

// Create decorative border paragraph
const createDecorativeLine = (isTop: boolean = true): Paragraph => {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: isTop ? 0 : 200, after: isTop ? 200 : 0 },
    children: [
      new TextRun({
        text: "═══════════════════════════════════════════════════",
        color: COLORS.gold,
        size: 20,
      }),
    ],
  });
};

// Create header with decorative elements
const createHeader = (title: string): Header => {
  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        border: {
          bottom: {
            color: COLORS.gold,
            style: BorderStyle.DOUBLE,
            size: 12,
            space: 8,
          },
        },
        children: [
          new TextRun({
            text: "✦  ",
            color: COLORS.gold,
            size: 18,
          }),
          new TextRun({
            text: title,
            bold: true,
            color: COLORS.warmGray,
            size: 24,
            font: "Georgia",
          }),
          new TextRun({
            text: "  ✦",
            color: COLORS.gold,
            size: 18,
          }),
        ],
      }),
    ],
  });
};

// Create footer with page numbers
const createFooter = (): Footer => {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: {
          top: {
            color: COLORS.lightGold,
            style: BorderStyle.SINGLE,
            size: 6,
            space: 8,
          },
        },
        children: [
          new TextRun({
            text: "─  ",
            color: COLORS.gold,
            size: 18,
          }),
          new TextRun({
            children: [PageNumber.CURRENT],
            color: COLORS.warmGray,
            size: 20,
          }),
          new TextRun({
            text: "  ─",
            color: COLORS.gold,
            size: 18,
          }),
        ],
      }),
    ],
  });
};

// Create title page
const createTitlePage = (title: string): Paragraph[] => {
  return [
    new Paragraph({
      spacing: { before: 2000 },
      children: [],
    }),
    // Decorative top pattern
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "✧ ─────────────────── ✧",
          color: COLORS.gold,
          size: 28,
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 100 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "◈ ─────────────────── ◈",
          color: COLORS.darkGold,
          size: 24,
        }),
      ],
    }),
    // Main title
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 600, after: 600 },
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 72,
          color: COLORS.warmGray,
          font: "Georgia",
        }),
      ],
    }),
    // Decorative bottom pattern
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "◈ ─────────────────── ◈",
          color: COLORS.darkGold,
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 100 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "✧ ─────────────────── ✧",
          color: COLORS.gold,
          size: 28,
        }),
      ],
    }),
    // Subtitle area
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 1500 },
      children: [
        new TextRun({
          text: "ENGLISH WORKBOOK",
          size: 28,
          color: COLORS.accent,
          font: "Georgia",
          italics: true,
        }),
      ],
    }),
    // Decorative diamond pattern
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 2000 },
      children: [
        new TextRun({
          text: "◆ ◇ ◆ ◇ ◆",
          color: COLORS.gold,
          size: 36,
        }),
      ],
    }),
    // Page break after title
    new Paragraph({
      children: [new PageBreak()],
    }),
  ];
};

// Create question block with elegant styling
const createQuestionBlock = (
  questionNum: number, 
  content: string,
  isLastOnPage: boolean = false
): Paragraph[] => {
  const paragraphs: Paragraph[] = [];

  // Question number with decorative element
  paragraphs.push(
    new Paragraph({
      spacing: { before: 400, after: 200 },
      shading: {
        type: ShadingType.CLEAR,
        fill: COLORS.cream,
      },
      border: {
        left: {
          color: COLORS.gold,
          style: BorderStyle.THICK,
          size: 24,
          space: 10,
        },
      },
      children: [
        new TextRun({
          text: `  문제 ${questionNum}`,
          bold: true,
          size: 26,
          color: COLORS.darkGold,
          font: "Georgia",
        }),
      ],
    })
  );

  // Question content
  const lines = content.split('\n').filter(line => line.trim());
  lines.forEach((line, index) => {
    paragraphs.push(
      new Paragraph({
        spacing: { before: index === 0 ? 200 : 80, after: 80 },
        indent: { left: 400 },
        children: [
          new TextRun({
            text: line,
            size: 22,
            color: COLORS.warmGray,
          }),
        ],
      })
    );
  });

  // Decorative separator between questions
  if (!isLastOnPage) {
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 300, after: 300 },
        children: [
          new TextRun({
            text: "· · · · · · · · · · · · · · ·",
            color: COLORS.lightGold,
            size: 18,
          }),
        ],
      })
    );
  }

  return paragraphs;
};

// Create answer section header
const createAnswerSectionHeader = (): Paragraph[] => {
  return [
    new Paragraph({
      children: [new PageBreak()],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({
          text: "✦ ═══════════════════════════════ ✦",
          color: COLORS.gold,
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "정답 및 해설",
          bold: true,
          size: 40,
          color: COLORS.warmGray,
          font: "Georgia",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [
        new TextRun({
          text: "✦ ═══════════════════════════════ ✦",
          color: COLORS.gold,
          size: 24,
        }),
      ],
    }),
  ];
};

// Create answer block
const createAnswerBlock = (
  questionNum: number,
  answer: string,
  explanation: string
): Paragraph[] => {
  const paragraphs: Paragraph[] = [];

  // Question number
  paragraphs.push(
    new Paragraph({
      spacing: { before: 300, after: 150 },
      border: {
        bottom: {
          color: COLORS.lightGold,
          style: BorderStyle.SINGLE,
          size: 4,
          space: 4,
        },
      },
      children: [
        new TextRun({
          text: `${questionNum}번`,
          bold: true,
          size: 24,
          color: COLORS.darkGold,
        }),
      ],
    })
  );

  // Answer
  if (answer) {
    paragraphs.push(
      new Paragraph({
        spacing: { before: 150, after: 100 },
        shading: {
          type: ShadingType.CLEAR,
          fill: COLORS.cream,
        },
        children: [
          new TextRun({
            text: "정답: ",
            bold: true,
            size: 22,
            color: COLORS.warmGray,
          }),
          new TextRun({
            text: answer,
            size: 22,
            color: COLORS.warmGray,
          }),
        ],
      })
    );
  }

  // Explanation
  if (explanation) {
    paragraphs.push(
      new Paragraph({
        spacing: { before: 100, after: 200 },
        indent: { left: 200 },
        children: [
          new TextRun({
            text: "해설: ",
            bold: true,
            size: 20,
            color: COLORS.accent,
          }),
          new TextRun({
            text: explanation,
            size: 20,
            color: COLORS.warmGray,
          }),
        ],
      })
    );
  }

  return paragraphs;
};

export const generateWorkbook = async (
  questions: string[],
  title: string
): Promise<void> => {
  const documentChildren: Paragraph[] = [];

  // Add title page
  documentChildren.push(...createTitlePage(title));

  // Process questions
  const parsedData = questions.map((q, index) => ({
    number: index + 1,
    ...parseQuestionContent(q),
  }));

  // Add questions section
  documentChildren.push(createDecorativeLine(true));
  
  parsedData.forEach((data, index) => {
    const isLastOnPage = (index + 1) % 3 === 0; // Roughly 3 questions per page
    const questionBlocks = createQuestionBlock(
      data.number,
      data.question,
      isLastOnPage
    );
    documentChildren.push(...questionBlocks);

    // Add page break every 3 questions for readability
    if (isLastOnPage && index < parsedData.length - 1) {
      documentChildren.push(
        new Paragraph({
          children: [new PageBreak()],
        })
      );
    }
  });

  // Add answer section
  documentChildren.push(...createAnswerSectionHeader());

  parsedData.forEach((data) => {
    const answerBlocks = createAnswerBlock(
      data.number,
      data.answer,
      data.explanation
    );
    documentChildren.push(...answerBlocks);
  });

  // Create document
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Malgun Gothic",
            size: 22,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.PORTRAIT,
              width: 11906, // A4 width in twips
              height: 16838, // A4 height in twips
            },
            margin: {
              top: 1440, // 1 inch
              right: 1080,
              bottom: 1440,
              left: 1080,
            },
          },
        },
        headers: {
          default: createHeader(title),
        },
        footers: {
          default: createFooter(),
        },
        children: documentChildren,
      },
    ],
  });

  // Generate and save
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${title}_문제집.docx`);
};
