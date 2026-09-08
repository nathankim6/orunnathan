
import { Document, Paragraph, TextRun, Packer, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import { convertToHWP } from "./hancomConverter";

interface Question {
  content: string;
  questionNumber: number;
  originalText?: string;
}

// Helper function to parse text with underlines and create TextRuns
const parseTextWithUnderlines = (text: string, baseSize: number = 16): TextRun[] => {
  const parts = text.split(/(<u>.*?<\/u>)/g);
  const runs: TextRun[] = [];
  
  parts.forEach(part => {
    if (part.startsWith('<u>') && part.endsWith('</u>')) {
      // Extract content and create underlined TextRun
      const content = part.replace(/<\/?u>/g, '');
      runs.push(
        new TextRun({
          text: content,
          size: 16,
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
          size: 16,
          font: "맑은 고딕",
        })
      );
    }
  });
  
  return runs;
};

const createDocumentWithBackground = () => {
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
      children: []
    }]
  });
};

const generateQuestionDoc = (questions: Question[]) => {
  const doc = createDocumentWithBackground();
  // Access sections property through type assertion
  const sections = (doc as any).sections;
  
  const children = questions.flatMap(question => {
    const paragraphs: Paragraph[] = [];

      // Add question number
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `문제 ${question.questionNumber}`,
              bold: true,
              size: 16,
              font: "맑은 고딕",
            }),
          ],
          alignment: AlignmentType.JUSTIFIED,
        })
      );

    // Add original text for weekend clinic questions with underline support
    if (question.originalText) {
      paragraphs.push(
        new Paragraph({
          children: parseTextWithUnderlines(question.originalText, 16),
          spacing: {
            before: 400,
            after: 400,
          },
        })
      );
    }

    // 향상된 정답/해설 분리 - 더 많은 패턴 인식
    let questionPart = question.content;
    
    // 정답 및 해설 패턴들을 제거하여 순수 문제만 추출
    const removePatterns = [
      /\[정답\].*$/is,
      /정답\s*[:：].*$/is,
      /답\s*[:：].*$/is,
      /\[해설\].*$/is,
      /해설\s*[:：].*$/is,
      /설명\s*[:：].*$/is,
      /Solution\s*[:：].*$/is,
      /Explanation\s*[:：].*$/is
    ];
    
    for (const pattern of removePatterns) {
      questionPart = questionPart.replace(pattern, '').trim();
    }
    
    // Handle insert question with border for given sentence and no underlines
    // Handle order question with border for first sentence and no underlines
    const isInsertQuestion = questionPart.includes('글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳을 고르시오');
    const isOrderQuestion = questionPart.includes('주어진 글 다음에 이어질 글의 순서로 가장 적절한 것을 고르시오') ||
      questionPart.includes('다음 글의 순서로 가장 적절한 것을 고르시오');
    
    // Remove underlines for insert questions and order questions
    if (isInsertQuestion || isOrderQuestion) {
      questionPart = questionPart
        .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove ** formatting
        .replace(/<u>(.*?)<\/u>/g, '$1'); // Remove <u> tags if any
    }
    
    if (isInsertQuestion) {
      const lines = questionPart.split('\n').filter(line => line.trim());
      let foundGivenSentence = false;
      
      lines.forEach((line, index) => {
        const isGivenSentence = !foundGivenSentence && 
          !line.includes('글의 흐름으로 보아') && 
          !line.includes('가장 적절한 곳을 고르시오') &&
          !line.match(/^\s*\(\s*[①-⑤]\s*\)/) &&
          line.length > 10;
        
        if (isGivenSentence) {
          foundGivenSentence = true;
        }
        
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: line, size: 16, font: "맑은 고딕" })],
            spacing: {
              before: index === 0 ? 400 : 100,
              after: index === lines.length - 1 ? 800 : 100,
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
      const lines = questionPart.split('\n').filter(line => line.trim());
      let foundFirstSentence = false;
      
      lines.forEach((line, index) => {
        const isFirstSentence = !foundFirstSentence &&
          !line.includes('주어진 글 다음에 이어질 글의 순서로') &&
          !line.includes('다음 글의 순서로') &&
          !line.includes('가장 적절한 것을 고르시오') &&
          !line.match(/^\s*\([A-C]\)/) &&
          !line.match(/^\s*[①-⑤]/) &&
          line.length > 10;
        
        if (isFirstSentence) {
          foundFirstSentence = true;
        }
        
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: line, size: 16, font: "맑은 고딕" })],
            spacing: {
              before: index === 0 ? 400 : 100,
              after: index === lines.length - 1 ? 800 : 100,
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
      const lines = questionPart.split('\n');
      lines.forEach((line, index) => {
        // Skip the blank line immediately after the first line (Korean question prompt)
        if (!line.trim() && index === 1) {
          return;
        }
        
        // Skip other completely blank lines
        if (!line.trim()) {
          return;
        }
        
        paragraphs.push(
          new Paragraph({
            children: parseTextWithUnderlines(line, 16),
            spacing: {
              before: index === 0 ? 400 : 0,
              after: index === lines.length - 1 ? 800 : 100,
            },
            alignment: AlignmentType.JUSTIFIED,
          })
        );
      });
    }

    return paragraphs;
  });

  sections[0].children = children;
  return doc;
};

