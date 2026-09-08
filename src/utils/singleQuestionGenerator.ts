import { Document, Paragraph, TextRun, Packer, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import { convertToHWP } from "./hancomConverter";

// Helper function to parse text with underlines and create TextRuns
const parseTextWithUnderlines = (text: string, baseSize: number = 24): TextRun[] => {
  const parts = text.split(/(<u>.*?<\/u>)/g);
  const runs: TextRun[] = [];
  
  parts.forEach(part => {
    if (part.startsWith('<u>') && part.endsWith('</u>')) {
      // Extract content and create underlined TextRun
      const content = part.replace(/<\/?u>/g, '');
      runs.push(
        new TextRun({
          text: content,
          size: baseSize,
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
          size: baseSize,
        })
      );
    }
  });
  
  return runs;
};

const createSingleQuestionDocument = (content: string, questionNumber: number) => {
  // Normalize 정답/해설 format first
  let processedContent = content
    .replace(/\[선지\]\s*/g, '') // Remove [선지] text
    .replace(/\*\*\[정답\]\*\*/g, '[정답]')
    .replace(/\*\*\[해설\]\*\*/g, '[해설]')
    .replace(/\*\*정답\s*[:：]?\s*\*\*/g, '[정답]')
    .replace(/\*\*해설\s*[:：]?\s*\*\*/g, '[해설]')
    .replace(/정답\s*[:：]\s*/g, '[정답] ')
    .replace(/해설\s*[:：]\s*/g, '[해설] ')
    .replace(/(^|\n)정답\s+/gm, '$1[정답] ')
    .replace(/(^|\n)해설\s+/gm, '$1[해설] ')
    .replace(/\[정답\]\s+\[정답\]/g, '[정답]')
    .replace(/\[해설\]\s+\[해설\]/g, '[해설]');

  // Handle insert question with border for given sentence and no underlines
  const isInsertQuestion = processedContent.includes('글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳을 고르시오');
  // Handle order question with no underlines
  const isOrderQuestion = processedContent.includes('주어진 글 다음에 이어질 글의 순서로 가장 적절한 것을 고르시오') ||
    processedContent.includes('다음 글의 순서로 가장 적절한 것을 고르시오');
  
  // Split by [정답] to separate question and answer sections
  const parts = processedContent.split(/(\[정답\])/);
  let questionPart = parts[0];
  let answerPart = parts.length > 1 ? parts.slice(1).join('') : '';
  
  // Remove underlines for insert questions and order questions in question part
  if (isInsertQuestion || isOrderQuestion) {
    questionPart = questionPart
      .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove ** formatting
      .replace(/<u>(.*?)<\/u>/g, '$1'); // Remove <u> tags if any
  }
  
  // Always remove underlines from answer/explanation part
  if (answerPart) {
    answerPart = answerPart
      .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove ** formatting
      .replace(/<u>(.*?)<\/u>/g, '$1')  // Remove <u> tags if any
      .replace(/\*/g, '');               // Remove any remaining asterisks
    processedContent = questionPart + answerPart;
  } else {
    processedContent = questionPart;
  }
  
  let paragraphs = [];
  
  // Add question number
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `문제 ${questionNumber}`,
          bold: true,
          size: 28,
        }),
      ],
      alignment: AlignmentType.JUSTIFIED,
    })
  );
  
  if (isInsertQuestion) {
    const lines = processedContent.split('\n').filter(line => line.trim());
    let foundGivenSentence = false;
    
    lines.forEach((line, index) => {
      const isGivenSentence = !foundGivenSentence && 
        !line.includes('글의 흐름으로 보아') && 
        !line.includes('가장 적절한 곳을 고르시오') &&
        !line.match(/^\s*\(\s*[①-⑤]\s*\)/) &&
        line.length > 10 &&
        !line.includes('[정답]') &&
        !line.includes('[해설]');
      
      if (isGivenSentence) {
        foundGivenSentence = true;
      }
      
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: line, size: 24, font: "맑은 고딕" })],
          spacing: {
            before: index === 0 ? 400 : 100,
            after: index === lines.length - 1 ? 400 : 100,
          },
          alignment: AlignmentType.JUSTIFIED,
          border: isGivenSentence ? {
            top: { style: "single", size: 1, color: "000000" },
            bottom: { style: "single", size: 1, color: "000000" },
            left: { style: "single", size: 1, color: "000000" },
            right: { style: "single", size: 1, color: "000000" }
          } : undefined
        })
      );
    });
  } else if (isOrderQuestion) {
    const lines = processedContent.split('\n').filter(line => line.trim());
    let foundFirstSentence = false;
    
    lines.forEach((line, index) => {
      const isFirstSentence = !foundFirstSentence &&
        !line.includes('주어진 글 다음에 이어질 글의 순서로') &&
        !line.includes('다음 글의 순서로') &&
        !line.includes('가장 적절한 것을 고르시오') &&
        !line.match(/^\s*\([A-C]\)/) &&
        !line.match(/^\s*[①-⑤]/) &&
        !line.includes('[정답]') &&
        !line.includes('[해설]') &&
        line.length > 10;
      
      if (isFirstSentence) {
        foundFirstSentence = true;
      }
      
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: line, size: 24, font: "맑은 고딕" })],
          spacing: {
            before: index === 0 ? 400 : 100,
            after: index === lines.length - 1 ? 400 : 100,
          },
          alignment: AlignmentType.JUSTIFIED,
          border: isFirstSentence ? {
            top: { style: "single", size: 1, color: "000000" },
            bottom: { style: "single", size: 1, color: "000000" },
            left: { style: "single", size: 1, color: "000000" },
            right: { style: "single", size: 1, color: "000000" }
          } : undefined
        })
      );
    });
  } else {
    paragraphs.push(
      new Paragraph({
        children: parseTextWithUnderlines(processedContent, 24),
        spacing: {
          before: 400,
          after: 400,
        },
        alignment: AlignmentType.JUSTIFIED,
      })
    );
  }

  return new Document({
    sections: [{
      properties: {
        page: {
          size: {
            width: 11906,  // A4 width in twips
            height: 16838, // A4 height in twips
          },
          margin: {
            top: 1440,
            right: 1440,
            bottom: 1440,
            left: 1440,
          }
        }
      },
      children: paragraphs
    }]
  });
};

export const generateSingleQuestionHWP = async (
  content: string, 
  questionNumber: number,
  format: "docx" | "hwp" | "hwpx" = "hwp"
) => {
  try {
    const doc = createSingleQuestionDocument(content, questionNumber);
    
    if (format === "docx") {
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `문제${questionNumber}.docx`);
      return { success: true, format: "docx" };
    } else {
      const result = await convertToHWP(doc, `문제${questionNumber}`, format);
      return result;
    }
  } catch (error) {
    console.error("Single question document generation error:", error);
    return { 
      success: false, 
      error: "문서 저장 중 오류가 발생했습니다.",
      format: "docx"
    };
  }
};
