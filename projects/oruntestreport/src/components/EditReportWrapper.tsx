import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getReportCardById } from '@/integrations/supabase/reportService';
import ReportForm from './ReportForm';
import { toast } from 'sonner';

const EditReportWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [schoolType, setSchoolType] = useState<'middle' | 'high' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getReportCardById(id).then(({ data, error }) => {
        if (data && !error) {
          // Determine school type from school name
          const isHighSchool = data.school?.includes('고등') || data.school?.includes('고');
          setSchoolType(isHighSchool ? 'high' : 'middle');
        } else {
          console.error('Error fetching report card:', error);
          toast.error('보고서를 불러오는 중 오류가 발생했습니다.');
          setSchoolType('middle'); // fallback to middle school
        }
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="u-page u-center">
        <div className="u-loader" role="status" aria-live="polite">
          <span className="u-loader-ring" aria-hidden="true" />
          <span className="u-eyebrow u-eyebrow--gold">Loading · Report Editor</span>
          <p>리포트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return <ReportForm schoolType={schoolType || 'middle'} />;
};

export default EditReportWrapper;
