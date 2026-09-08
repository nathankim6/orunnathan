import { Textarea } from "@/components/ui/textarea";
import { KeyboardEvent, ClipboardEvent, useRef, useEffect, useState } from "react";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onEnterPress?: () => void;
  onPaste?: (values: string[], titles?: string[]) => void;
  isSpecialVocabType?: boolean;
  isOrderWritingType?: boolean;
  isBracketType?: boolean;
  placeholder?: string;
}

export const TextInput = ({ 
  value, 
  onChange, 
  onEnterPress, 
  onPaste, 
  isSpecialVocabType,
  isOrderWritingType,
  isBracketType,
  placeholder = "Enter your text here..." 
}: TextInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [lastSavedValue, setLastSavedValue] = useState(value);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Save to history with debounce (1 second delay)
  useEffect(() => {
    if (value === lastSavedValue) return;
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout to save after 1 second of no changes
    saveTimeoutRef.current = setTimeout(() => {
      if (value !== lastSavedValue && lastSavedValue) {
        setHistory(prev => [...prev.slice(-19), lastSavedValue]); // Keep last 20 states
        setHistoryIndex(-1);
      }
      setLastSavedValue(value);
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [value, lastSavedValue]);

  const saveToHistoryNow = () => {
    if (value !== lastSavedValue && lastSavedValue) {
      setHistory(prev => [...prev.slice(-19), lastSavedValue]);
      setHistoryIndex(-1);
    }
    setLastSavedValue(value);
  };

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(48, Math.min(textarea.scrollHeight, 200)) + 'px';
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      if (onEnterPress) {
        onEnterPress();
      }
    } else if (e.key === 'z' && e.ctrlKey && !e.shiftKey) {
      e.preventDefault();
      // Save current state before undoing
      if (historyIndex === -1 && value !== lastSavedValue) {
        saveToHistoryNow();
      }
      
      // Undo functionality
      if (history.length > 0) {
        if (historyIndex === -1) {
          // First undo - save current and go to last item in history
          const lastState = history[history.length - 1];
          setHistoryIndex(history.length - 1);
          onChange(lastState);
          setLastSavedValue(lastState);
        } else if (historyIndex > 0) {
          // Go further back in history
          const previousState = history[historyIndex - 1];
          setHistoryIndex(historyIndex - 1);
          onChange(previousState);
          setLastSavedValue(previousState);
        }
      }
    } else if (e.key === '1' && e.ctrlKey && (isOrderWritingType || isBracketType)) {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      if (start !== end) {
        const selectedText = value.substring(start, end);
        const newValue = value.substring(0, start) + '[' + selectedText + ']' + value.substring(end);
        saveToHistoryNow();
        onChange(newValue);
        
        // Set cursor position after the closing bracket
        setTimeout(() => {
          textarea.setSelectionRange(end + 2, end + 2);
        }, 0);
      }
    }
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    if (!isOrderWritingType && !isBracketType) return;
    
    const textarea = e.currentTarget;
    const cursorPosition = textarea.selectionStart;
    const text = value;
    
    // Find sentence boundaries
    const sentences = text.split(/(?<=[.!?])\s+/);
    let currentPosition = 0;
    
    for (const sentence of sentences) {
      const sentenceEnd = currentPosition + sentence.length;
      
      if (cursorPosition >= currentPosition && cursorPosition <= sentenceEnd) {
        // Check if sentence is already wrapped with brackets
        const trimmedSentence = sentence.trim();
        if (trimmedSentence.startsWith('[') && trimmedSentence.endsWith(']')) {
          // Remove brackets
          const unwrapped = trimmedSentence.slice(1, -1);
          const newValue = text.substring(0, currentPosition) + 
                          text.substring(currentPosition, sentenceEnd).replace(`[${unwrapped}]`, unwrapped) + 
                          text.substring(sentenceEnd);
          saveToHistoryNow();
          onChange(newValue);
        } else {
          // Add brackets
          const beforeSentence = text.substring(0, currentPosition);
          const afterSentence = text.substring(sentenceEnd);
          const wrappedSentence = `[${sentence}]`;
          saveToHistoryNow();
          onChange(beforeSentence + wrappedSentence + afterSentence);
        }
        break;
      }
      
      currentPosition = sentenceEnd + 1; // +1 for the space after sentence
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    
    const cleanQuotes = (str: string) => {
      return str.replace(/^["'`""'']+|["'`""'']+$/g, '').trim();
    };
    
    const hasTabSeparator = text.includes('\t');
    const hasNewlineSeparator = text.includes('\n');
    
    if (hasTabSeparator && hasNewlineSeparator) {
      // Multi-row with tabs: could be 2-column Excel data (title\tpassage per row)
      const rows = text.split('\n').filter(r => r.trim());
      const isMultiColumn = rows.every(r => r.includes('\t'));
      
      if (isMultiColumn && rows.length >= 1) {
        // 2-column format: extract titles and texts separately
        const titles: string[] = [];
        const texts: string[] = [];
        
        for (const row of rows) {
          const cols = row.split('\t');
          if (cols.length >= 2) {
            titles.push(cleanQuotes(cols[0]));
            texts.push(cleanQuotes(cols[1]));
          } else {
            titles.push('');
            texts.push(cleanQuotes(cols[0]));
          }
        }
        
        if (texts.length > 1 && onPaste) {
          saveToHistoryNow();
          onPaste(texts, titles);
        } else if (texts.length === 1) {
          saveToHistoryNow();
          onChange(texts[0]);
        }
        return;
      }
    }
    
    if (hasTabSeparator || hasNewlineSeparator) {
      const values = text.split(/[\t\n]+/)
        .map(cleanQuotes)
        .filter(value => value.length > 0);
      
      if (values.length > 1 && onPaste) {
        saveToHistoryNow();
        onPaste(values);
      } else if (values.length === 1) {
        saveToHistoryNow();
        onChange(values[0]);
      }
    } else {
      const cleanedText = cleanQuotes(text);
      if (cleanedText.length > 0) {
        saveToHistoryNow();
        onChange(cleanedText);
      }
    }
  };

  return (
    <div className="space-y-1">
      <div className="relative group">
        {/* Enhanced textarea with premium styling */}
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onDoubleClick={handleDoubleClick}
          placeholder={placeholder}
          className="input-text min-h-[56px] w-full bg-slate-50/50 border-slate-200 focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition-all duration-200 rounded-lg text-slate-800 placeholder:text-slate-400 resize-none text-[13px] leading-relaxed py-3 px-4 shadow-inner shadow-slate-100/50"
          style={{ height: 'auto', overflow: 'hidden' }}
        />
        {/* Subtle focus indicator */}
        <div className="absolute inset-0 rounded-lg pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 ring-1 ring-slate-300/50" />
      </div>
      
      {/* Refined helper text */}
      {(isSpecialVocabType || isOrderWritingType || isBracketType) && (
        <p className="text-[11px] text-slate-400 pl-1 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-slate-300" />
          {isSpecialVocabType && "대괄호 [...]로 특정 부분을 문제로 지정"}
          {(isOrderWritingType || isBracketType) && "더블클릭으로 문장 선택 또는 Ctrl+1로 선택영역 지정"}
        </p>
      )}
    </div>
  );
};
