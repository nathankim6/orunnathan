
import { useState, useEffect } from "react";
import { QuestionType, TypeEntry, PassageEntry, ManualMarker } from "@/types/question";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { useVeritasCache } from "@/hooks/use-veritas-cache";

export const useQuestionState = () => {
  const [selectedTypes, setSelectedTypes] = useState<TypeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [difficulty, setDifficulty] = useState("1");
  const [complexity, setComplexity] = useState("수능");
  const { toast } = useToast();
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  
  // Pre-cache Veritas data for fast grammar question generation
  const { selectDiversePairs, hasData, isLoading: isLoadingVeritas } = useVeritasCache();

  useEffect(() => {
    if (hasData) {
      console.log('✅ Veritas cache ready for fast grammar question generation');
    }
  }, [hasData]);


  const handleTypeSelect = (type: QuestionType) => {
    try {
      if (selectedTypes.some((entry) => entry.type.id === type.id)) {
        toast({
          title: "중복 선택",
          description: "이미 선택된 문제 유형입니다.",
          variant: "destructive",
        });
        return;
      }

      const initialPassages = type.id === 'danggokListening'
        ? Array.from({ length: 5 }, () => ({ id: uuidv4(), title: "", text: "", result: "", orderMode: 'basic' as const, summaryMode: 'two-blanks' as const }))
        : [{ id: uuidv4(), title: "", text: "", result: "", orderMode: 'basic' as const, summaryMode: 'two-blanks' as const }];

      setSelectedTypes((prev) => [
        ...prev,
        {
          type,
          passages: initialPassages,
        },
      ]);

      console.log(`Added type: ${type.id}`);
    } catch (error) {
      console.error("Error adding type:", error);
      toast({
        title: "오류 발생",
        description: "문제 유형을 추가하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveType = (typeId: string) => {
    try {
      setSelectedTypes((prev) => {
        const newTypes = prev.filter((entry) => entry.type.id !== typeId);
        console.log(`Removed type: ${typeId}. New types:`, newTypes);
        return newTypes;
      });
    } catch (error) {
      console.error("Error removing type:", error);
      toast({
        title: "오류 발생",
        description: "문제 유형을 제거하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveAllTypes = () => {
    try {
      setSelectedTypes([]);
      console.log("Removed all types");
      toast({
        title: "모든 유형 제거",
        description: "선택된 모든 문제 유형이 제거되었습니다.",
      });
    } catch (error) {
      console.error("Error removing all types:", error);
      toast({
        title: "오류 발생",
        description: "모든 유형을 제거하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleAddPassage = (typeId: string) => {
    setSelectedTypes(
      selectedTypes.map((entry) =>
        entry.type.id === typeId
          ? {
              ...entry,
              passages: [
                ...entry.passages,
                { id: uuidv4(), title: "", text: "", result: "", orderMode: 'basic', summaryMode: 'two-blanks' },
              ],
            }
          : entry
      )
    );
  };

  const handleRemovePassage = (typeId: string, passageId: string) => {
    setSelectedTypes(
      selectedTypes.map((entry) =>
        entry.type.id === typeId
          ? {
              ...entry,
              passages: entry.passages.filter((p) => p.id !== passageId),
            }
          : entry
      )
    );
  };

  const handleTextChange = (
    typeId: string,
    passageId: string,
    newText: string
  ) => {
    setSelectedTypes(
      selectedTypes.map((entry) =>
        entry.type.id === typeId
          ? {
              ...entry,
              passages: entry.passages.map((passage) =>
                passage.id === passageId
                  ? { ...passage, text: newText }
                  : passage
              ),
            }
          : entry
      )
    );
  };

  const handleTitleChange = (
    typeId: string,
    passageId: string,
    newTitle: string
  ) => {
    setSelectedTypes(
      selectedTypes.map((entry) =>
        entry.type.id === typeId
          ? {
              ...entry,
              passages: entry.passages.map((passage) =>
                passage.id === passageId
                  ? { ...passage, title: newTitle }
                  : passage
              ),
            }
          : entry
      )
    );
  };

  const handlePasteValues = (
    typeId: string,
    passageId: string,
    values: string[],
    titles?: string[]
  ) => {
    if (values.length === 0) return;
    
    const updatedTypes = [...selectedTypes];
    const typeIndex = updatedTypes.findIndex((t) => t.type.id === typeId);
    
    if (typeIndex === -1) return;
    
    const currentPassages = [...updatedTypes[typeIndex].passages];
    const startPassageIndex = currentPassages.findIndex(p => p.id === passageId);
    if (startPassageIndex === -1) return;
    
    // Update the first passage
    currentPassages[startPassageIndex].text = values[0];
    if (titles && titles[0]) {
      currentPassages[startPassageIndex].title = titles[0];
    }
    const inheritMode = currentPassages[startPassageIndex].orderMode ?? 'basic';
    
    // For each additional value, either update existing passage or add new one
    for (let i = 1; i < values.length; i++) {
      const targetIndex = startPassageIndex + i;
      
      if (targetIndex < currentPassages.length) {
        currentPassages[targetIndex].text = values[i];
        if (titles && titles[i]) {
          currentPassages[targetIndex].title = titles[i];
        }
        if (currentPassages[targetIndex].orderMode === undefined) {
          currentPassages[targetIndex].orderMode = inheritMode;
        }
      } else {
        currentPassages.push({
          id: uuidv4(),
          title: titles?.[i] || "",
          text: values[i],
          result: "",
          orderMode: inheritMode,
          summaryMode: 'two-blanks'
        });
      }
    }
    
    updatedTypes[typeIndex].passages = currentPassages;
    setSelectedTypes(updatedTypes);
    
    console.log(`Pasted ${values.length} values into type ${typeId}, resulting in ${currentPassages.length} passages`);
  };

  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
      setProgress({ current: 0, total: 0 });
      toast({
        title: "생성 중단",
        description: "문제 생성이 중단되었습니다.",
      });
    }
  };

  const handleDifficultyChange = (level: string) => {
    setDifficulty(level);
  };

  const handleComplexityChange = (level: string) => {
    setComplexity(level);
  };

  const handleOrderModeChange = (
    typeId: string,
    passageId: string,
    mode: 'basic' | 'advanced'
  ) => {
    setSelectedTypes(prev => prev.map(entry => {
      if (entry.type.id === typeId) {
        const isFirstPassage = entry.passages.length > 0 && entry.passages[0].id === passageId;
        return {
          ...entry,
          passages: entry.passages.map(p =>
            isFirstPassage ? { ...p, orderMode: mode } : (p.id === passageId ? { ...p, orderMode: mode } : p)
          )
        };
      }
      return entry;
    }));
  };

  const handleSummaryModeChange = (
    typeId: string,
    passageId: string,
    mode: 'two-blanks' | 'three-blanks'
  ) => {
    setSelectedTypes(prev => prev.map(entry => {
      if (entry.type.id === typeId) {
        const isFirstPassage = entry.passages.length > 0 && entry.passages[0].id === passageId;
        return {
          ...entry,
          passages: entry.passages.map(p =>
            isFirstPassage ? { ...p, summaryMode: mode } : (p.id === passageId ? { ...p, summaryMode: mode } : p)
          )
        };
      }
      return entry;
    }));
  };

  const handleChoiceLanguageChange = (
    typeId: string,
    passageId: string,
    lang: 'english' | 'korean'
  ) => {
    setSelectedTypes(prev => prev.map(entry => {
      if (entry.type.id === typeId) {
        return {
          ...entry,
          passages: entry.passages.map(p =>
            p.id === passageId ? { ...p, choiceLanguage: lang } : p
          )
        };
      }
      return entry;
    }));
  };

  const handleManualModeChange = (
    typeId: string,
    passageId: string,
    mode: boolean
  ) => {
    setSelectedTypes(prev => prev.map(entry => {
      if (entry.type.id === typeId) {
        return {
          ...entry,
          passages: entry.passages.map(p =>
            p.id === passageId ? { ...p, manualMode: mode, manualMarkers: mode ? (p.manualMarkers || []) : [] } : p
          )
        };
      }
      return entry;
    }));
  };

  const handleManualMarkersChange = (
    typeId: string,
    passageId: string,
    markers: ManualMarker[]
  ) => {
    setSelectedTypes(prev => prev.map(entry => {
      if (entry.type.id === typeId) {
        return {
          ...entry,
          passages: entry.passages.map(p =>
            p.id === passageId ? { ...p, manualMarkers: markers } : p
          )
        };
      }
      return entry;
    }));
  };

  const handleCombinedTypesChange = (
    typeId: string,
    passageId: string,
    combinedTypes: string[]
  ) => {
    setSelectedTypes(prev => prev.map(entry => {
      if (entry.type.id === typeId) {
        return {
          ...entry,
          passages: entry.passages.map(p =>
            p.id === passageId ? { ...p, combinedTypes } : p
          )
        };
      }
      return entry;
    }));
  };

  const handleParaphraseBlankChange = (
    typeId: string,
    passageId: string,
    paraphraseBlank: boolean
  ) => {
    setSelectedTypes(prev => prev.map(entry => {
      if (entry.type.id === typeId) {
        return {
          ...entry,
          passages: entry.passages.map(p =>
            p.id === passageId ? { ...p, paraphraseBlank } : p
          )
        };
      }
      return entry;
    }));
  };

  const handleSubTypeChange = (
    typeId: string,
    passageId: string,
    subType: 'underline' | 'boxed'
  ) => {
    setSelectedTypes(prev => prev.map(entry => {
      if (entry.type.id === typeId) {
        // 첫 지문에서 변경하면 같은 유형의 모든 지문에 적용
        const isFirstPassage = entry.passages.length > 0 && entry.passages[0].id === passageId;
        return {
          ...entry,
          passages: entry.passages.map(p =>
            isFirstPassage ? { ...p, subType } : (p.id === passageId ? { ...p, subType } : p)
          )
        };
      }
      return entry;
    }));
  };

  return {
    selectedTypes,
    setSelectedTypes,
    isLoading,
    setIsLoading,
    progress,
    setProgress,
    difficulty,
    complexity,
    handleDifficultyChange,
    handleComplexityChange,
    handleTypeSelect,
    handleRemoveType,
    handleRemoveAllTypes,
    handleAddPassage,
    handleRemovePassage,
    handleTextChange,
    handleTitleChange,
    handlePasteValues,
    handleStopGeneration,
    setAbortController,
    toast,
    handleOrderModeChange,
    handleSummaryModeChange,
    handleChoiceLanguageChange,
    handleManualModeChange,
    handleManualMarkersChange,
    handleCombinedTypesChange,
    handleParaphraseBlankChange,
    handleSubTypeChange,
    selectDiversePairs,
    hasVeritasData: hasData,
    isLoadingVeritas
  };
};
