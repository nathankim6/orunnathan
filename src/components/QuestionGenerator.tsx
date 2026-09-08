
import { useState } from "react";
import { QuestionProvider } from "./question/QuestionContext";
import { useQuestionState } from "./question/QuestionState";
import { useQuestionActions } from "./question/QuestionActions";
import { Sidebar } from "./question/Sidebar";
import { MainContent } from "./question/MainContent";
import { MockExamGenerator } from "./mock-exam/MockExamGenerator";
import { QuestionsStorage } from "./question/QuestionsStorage";
import { SaveQuestionsDialog } from "./question/SaveQuestionsDialog";
import { useQuestionsStorage } from "@/hooks/use-questions-storage";

export const QuestionGenerator = () => {
  const questionState = useQuestionState();
  const {
    selectedTypes,
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
    setSelectedTypes,
  } = questionState;

  const { saveQuestions } = useQuestionsStorage();

  // Update the handleDownloadDoc function to match the expected signature
  const { 
    handleGenerateAll, 
    handleContinueGeneration, 
    handleDownloadDoc,
    checkGenerationStats 
  } = useQuestionActions({
    selectedTypes,
    setIsLoading,
    setProgress,
    setSelectedTypes,
    setAbortController,
    difficulty,
    complexity,
    toast,
    saveQuestions,
    selectDiversePairs
  });

  // 생성 상태 체크
  const generationStats = checkGenerationStats();

  const [showVocabModal, setShowVocabModal] = useState(false);
  const [showMockExamModal, setShowMockExamModal] = useState(false);
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleRefreshQuestion = (questionId: string, newContent: string) => {
    setSelectedTypes(prevTypes => prevTypes.map(typeEntry => ({
      ...typeEntry,
      passages: typeEntry.passages.map(passage => 
        passage.id === questionId 
          ? { ...passage, result: newContent }
          : passage
      )
    })));
  };

  const extractTitleFromResult = (result: string): { title: string; content: string } => {
    const knownTags = ['서답형', 'OUTPUT', 'OUPUT', '출력', '정답', '해설', 'output'];
    const match = result.match(/^\s*\[([^\]]+)\]\s*/);
    if (match) {
      const potentialTitle = match[1].trim();
      if (!knownTags.some(tag => potentialTitle.toLowerCase() === tag.toLowerCase())) {
        return { title: potentialTitle, content: result.substring(match[0].length) };
      }
    }
    return { title: '', content: result };
  };

  const generatedQuestions = selectedTypes.flatMap((typeEntry) => 
    typeEntry.passages
      .map((passage) => {
        const manualTitle = passage.title || '';
        const { title: extractedTitle, content: cleanedResult } = extractTitleFromResult(passage.result);
        const finalTitle = manualTitle || extractedTitle;
        return {
          id: passage.id,
          content: finalTitle && extractedTitle ? cleanedResult : passage.result,
          questionNumber: 0,
          originalText: passage.text,
          type: typeEntry.type.id,
          passageTitle: finalTitle
        };
      })
      .filter(q => q.content)
  );

  const handleSaveQuestions = () => {
    if (generatedQuestions.length === 0) {
      toast({
        title: "저장 불가",
        description: "저장할 문제가 없습니다.",
        variant: "destructive",
      });
      return;
    }
    setShowSaveDialog(true);
  };

  const contextValue = {
    selectedTypes,
    isLoading,
    progress,
    onTypeSelect: handleTypeSelect,
    onRemoveType: handleRemoveType,
    onAddPassage: handleAddPassage,
    onRemovePassage: handleRemovePassage,
    onTextChange: handleTextChange,
    onPasteValues: handlePasteValues,
    onOrderModeChange: handleOrderModeChange,
    onSummaryModeChange: handleSummaryModeChange,
  };

  return (
    <QuestionProvider value={contextValue}>
      <div className="toss-smooth flex gap-8">
        <Sidebar
          selectedTypes={selectedTypes}
          handleTypeSelect={handleTypeSelect}
          handleRemoveType={handleRemoveType}
          handleRemoveAllTypes={handleRemoveAllTypes}
          handleReorderTypes={(from, to) =>
            setSelectedTypes((prev) => {
              const next = [...prev];
              const [moved] = next.splice(from, 1);
              next.splice(to, 0, moved);
              return next;
            })
          }
          handleGenerateAll={handleGenerateAll}
          handleContinueGeneration={handleContinueGeneration}
          isLoading={isLoading}
          difficulty={difficulty}
          complexity={complexity}
          handleDifficultyChange={handleDifficultyChange}
          handleComplexityChange={handleComplexityChange}
          handleStopGeneration={handleStopGeneration}
          handleDownloadDoc={handleDownloadDoc}
          openVocabModal={() => setShowVocabModal(true)}
          openStorageModal={() => setShowStorageModal(true)}
          openMockExamModal={() => setShowMockExamModal(true)}
          progress={progress}
          generationStats={generationStats}
        />


        <MainContent
          selectedTypes={selectedTypes}
          isLoading={isLoading}
          progress={progress}
          handleAddPassage={handleAddPassage}
          handleRemovePassage={handleRemovePassage}
          handleTextChange={handleTextChange}
          handleTitleChange={handleTitleChange}
          handlePasteValues={handlePasteValues}
          handleRemoveType={handleRemoveType}
          handleRemoveAllTypes={handleRemoveAllTypes}
          handleGenerateAll={handleGenerateAll}
          handleDownloadDoc={handleDownloadDoc} // Using without passing format
          difficulty={difficulty}
          complexity={complexity}
          handleDifficultyChange={handleDifficultyChange}
          handleComplexityChange={handleComplexityChange}
          handleStopGeneration={handleStopGeneration}
          generatedQuestions={generatedQuestions}
          onOrderModeChange={handleOrderModeChange}
          onSummaryModeChange={handleSummaryModeChange}
          onChoiceLanguageChange={handleChoiceLanguageChange}
          onManualModeChange={handleManualModeChange}
          onManualMarkersChange={handleManualMarkersChange}
          onCombinedTypesChange={handleCombinedTypesChange}
          onParaphraseBlankChange={handleParaphraseBlankChange}
          onSubTypeChange={handleSubTypeChange}
          onRefreshQuestion={handleRefreshQuestion}
          onReorderTypes={(from, to) =>
            setSelectedTypes((prev) => {
              const next = [...prev];
              const [moved] = next.splice(from, 1);
              next.splice(to, 0, moved);
              return next;
            })
          }
        />
      </div>

      {/* Vocab Modal */}
      {showVocabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-[95vw] h-[95vh] rounded-lg shadow-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowVocabModal(false)}
            >
              ✕
            </button>
            <iframe
              src="https://vocabulary-voyage.lovable.app/"
              className="w-full h-full rounded-lg"
              title="Vocabulary Generator"
            />
          </div>
        </div>
      )}

      {/* Mock Exam Generator */}
      <MockExamGenerator 
        isOpen={showMockExamModal} 
        onClose={() => setShowMockExamModal(false)} 
      />

      {/* Questions Storage */}
      <QuestionsStorage
        isOpen={showStorageModal}
        onClose={() => setShowStorageModal(false)}
      />

      {/* Save Questions Dialog */}
      <SaveQuestionsDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        questions={generatedQuestions}
      />
    </QuestionProvider>
  );
};
