import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Archive, 
  Search, 
  Plus, 
  Filter,
  SortDesc,
  FileText,
  Loader2,
  FolderOpen
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SavedExamItem } from './SavedExamItem';
import { useSavedExams, SavedExam } from '@/hooks/use-saved-exams';

interface SavedExamsStorageProps {
  onLoadExam: (exam: SavedExam) => void;
  onCreateNew: () => void;
}

export const SavedExamsStorage = ({ onLoadExam, onCreateNew }: SavedExamsStorageProps) => {
  const { savedExams, loading } = useSavedExams();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated');
  const [filterBy, setFilterBy] = useState<'all' | 'with-analysis' | 'with-questions'>('all');

  const filteredExams = savedExams
    .filter(exam => {
      const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (exam.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filterBy === 'all' ||
                           (filterBy === 'with-analysis' && exam.analysis_result) ||
                           (filterBy === 'with-questions' && exam.generated_questions);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'updated':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

  const handleViewExam = (exam: SavedExam) => {
    onLoadExam(exam);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
            <FolderOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              저장된 모의고사
            </h2>
            <p className="text-slate-500 text-sm">
              총 {savedExams.length}개의 저장된 시험
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="시험 제목이나 설명으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-36 bg-slate-50 border-slate-200 text-slate-700">
              <SortDesc className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 shadow-lg">
              <SelectItem value="updated" className="text-slate-700 hover:bg-slate-50">
                최근 수정순
              </SelectItem>
              <SelectItem value="created" className="text-slate-700 hover:bg-slate-50">
                생성일순
              </SelectItem>
              <SelectItem value="title" className="text-slate-700 hover:bg-slate-50">
                제목순
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
            <SelectTrigger className="w-36 bg-slate-50 border-slate-200 text-slate-700">
              <Filter className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 shadow-lg">
              <SelectItem value="all" className="text-slate-700 hover:bg-slate-50">
                전체
              </SelectItem>
              <SelectItem value="with-analysis" className="text-slate-700 hover:bg-slate-50">
                분석 완료
              </SelectItem>
              <SelectItem value="with-questions" className="text-slate-700 hover:bg-slate-50">
                생성 완료
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={onCreateNew}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          새 모의고사 만들기
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-indigo-50 rounded-full">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              </div>
              <p className="text-slate-500">저장된 시험을 불러오는 중...</p>
            </div>
          </div>
        ) : filteredExams.length === 0 ? (
          <Card className="bg-slate-50 border-slate-200 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                <FileText className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                {searchQuery || filterBy !== 'all' ? '검색 결과가 없습니다' : '저장된 시험이 없습니다'}
              </h3>
              <p className="text-slate-500 mb-6 max-w-sm">
                {searchQuery || filterBy !== 'all' 
                  ? '다른 검색어나 필터를 시도해보세요' 
                  : '새로운 모의고사를 만들어 시작해보세요'
                }
              </p>
              {!searchQuery && filterBy === 'all' && (
                <Button
                  onClick={onCreateNew}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-md"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  새 모의고사 만들기
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-full">
            <div className="grid gap-3">
              {filteredExams.map((exam) => (
                <SavedExamItem
                  key={exam.id}
                  exam={exam}
                  onView={handleViewExam}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};
