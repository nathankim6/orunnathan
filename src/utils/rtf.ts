// RTF (Rich Text Format) utility for better HWP compatibility

export const generateRTF = (text: string): string => {
  // Escape RTF special characters
  const escapeRTF = (str: string): string => {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/\n/g, '\\par\n');
  };

  // Convert <u> tags to RTF underline format
  const convertUnderlines = (text: string): string => {
    return text.replace(/<u>/g, '\\ul ').replace(/<\/u>/g, '\\ul0 ');
  };

  // Process the text
  const processedText = convertUnderlines(escapeRTF(text));

  // Generate proper RTF with headers and formatting
  return `{\\rtf1\\ansi\\deff0 {\\fonttbl\\f0\\fmodern\\fcharset129 굴림;\\f1\\froman\\fcharset0 Times New Roman;} {\\colortbl;\\red0\\green0\\blue0;} \\f0\\fs24\\cf1 ${processedText}}`;
};

export const copyWithAdvancedFormats = async (text: string): Promise<boolean> => {
  try {
    // Method 1: Try modern clipboard API with multiple formats
    const htmlContent = text
      .replace(/<u>/g, '<span style="text-decoration: underline;">')
      .replace(/<\/u>/g, '</span>')
      .replace(/\n/g, '<br>');
    
    const rtfContent = generateRTF(text);
    const plainText = text.replace(/<\/?u>/g, '');

    const clipboardData = new ClipboardItem({
      'text/html': new Blob([htmlContent], { type: 'text/html' }),
      'text/plain': new Blob([plainText], { type: 'text/plain' }),
      ...(navigator.clipboard.write ? { 'text/rtf': new Blob([rtfContent], { type: 'text/rtf' }) } : {})
    });

    await navigator.clipboard.write([clipboardData]);
    return true;
  } catch (error) {
    console.log('Modern clipboard API failed, trying fallback method');
    
    try {
      // Method 2: Fallback using contentEditable approach for desktop compatibility
      const tempElement = document.createElement('div');
      tempElement.contentEditable = 'true';
      tempElement.style.position = 'fixed';
      tempElement.style.left = '-9999px';
      tempElement.style.top = '-9999px';
      
      // Create HTML content with proper underlines
      const htmlContent = text
        .replace(/<u>/g, '<u style="text-decoration: underline;">')
        .replace(/<\/u>/g, '</u>')
        .replace(/\n/g, '<br>');
      
      tempElement.innerHTML = htmlContent;
      document.body.appendChild(tempElement);
      
      // Select the content
      const range = document.createRange();
      range.selectNodeContents(tempElement);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      
      // Copy using execCommand (better desktop app compatibility)
      const success = document.execCommand('copy');
      
      // Cleanup
      document.body.removeChild(tempElement);
      selection?.removeAllRanges();
      
      if (success) {
        return true;
      }
    } catch (fallbackError) {
      console.log('Fallback method failed, trying plain text');
    }
    
    try {
      // Method 3: Final fallback to plain text
      await navigator.clipboard.writeText(text.replace(/<\/?u>/g, ''));
      return true;
    } catch (finalError) {
      console.error('All clipboard methods failed:', finalError);
      return false;
    }
  }
};
