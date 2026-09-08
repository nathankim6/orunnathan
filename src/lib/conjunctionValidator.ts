/**
 * Conjunction question validator and answer randomizer
 * Ensures that correct answers are evenly distributed across ①-⑤
 */

interface ConjunctionOption {
  number: string;
  a: string;
  b: string;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Parse conjunction question and extract options
 */
function parseConjunctionQuestion(content: string): {
  beforeOptions: string;
  options: ConjunctionOption[];
  correctAnswer: string;
  afterAnswer: string;
} | null {
  try {
    // Find the options section (①-⑤)
    const optionPattern = /^[①②③④⑤]\s*\(A\)\s*(.+?)\s*\.{3,6}\s*\(B\)\s*(.+?)$/gm;
    const options: ConjunctionOption[] = [];
    let match;
    
    while ((match = optionPattern.exec(content)) !== null) {
      const fullMatch = match[0];
      const number = fullMatch.charAt(0); // ①, ②, etc.
      const a = match[1].trim();
      const b = match[2].trim();
      options.push({ number, a, b });
    }

    if (options.length !== 5) {
      return null;
    }

    // Find correct answer
    const answerMatch = content.match(/\[정답\]\s*([①②③④⑤])/);
    if (!answerMatch) {
      return null;
    }
    const correctAnswer = answerMatch[1];

    // Split content into sections
    const optionsStartIndex = content.indexOf('①');
    const answerStartIndex = content.indexOf('[정답]');
    
    const beforeOptions = content.substring(0, optionsStartIndex);
    const afterAnswer = content.substring(answerStartIndex);

    return {
      beforeOptions,
      options,
      correctAnswer,
      afterAnswer
    };
  } catch (error) {
    console.error('Error parsing conjunction question:', error);
    return null;
  }
}

/**
 * Randomize the correct answer position and rebuild the question
 */
export function randomizeConjunctionAnswer(content: string): string {
  const parsed = parseConjunctionQuestion(content);
  
  if (!parsed) {
    console.log('Could not parse conjunction question for randomization');
    return content;
  }

  const { beforeOptions, options, correctAnswer, afterAnswer } = parsed;

  // Find which option is currently correct
  const correctIndex = options.findIndex(opt => opt.number === correctAnswer);
  if (correctIndex === -1) {
    return content;
  }

  const correctOption = options[correctIndex];

  // Shuffle all options
  const shuffledOptions = shuffleArray(options);

  // Find new position of correct option
  const newCorrectIndex = shuffledOptions.findIndex(
    opt => opt.a === correctOption.a && opt.b === correctOption.b
  );

  const numbers = ['①', '②', '③', '④', '⑤'];
  const newCorrectNumber = numbers[newCorrectIndex];

  // Rebuild options section
  let newOptionsSection = '';
  shuffledOptions.forEach((opt, index) => {
    newOptionsSection += `${numbers[index]} (A) ${opt.a} ...... (B) ${opt.b}\n`;
  });

  // Rebuild answer section with new correct number
  const newAfterAnswer = afterAnswer.replace(
    /\[정답\]\s*[①②③④⑤]/,
    `[정답] ${newCorrectNumber}`
  ).replace(
    /정답은\s*[①②③④⑤]번입니다/,
    `정답은 ${newCorrectNumber}번입니다`
  );

  const result = beforeOptions + newOptionsSection + '\n' + newAfterAnswer;
  
  console.log(`Randomized conjunction answer: ${correctAnswer} → ${newCorrectNumber}`);
  
  return result;
}

/**
 * Validate and auto-correct conjunction question
 */
export function validateAndCorrectConjunctionQuestion(content: string): string {
  return randomizeConjunctionAnswer(content);
}
