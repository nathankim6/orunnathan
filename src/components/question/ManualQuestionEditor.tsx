import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AIClientManager } from "@/lib/ai/aiClientManager";

export interface ManualMarker {
  id: number; // 1-5
  original: string;
  modified: string;
  position?: number; // character index in original text
  explanation?: string;
}

interface ManualQuestionEditorProps {
  text: string;
  markers: ManualMarker[];
  onMarkersChange: (markers: ManualMarker[]) => void;
  typeId: string; // 'grammar' or 'vocabulary'
}

export const ManualQuestionEditor = ({
  text,
  markers,
  onMarkersChange,
  typeId,
}: ManualQuestionEditorProps) => {
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const [generatingAll, setGeneratingAll] = useState(false);

  // Label helper: englishDefinitionBlankMatch uses (A)~(E), others use ①~⑤
  const isBlankMatch = typeId === 'englishDefinitionBlankMatch';
  const labelFor = useCallback((id: number) => {
    if (isBlankMatch) return `(${String.fromCharCode(64 + id)})`;
    return String.fromCodePoint(0x2460 + id - 1);
  }, [isBlankMatch]);

  // Build display text with markers
  const getDisplayHtml = useCallback(() => {
    if (!text || markers.length === 0) return text || "";

    // Ensure all markers have positions, fallback to indexOf
    const markersWithPos = markers.map(m => ({
      ...m,
      position: m.position ?? text.indexOf(m.original),
    }));

    // Sort by position descending (replace from end to preserve positions)
    const sortedMarkers = [...markersWithPos].sort((a, b) => b.position - a.position);

    let html = text;
    for (const m of sortedMarkers) {
      const circledNum = labelFor(m.id);
      // For sungeuiDifferentMeaning & englishDefinitionBlankMatch, never modify displayed text — markers are reference selectors only
      const isReadOnlyMarker = typeId === 'sungeuiDifferentMeaning' || isBlankMatch;
      const displayText = isReadOnlyMarker ? m.original : (m.modified || m.original);
      const isModified = !isReadOnlyMarker && m.modified && m.modified !== m.original;
      const pos = m.position;
      if (pos < 0 || pos + m.original.length > html.length) continue;

      const editable = isReadOnlyMarker ? 'false' : 'true';
      const replacement = `<span class="marker-span" data-marker-id="${m.id}"><span class="marker-num">${circledNum}</span><span class="marker-underline ${isModified ? 'modified' : ''}" contenteditable="${editable}" data-marker-id="${m.id}">${displayText}</span></span>`;
      html = html.substring(0, pos) + replacement + html.substring(pos + m.original.length);
    }

    return html;
  }, [text, markers, typeId, isBlankMatch, labelFor]);

  // Compute the start offset of the current selection relative to the ORIGINAL text
  // (accounting for existing marker spans which may display modified text).
  const getSelectionOriginalOffset = useCallback((): number => {
    const root = editorRef.current;
    if (!root) return -1;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return -1;
    const range = selection.getRangeAt(0);
    if (!root.contains(range.startContainer)) return -1;

    // Walk the editor tree in document order. For each marker-span, contribute
    // marker.original.length to the original-text offset and skip its descendants.
    // For plain text nodes (outside marker spans), contribute their text length.
    let offset = 0;
    let found = -1;

    const walk = (node: Node): boolean => {
      // If selection starts inside this node, resolve relative offset.
      if (node === range.startContainer) {
        if (node.nodeType === Node.TEXT_NODE) {
          // Make sure this text node is not inside a marker span (handled separately)
          const inMarker = (node.parentElement as HTMLElement | null)?.closest('.marker-span');
          if (!inMarker) {
            found = offset + range.startOffset;
            return true;
          }
        }
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.classList && el.classList.contains('marker-span')) {
          const mid = parseInt(el.getAttribute('data-marker-id') || '0');
          const marker = markers.find(m => m.id === mid);
          // If selection start is inside this marker span, place offset at marker start
          if (el.contains(range.startContainer)) {
            found = offset;
            return true;
          }
          offset += marker ? marker.original.length : (el.textContent?.length || 0);
          return false;
        }
      }

      if (node.nodeType === Node.TEXT_NODE) {
        const inMarker = (node.parentElement as HTMLElement | null)?.closest('.marker-span');
        if (!inMarker) {
          offset += (node.textContent || '').length;
        }
        return false;
      }

      // Recurse into children
      const children = Array.from(node.childNodes);
      for (const child of children) {
        if (walk(child)) return true;
      }
      return false;
    };

    walk(root);
    return found;
  }, [markers]);

  // Add marker from selected text with position
  const addMarkerFromSelection = useCallback((selectedText: string, position?: number) => {
    if (!selectedText) return;

    if (markers.length >= 5) {
      toast({
        title: "최대 5개까지 가능",
        description: "이미 5개의 마커가 설정되었습니다.",
        variant: "destructive",
      });
      return;
    }

    // Find the position of the selected text in the original text
    let pos = position ?? -1;
    if (pos === -1) {
      // Find the nth occurrence that isn't already marked
      const markedPositions = markers.map(m => m.position);
      let searchFrom = 0;
      while (searchFrom < text.length) {
        const found = text.indexOf(selectedText, searchFrom);
        if (found === -1) break;
        // Check if this position overlaps with any existing marker
        const isOccupied = markedPositions.some(mp => {
          const marker = markers.find(m => m.position === mp);
          if (!marker) return false;
          return found < mp + marker.original.length && found + selectedText.length > mp;
        });
        if (!isOccupied) {
          pos = found;
          break;
        }
        searchFrom = found + 1;
      }
    }

    if (pos === -1) {
      toast({
        title: "원문에 없는 텍스트",
        description: "원문 지문에 포함된 텍스트만 선택할 수 있습니다.",
        variant: "destructive",
      });
      return;
    }

    // Check if this exact position is already marked
    if (markers.some(m => m.position === pos)) {
      toast({
        title: "이미 표시됨",
        description: "해당 위치는 이미 마커가 설정되어 있습니다.",
        variant: "destructive",
      });
      return;
    }

    // Insert new marker and sort all by position, then renumber
    const newMarker = { id: 0, original: selectedText, modified: selectedText, position: pos };
    const allMarkers = [...markers, newMarker]
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((m, i) => ({ ...m, id: i + 1 }));
    const assignedId = allMarkers.find(m => m.position === pos)!.id;
    onMarkersChange(allMarkers);

    toast({
      title: `${labelFor(assignedId)} 마커 추가`,
      description: `"${selectedText}" — 밑줄 텍스트를 수정하면 오답이 됩니다.`,
    });
  }, [markers, text, onMarkersChange, toast]);

  // Handle double-click to add marker on clicked word
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    // Don't add marker if clicking on an existing marker
    const target = e.target as HTMLElement;
    if (target.closest('.marker-span')) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const selectedText = selection.toString().trim();
    if (selectedText) {
      const pos = getSelectionOriginalOffset();
      addMarkerFromSelection(selectedText, pos >= 0 ? pos : undefined);
    }
  }, [addMarkerFromSelection, getSelectionOriginalOffset]);

  // Handle Ctrl+1 to add marker on selected text
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const root = editorRef.current;
      if (!root) return;

      // Only handle when this editor is the active one (selection inside it,
      // or it contains the focused element). This prevents global handlers from
      // affecting other ManualQuestionEditor instances on the same page.
      const selection = window.getSelection();
      const selectionInside =
        selection && selection.rangeCount > 0 && root.contains(selection.anchorNode);
      const focusInside = root.contains(document.activeElement);
      if (!selectionInside && !focusInside) return;

      // Ctrl+Z: undo last marker
      if (e.ctrlKey && e.key === "z" && !e.shiftKey) {
        if (markers.length > 0) {
          e.preventDefault();
          const removed = markers[markers.length - 1];
          const circled = labelFor(removed.id);
          onMarkersChange(markers.slice(0, -1));
          toast({
            title: `${circled} 마커 취소`,
            description: `"${removed.original}" 마커가 제거되었습니다.`,
          });
        }
        return;
      }

      if (e.ctrlKey && e.key === "1") {
        e.preventDefault();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
          toast({
            title: "텍스트를 선택하세요",
            description: "먼저 지문에서 단어나 어구를 드래그하여 선택한 후 Ctrl+1을 누르세요.",
            variant: "destructive",
          });
          return;
        }

        const selectedText = selection.toString().trim();
        if (selectedText) {
          const pos = getSelectionOriginalOffset();
          addMarkerFromSelection(selectedText, pos >= 0 ? pos : undefined);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [markers, text, onMarkersChange, toast, getSelectionOriginalOffset, addMarkerFromSelection]);

  // Handle edits inside marker spans
  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    const editableSpans = editorRef.current.querySelectorAll(
      ".marker-underline[contenteditable]"
    );
    const updatedMarkers = [...markers];
    editableSpans.forEach((span) => {
      const id = parseInt(span.getAttribute("data-marker-id") || "0");
      const marker = updatedMarkers.find((m) => m.id === id);
      if (marker) {
        marker.modified = (span as HTMLElement).innerText.trim();
      }
    });
    onMarkersChange(updatedMarkers);
  }, [markers, onMarkersChange]);

  // Generate explanation for a single marker
  const generateExplanation = async (marker: ManualMarker) => {
    if (marker.modified === marker.original) {
      toast({
        title: "수정이 필요합니다",
        description: "오답을 만들기 위해 먼저 밑줄 텍스트를 수정하세요.",
        variant: "destructive",
      });
      return;
    }

    setGeneratingId(marker.id);
    try {
      const client = AIClientManager.getInstance().createClient();
      const typeLabel = typeId === "grammar" ? "어법(문법)" : "어휘";
      const prompt = `다음은 영어 ${typeLabel} 문제입니다. 원문에서 "${marker.original}"이 올바른 표현인데, 학생에게 "${marker.modified}"로 바뀐 오답이 제시됩니다.

왜 "${marker.modified}"가 틀리고 "${marker.original}"이 맞는지 한국어로 간결하게 설명해주세요. 
- ${typeId === "grammar" ? "문법적 규칙과 이유를 설명" : "어휘의 의미 차이와 문맥상 적절한 이유를 설명"}
- 2~3문장으로 간결하게
- 학생이 이해하기 쉽게

지문 맥락:
${text.substring(0, 500)}${text.length > 500 ? "..." : ""}`;

      const explanation = await client.generateCompletion(prompt);
      const updatedMarkers = markers.map((m) =>
        m.id === marker.id ? { ...m, explanation } : m
      );
      onMarkersChange(updatedMarkers);
      toast({ title: "해설 생성 완료", description: `${labelFor(marker.id)} 해설이 생성되었습니다.` });
    } catch (error) {
      toast({
        title: "해설 생성 실패",
        description: error instanceof Error ? error.message : "알 수 없는 오류",
        variant: "destructive",
      });
    } finally {
      setGeneratingId(null);
    }
  };

  // Generate all explanations
  const generateAllExplanations = async () => {
    const modifiedMarkers = markers.filter((m) => m.modified !== m.original);
    if (modifiedMarkers.length === 0) {
      toast({
        title: "수정된 마커가 없습니다",
        description: "오답을 만들기 위해 밑줄 텍스트를 수정하세요.",
        variant: "destructive",
      });
      return;
    }

    setGeneratingAll(true);
    try {
      const client = AIClientManager.getInstance().createClient();
      const typeLabel = typeId === "grammar" ? "어법(문법)" : "어휘";

      const pairs = modifiedMarkers
        .map(
          (m) =>
            `${labelFor(m.id)} 정답: "${m.original}" → 오답: "${m.modified}"`
        )
        .join("\n");

      const prompt = `다음은 영어 ${typeLabel} 문제에서 5개의 밑줄 선택지 중 오답으로 변경된 항목들입니다. 각각에 대해 왜 오답인지 한국어로 간결하게 설명해주세요.

${pairs}

지문 맥락:
${text.substring(0, 800)}${text.length > 800 ? "..." : ""}

각 항목별로 다음 형식으로 답변해주세요:
${modifiedMarkers.map((m) => `[${m.id}] 해설:`).join("\n")}

규칙:
- ${typeId === "grammar" ? "문법적 규칙과 이유를 설명" : "어휘의 의미 차이와 문맥상 적절한 이유를 설명"}
- 각 해설은 2~3문장으로 간결하게
- 학생이 이해하기 쉽게`;

      const result = await client.generateCompletion(prompt);

      // Parse explanations from result
      const updatedMarkers = [...markers];
      for (const m of modifiedMarkers) {
        const pattern = new RegExp(
          `\\[${m.id}\\]\\s*해설[：:]\\s*(.+?)(?=\\[\\d\\]|$)`,
          "s"
        );
        const match = result.match(pattern);
        if (match) {
          const idx = updatedMarkers.findIndex((um) => um.id === m.id);
          if (idx !== -1) {
            updatedMarkers[idx] = {
              ...updatedMarkers[idx],
              explanation: match[1].trim(),
            };
          }
        }
      }
      onMarkersChange(updatedMarkers);
      toast({ title: "일괄 해설 생성 완료", description: `${modifiedMarkers.length}개 해설이 생성되었습니다.` });
    } catch (error) {
      toast({
        title: "해설 생성 실패",
        description: error instanceof Error ? error.message : "알 수 없는 오류",
        variant: "destructive",
      });
    } finally {
      setGeneratingAll(false);
    }
  };

  const removeMarker = (id: number) => {
    const filtered = markers.filter((m) => m.id !== id);
    // Re-number markers
    const renumbered = filtered.map((m, i) => ({ ...m, id: i + 1 }));
    onMarkersChange(renumbered);
  };

  if (!text) {
    return (
      <div className="p-4 text-center text-sm text-slate-400 border border-dashed border-slate-200 rounded-xl">
        먼저 지문을 입력하세요
      </div>
    );
  }

  const isDifferentMeaning = typeId === 'sungeuiDifferentMeaning';
  const isReadOnly = isDifferentMeaning || isBlankMatch;

  return (
    <div className="space-y-3">
      {/* Instructions */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-violet-50 to-purple-50/50 border border-violet-100">
        <span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
        <span className="text-xs text-violet-700">
          {isBlankMatch ? (
            <>
              지문에서 빈칸으로 만들 단어를 위에서부터 순서대로 <strong>더블클릭</strong>하세요. (A)~(E)가 자동 지정됩니다 (정확히 5개). AI가 영영풀이와 선지를 생성합니다.
            </>
          ) : isDifferentMeaning ? (
            <>
              지문에서 명사구를 위에서부터 순서대로 드래그 선택 후 <kbd className="px-1.5 py-0.5 bg-violet-100 rounded text-[10px] font-mono font-bold">Ctrl+1</kbd> → ①~⑤ 선지 생성. 그 후 <strong>나머지와 의미가 다른</strong> 항목을 정답으로 선택하세요.
            </>
          ) : (
            <>
              단어를 <strong>더블클릭</strong>하거나 드래그 선택 후 <kbd className="px-1.5 py-0.5 bg-violet-100 rounded text-[10px] font-mono font-bold">Ctrl+1</kbd> → 마커 추가 (최대 5개). 밑줄 텍스트를 수정하면 오답이 됩니다.
            </>
          )}
        </span>
      </div>

      {/* Passage editor */}
      <div
        ref={editorRef}
        className="p-4 rounded-xl border border-slate-200 bg-white text-sm leading-relaxed min-h-[120px] focus-within:border-violet-300 focus-within:ring-1 focus-within:ring-violet-200 transition-all cursor-text selection:bg-violet-200"
        onInput={isReadOnly ? undefined : handleInput}
        onDoubleClick={handleDoubleClick}
        dangerouslySetInnerHTML={{ __html: getDisplayHtml() }}
        style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
      />

      {/* Marker list with explanations */}
      {markers.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">
              마커 목록 ({markers.length}/5)
              {isDifferentMeaning && (
                <span className="ml-2 text-[10px] text-violet-500 font-normal">
                  ※ 정답으로 표시할 마커를 선택하세요
                </span>
              )}
              {isBlankMatch && markers.length !== 5 && (
                <span className="ml-2 text-[10px] text-amber-600 font-normal">
                  ※ 정확히 5개를 선택하세요 (현재 {markers.length}개)
                </span>
              )}
            </span>
            {!isReadOnly && (
              <Button
                size="sm"
                variant="outline"
                onClick={generateAllExplanations}
                disabled={generatingAll}
                className="h-7 text-xs gap-1.5 border-violet-200 text-violet-600 hover:bg-violet-50"
              >
                {generatingAll ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                일괄 해설 생성
              </Button>
            )}
          </div>

          {markers.map((marker) => {
            const circled = labelFor(marker.id);
            const isModified = marker.modified && marker.modified !== marker.original;
            const isAnswer = isDifferentMeaning && isModified;
            return (
              <div
                key={marker.id}
                className={`p-3 rounded-lg border space-y-2 ${
                  isAnswer
                    ? 'border-emerald-300 bg-emerald-50/60'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs flex-1 min-w-0">
                    <span className="font-bold text-violet-600 text-sm">{circled}</span>
                    <span className="text-slate-500 flex-shrink-0">
                      {isDifferentMeaning ? '명사구:' : isBlankMatch ? '빈칸 단어:' : '정답:'}
                    </span>
                    <span className={`font-medium truncate ${isDifferentMeaning || isBlankMatch ? 'text-slate-700' : 'text-emerald-600'}`}>
                      {marker.original}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!isReadOnly && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => generateExplanation(marker)}
                        disabled={generatingId === marker.id || !isModified}
                        className="h-6 px-2 text-[10px] text-violet-500 hover:text-violet-700 hover:bg-violet-50"
                        title="개별 해설 생성"
                      >
                        {generatingId === marker.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Wand2 className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeMarker(marker.id)}
                      className="h-6 px-1.5 text-[10px] text-red-400 hover:text-red-600 hover:bg-red-50"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
                {isDifferentMeaning ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={isAnswer ? 'default' : 'outline'}
                        onClick={() => {
                          // Toggle: set this marker as answer (modified !== original via "ANSWER" sentinel),
                          // and clear answer flag from all others
                          const updated = markers.map((m) => {
                            if (m.id === marker.id) {
                              return { ...m, modified: isAnswer ? m.original : `__ANSWER__${m.original}` };
                            }
                            return { ...m, modified: m.original };
                          });
                          onMarkersChange(updated);
                        }}
                        className={`h-7 text-xs ${
                          isAnswer
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {isAnswer ? '✓ 정답으로 선택됨 (다른 의미)' : '정답으로 선택 (다른 의미)'}
                      </Button>
                      {isAnswer && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            setGeneratingId(marker.id);
                            try {
                              const client = AIClientManager.getInstance().createClient();
                              const otherPhrases = markers
                                .filter((m) => m.id !== marker.id)
                                .map((m) => `${labelFor(m.id)} "${m.original}"`)
                                .join(', ');
                              const prompt = `다음은 영어 지문에서 밑줄 친 명사구들의 의미를 비교하는 문제입니다.

지문:
${text}

밑줄 친 명사구들:
${markers.map((m) => `${labelFor(m.id)} "${m.original}"`).join('\n')}

정답: ${circled} "${marker.original}" (나머지 넷과 의미가 다름)

왜 ${circled} "${marker.original}"이(가) 나머지(${otherPhrases})와 의미가 다른지 한국어로 2~3문장으로 간결하게 설명해주세요. 학생이 이해하기 쉽게 작성하세요.`;
                              const explanation = await client.generateCompletion(prompt);
                              const updated = markers.map((m) =>
                                m.id === marker.id ? { ...m, explanation: explanation.trim() } : m
                              );
                              onMarkersChange(updated);
                              toast({ title: '해설 생성 완료', description: `${circled} 해설이 생성되었습니다.` });
                            } catch (error) {
                              toast({
                                title: '해설 생성 실패',
                                description: error instanceof Error ? error.message : '알 수 없는 오류',
                                variant: 'destructive',
                              });
                            } finally {
                              setGeneratingId(null);
                            }
                          }}
                          disabled={generatingId === marker.id}
                          className="h-7 px-2 text-[10px] text-violet-500 hover:text-violet-700 hover:bg-violet-50 gap-1"
                          title="AI로 해설 생성"
                        >
                          {generatingId === marker.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Wand2 className="w-3 h-3" />
                          )}
                          AI 해설
                        </Button>
                      )}
                    </div>
                    {isAnswer && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-slate-500 flex-shrink-0 pt-1.5">이유:</span>
                        <textarea
                          value={marker.explanation || ''}
                          onChange={(e) => {
                            const updated = markers.map((m) =>
                              m.id === marker.id ? { ...m, explanation: e.target.value } : m
                            );
                            onMarkersChange(updated);
                          }}
                          placeholder="왜 이 항목이 나머지와 의미가 다른지 설명을 입력하세요..."
                          rows={2}
                          className="flex-1 text-xs px-2 py-1.5 rounded border border-emerald-200 bg-white text-slate-700 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 outline-none resize-y"
                        />
                      </div>
                    )}
                  </div>
                ) : isBlankMatch ? null : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 flex-shrink-0">오답:</span>
                    <input
                      type="text"
                      value={marker.modified}
                      onChange={(e) => {
                        const updatedMarkers = markers.map((m) =>
                          m.id === marker.id ? { ...m, modified: e.target.value } : m
                        );
                        onMarkersChange(updatedMarkers);
                      }}
                      className={`flex-1 text-xs px-2 py-1 rounded border outline-none transition-colors ${
                        isModified
                          ? 'border-red-200 bg-red-50/50 text-red-700 focus:border-red-400 focus:ring-1 focus:ring-red-200'
                          : 'border-slate-200 bg-white text-slate-700 focus:border-violet-400 focus:ring-1 focus:ring-violet-200'
                      }`}
                      placeholder="오답으로 수정할 텍스트 입력..."
                    />
                  </div>
                )}
                {marker.explanation && (
                  <div className="text-xs text-slate-600 bg-white p-2.5 rounded-md border border-slate-100 leading-relaxed">
                    <span className="font-semibold text-violet-600">해설:</span>{" "}
                    {marker.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Styles */}
      <style>{`
        .marker-span {
          display: inline;
        }
        .marker-num {
          color: hsl(var(--primary));
          font-weight: 700;
          margin-right: 1px;
          user-select: none;
        }
        .marker-underline {
          text-decoration: underline;
          text-decoration-thickness: 2px;
          text-underline-offset: 3px;
          text-decoration-color: hsl(var(--primary) / 0.5);
          padding: 1px 2px;
          border-radius: 2px;
          outline: none;
          transition: background-color 0.15s;
        }
        .marker-underline:focus {
          background-color: hsl(var(--primary) / 0.08);
          text-decoration-color: hsl(var(--primary));
        }
        .marker-underline.modified {
          background-color: hsl(0 84% 60% / 0.08);
          text-decoration-color: hsl(0 84% 60% / 0.5);
          color: hsl(0 84% 40%);
        }
        .marker-underline.modified:focus {
          background-color: hsl(0 84% 60% / 0.15);
        }
      `}</style>
    </div>
  );
};
