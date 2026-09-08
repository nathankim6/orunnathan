import { convertAsteriskToUnderline } from "../components/ui/underlined-text";

interface QuestionContent {
  id: string;
  content: string;
  questionNumber: number;
}

export const generateTextFile = (questions: QuestionContent[]) => {
  const questionsText: string[] = [];
  const answersText: string[] = [];

  const cleanDisplayText = (text: string) => {
    return convertAsteriskToUnderline(
      text
        .replace(/\[OUTPUT\]/g, '')
        .replace(/\n+(다음 빈칸에 들어갈 말로 가장 적절한 것을 고르시오\.)/g, '$1')
        .replace(/(다음 빈칸에 들어갈 말로 가장 적절한 것을 고르시오\.)\n\n/g, '$1\n')
        .replace(/\n\n+(다음 글의.*?것은\?)/g, '\n$1')
        .replace(/(다음 글의.*?것은\?)\n\n/g, '$1\n')
        .replace(/(\[정답\].*?)\n\n(\[해설\])/g, '$1\n$2')
        .replace(/(\[정답\].*?)\n(\[해설\])/g, '$1\n$2')
        .replace(/(다음의 내용과 일치.*?것을 고르시오\.)\n\n([A-Z])/g, '$1\n$2')
        .replace(/(\?)\n\n([A-Z])/g, '$1\n$2')
        .replace(/\*\*(다음 중 어법상 적절하지 않은 것은\?)\*\*/g, '$1')
        .replace(/(다음 중 어법상 적절하지 않은 것은\?)\n\n/g, '$1\n')
        .replace(/다음 중 어법상 적절하지 않은 것은\?\n(?=다음)/g, '')
        .replace(/(?<!문맥상 낱말의 쓰임이 적절하지 않은 것은\?[\s\S]*?)\d+\) [①-⑤]\n/g, '')
        .replace(/1\) ①\n2\) ②\n3\) ③\n4\) ④\n5\) ⑤\n?/g, '')
        .replace(/\d+\) [A-Za-z]+(?:\d+\) [A-Za-z]+)*/g, '')
        .replace(/([A-Za-z]+\s*→\s*[A-Za-z]+\s*\([①-⑤]\):.*?\n)+/g, '')
        .replace(/\n\n(다음 글의 빈 칸에)/g, '\n$1')
        .replace(/\[선지\]/g, '')
        .replace(/(\[정답\])\s*([①-⑤])\s*\n(\[해설\])/g, '$1 $2\n$3')
        .replace(/\n\n+(\[정답\])/g, '\n\n$1')
        .replace(/(\?)\n\n+(\[선지\]\s*)?([①-⑤])/g, '$1\n$3')
        .replace(/\[어휘\][\s\S]*?(?=\n\n|$)/g, '')
        .replace(/원문의 빈칸 표현:.*?$/gm, '')
        .replace(/(다음 중 문맥 상 알맞은 단어를 고르시오\.)\n\n/g, '$1\n')
        .replace(/(\[서답형\] 다음 글을 읽고, 물음에 답하시오\.)\n\n/g, '$1\n')
        .replace(/(다음 글의 내용과 일치하도록.*?쓰시오\.)\n\n/g, '$1\n')
    );
  };

  questions.forEach((question, index) => {
    const raw = question.content || '';
    // Apply the same cleaning as shown on screen
    const cleanedContent = cleanDisplayText(raw);
    
    // Split by [정답] to separate question and answer
    const parts = cleanedContent.split('[정답]');
    
    if (parts.length > 1) {
      // Question part
      const questionPart = parts[0].trim();
      questionsText.push(`문제 ${index + 1}\n${questionPart}\n`);
      
      // Answer part - keep [정답] prefix and include [해설] if present
      const answerPart = '[정답]' + parts[1].trim();
      answersText.push(`문제 ${index + 1}\n${answerPart}\n`);
    } else {
      // If no [정답] found, put everything in questions
      questionsText.push(`문제 ${index + 1}\n${cleanedContent.trim()}\n`);
    }
  });

  const combinedText = [
    '===== 문제 =====\n',
    questionsText.join('\n'),
    '\n===== 정답 =====\n',
    answersText.join('\n')
  ].join('');

  return combinedText;
};

export const downloadTextFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
