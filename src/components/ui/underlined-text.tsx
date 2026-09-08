import React from 'react';

interface UnderlinedTextProps {
  children: React.ReactNode;
  className?: string;
}

export const UnderlinedText = ({ children, className = "" }: UnderlinedTextProps) => {
  return (
    <span 
      className={`underline decoration-2 underline-offset-2 ${className}`}
      style={{ textDecorationThickness: '2px' }}
    >
      {children}
    </span>
  );
};

interface TextWithUnderlineProps {
  text: string;
  className?: string;
}

export const TextWithUnderline = ({ text, className = "" }: TextWithUnderlineProps) => {
  // Pre-process text to add underlines to phrases after ①②③④⑤ in grammar questions
  const preprocessGrammarUnderlines = (inputText: string): string => {
    // Skip if already has <u> tags
    if (inputText.includes('<u>')) {
      return inputText;
    }
    
    // Check if this looks like a grammar question (has circled numbers/letters followed by English text)
    const hasGrammarPattern = /[①-⑤ⓐ-ⓕ][a-zA-Z]/.test(inputText);
    if (!hasGrammarPattern) {
      return inputText;
    }
    
    // Pattern: Match ①-⑤ or ⓐ-ⓕ followed by English words until we hit certain boundaries
    let result = inputText;
    
    // Process each circled number/letter and underline the phrase after it
    result = result.replace(
      /([①-⑤ⓐ-ⓕ])([a-zA-Z][^①-⑤ⓐ-ⓕ]*?)(?=\s*[①-⑤ⓐ-ⓕ]|\.\s+[A-Z]|\.\s*$|$)/g,
      (match, num, phrase) => {
        let cleanPhrase = phrase.trim();
        
        if (cleanPhrase.length < 2) {
          return match;
        }
        
        return `<u>${num}${cleanPhrase}</u>`;
      }
    );
    
    return result;
  };

  // Apply preprocessing for grammar-style underlines
  const processedText = preprocessGrammarUnderlines(text);

  // Convert <u>text</u> tags to actual underlined components and <box>text</box> to bordered components
  const renderTextWithUnderlines = (inputText: string) => {
    const parts = inputText.split(/(<u>.*?<\/u>|<box>[\s\S]*?<\/box>|<b>.*?<\/b>)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('<u>') && part.endsWith('</u>')) {
        const content = part.replace(/<\/?u>/g, '');
        
        const segments: React.ReactNode[] = [];
        let currentIndex = 0;
        
        const choicePattern = /([①-⑤ⓐ-ⓕ]|\d+[.)]\s*)/g;
        let match;
        
        while ((match = choicePattern.exec(content)) !== null) {
          if (match.index > currentIndex) {
            const beforeText = content.slice(currentIndex, match.index);
            segments.push(
              <UnderlinedText key={`${index}-u-${currentIndex}`} className={className}>
                {beforeText}
              </UnderlinedText>
            );
          }
          
          segments.push(
            <span key={`${index}-n-${match.index}`}>
              {match[0]}
            </span>
          );
          
          currentIndex = match.index + match[0].length;
        }
        
        if (currentIndex < content.length) {
          const remainingText = content.slice(currentIndex);
          segments.push(
            <UnderlinedText key={`${index}-u-${currentIndex}`} className={className}>
              {remainingText}
            </UnderlinedText>
          );
        }
        
        if (segments.length === 0) {
          return (
            <UnderlinedText key={index} className={className}>
              {content}
            </UnderlinedText>
          );
        }
        
        return <React.Fragment key={index}>{segments}</React.Fragment>;
      }
      if (part.startsWith('<b>') && part.endsWith('</b>')) {
        const content = part.replace(/<\/?b>/g, '');
        return (
          <span key={index} className="font-bold">
            {content}
          </span>
        );
      }
      if (part.startsWith('<box>') && part.endsWith('</box>')) {
        const content = part
          .replace(/<\/?box>/g, '')
          .replace(/^[\s\n]+/, '')
          .replace(/[\s\n]+$/, '')
          .replace(/\n[ \t]*\n+/g, '\n');
        return (
          <span key={index} className="border border-muted-foreground p-2 mt-0 mb-1 block rounded">
            {renderTextWithUnderlines(content)}
          </span>
        );
      }
      // Render [word1/word2] patterns as bold for workbook questions
      return renderBracketChoices(part, index);
    });
  };

  // Render (N)[word1/word2] or [word1/word2] as bold
  const renderBracketChoices = (text: string, parentIndex: number) => {
    const bracketPattern = /(\(\d+\))?\[([^\]\/]+)\/([^\]\/]+)\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = bracketPattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      const numPrefix = match[1] || '';
      parts.push(
        <span key={`${parentIndex}-bc-${match.index}`} className="font-bold">
          {numPrefix}[{match[2]}/{match[3]}]
        </span>
      );
      lastIndex = match.index + match[0].length;
    }

    if (parts.length === 0) return text;
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    return <React.Fragment key={parentIndex}>{parts}</React.Fragment>;
  };

  return (
    <span className={className}>
      {renderTextWithUnderlines(processedText)}
    </span>
  );
};

// Utility function to convert **text** and *text* to <u>text</u> for backward compatibility
// Excludes [정답] and [해설] from underline conversion
export const convertAsteriskToUnderline = (text: string): string => {
  // First, protect [정답] and [해설] from underline conversion
  let processed = text
    .replace(/\*\*\[정답\]\*\*/g, '[정답]')
    .replace(/\*\*\[해설\]\*\*/g, '[해설]')
    .replace(/\*\[정답\]\*/g, '[정답]')
    .replace(/\*\[해설\]\*/g, '[해설]')
    .replace(/\*\*정답\s*[:：]?\s*\*\*/g, '[정답]')
    .replace(/\*\*해설\s*[:：]?\s*\*\*/g, '[해설]');
  
  // Convert double asterisk first (to avoid conflicts with single asterisk)
  processed = processed.replace(/\*\*(.*?)\*\*/g, '<u>$1</u>');
  
  // Then convert single asterisk
  processed = processed.replace(/\*(.*?)\*/g, '<u>$1</u>');
  
  return processed;
};

// Function to handle HTML copying with underlines preserved
export const copyTextWithUnderlines = async (text: string) => {
  const { copyWithAdvancedFormats } = await import('../../utils/rtf');
  return copyWithAdvancedFormats(text);
};