const generateAnswerDoc = (questions: Question[]) => {
  const doc = createDocumentWithBackground();
  // Access sections property through type assertion
  const sections = (doc as any).sections;
  
  const children = questions.flatMap(question => {
    const paragraphs: Paragraph[] = [];
    
    // 향상된 정답/해설 추출 함수
    const extractAnswerAndSolution = (content: string) => {
      // 정답 패턴들
      const answerPatterns = [
        /\[정답\](.*?)(?=\[해설\]|해설\s*[:：]?|설명\s*[:：]?|$)/is,
        /정답\s*[:：]?(.*?)(?=\[해설\]|해설\s*[:：]?|설명\s*[:：]?|$)/is,
        /답\s*[:：]?(.*?)(?=\[해설\]|해설\s*[:：]?|설명\s*[:：]?|$)/is
      ];
      
      // 해설 패턴들
      const solutionPatterns = [
        /\[해설\](.*?)$/is,
        /해설\s*[:：]?(.*?)$/is,
        /설명\s*[:：]?(.*?)$/is
      ];
      
      let answer = '';
      let solution = '';
      
      // 정답 추출
      for (const pattern of answerPatterns) {
        const match = content.match(pattern);
        if (match && match[1]?.trim()) {
          answer = match[1].trim();
          break;
        }
      }
      
      // 해설 추출
      for (const pattern of solutionPatterns) {
        const match = content.match(pattern);
        if (match && match[1]?.trim()) {
          solution = match[1].trim();
          break;
        }
      }
      
      return { answer, solution };
    };
    
    const { answer, solution } = extractAnswerAndSolution(question.content);
    
    if (answer || solution) {
      // Add question number
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `문제 ${question.questionNumber}`,
              bold: true,
              size: 16,
              font: "맑은 고딕",
            }),
          ],
          alignment: AlignmentType.JUSTIFIED,
        })
      );
      
      // Add answer if exists (remove underlines for insert questions and order questions)
      if (answer) {
        const isInsertQuestionAnswer = question.content.includes('글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳을 고르시오');
        const isOrderQuestionAnswer = question.content.includes('주어진 글 다음에 이어질 글의 순서로 가장 적절한 것을 고르시오') ||
          question.content.includes('다음 글의 순서로 가장 적절한 것을 고르시오');
        
        let processedAnswer = answer;
        if (isInsertQuestionAnswer || isOrderQuestionAnswer) {
          processedAnswer = answer
            .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove ** formatting
            .replace(/<u>(.*?)<\/u>/g, '$1'); // Remove <u> tags if any
        }
        
        paragraphs.push(
          new Paragraph({
            children: (isInsertQuestionAnswer || isOrderQuestionAnswer) ? 
              [new TextRun({ text: `[정답] ${processedAnswer}`, size: 16, font: "맑은 고딕" })] :
              parseTextWithUnderlines(`[정답] ${processedAnswer}`, 16),
            spacing: {
              before: 200,
              after: 200,
            },
            alignment: AlignmentType.JUSTIFIED,
          })
        );
      }
      
      // Add solution if exists (remove underlines for insert questions and order questions)
      if (solution) {
        const isInsertQuestionSolution = question.content.includes('글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳을 고르시오');
        const isOrderQuestionSolution = question.content.includes('주어진 글 다음에 이어질 글의 순서로 가장 적절한 것을 고르시오') ||
          question.content.includes('다음 글의 순서로 가장 적절한 것을 고르시오');
        
        let processedSolution = solution;
        if (isInsertQuestionSolution || isOrderQuestionSolution) {
          processedSolution = solution
            .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove ** formatting
            .replace(/<u>(.*?)<\/u>/g, '$1'); // Remove <u> tags if any
        }
        
        paragraphs.push(
          new Paragraph({
            children: (isInsertQuestionSolution || isOrderQuestionSolution) ? 
              [new TextRun({ text: `[해설] ${processedSolution}`, size: 16, font: "맑은 고딕" })] :
              parseTextWithUnderlines(`[해설] ${processedSolution}`, 16),
            spacing: {
              before: 200,
              after: 600,
            },
            alignment: AlignmentType.JUSTIFIED,
          })
        );
      }
    }

    return paragraphs;
  });

  sections[0].children = children;
  return doc;
};

export const generateDocument = async (questions: Question[], format: "docx" | "hwp" | "hwpx" = "docx") => {
  if (!questions || questions.length === 0) {
    throw new Error("저장할 문제가 없습니다.");
  }

  try {
    // Generate questions document
    const questionDoc = generateQuestionDoc(questions);
    
    // Generate answers document
    const answerDoc = generateAnswerDoc(questions);

    if (format === "docx") {
      // Use the original docx format and save directly
      const questionBlob = await Packer.toBlob(questionDoc);
      saveAs(questionBlob, "문제.docx");
      
      const answerBlob = await Packer.toBlob(answerDoc);
      saveAs(answerBlob, "정답과해설.docx");
      
      return { success: true, format: "docx" };
    } else {
      // Use the Hancom converter for hwp/hwpx formats
      const questionResult = await convertToHWP(questionDoc, "문제", format);
      const answerResult = await convertToHWP(answerDoc, "정답과해설", format);
      
      if (!questionResult.success || !answerResult.success) {
        // If either conversion failed, return the error
        const errorMessage = questionResult.error || answerResult.error;
        return { 
          success: false, 
          error: errorMessage, 
          format: "docx" // Fallback format
        };
      }
      
      return { success: true, format };
    }
  } catch (error) {
    console.error("Document generation error:", error);
    throw new Error("문서 저장 중 오류가 발생했습니다.");
  }
};
