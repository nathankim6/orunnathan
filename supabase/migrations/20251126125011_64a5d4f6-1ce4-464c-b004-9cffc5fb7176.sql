-- Veritas 어법 대립쌍 분석 데이터를 저장할 테이블
CREATE TABLE IF NOT EXISTS public.categorized_veritas_pairs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  correct_form text NOT NULL,
  incorrect_form text NOT NULL,
  category text NOT NULL,
  explanation text,
  usage_count integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX idx_categorized_veritas_category ON public.categorized_veritas_pairs(category);
CREATE INDEX idx_categorized_veritas_usage ON public.categorized_veritas_pairs(usage_count DESC);

-- RLS 활성화
ALTER TABLE public.categorized_veritas_pairs ENABLE ROW LEVEL SECURITY;

-- 모두가 읽을 수 있도록
CREATE POLICY "Anyone can read categorized veritas pairs"
  ON public.categorized_veritas_pairs
  FOR SELECT
  USING (true);

-- 인증된 사용자만 삽입/수정
CREATE POLICY "Authenticated users can insert categorized veritas pairs"
  ON public.categorized_veritas_pairs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categorized veritas pairs"
  ON public.categorized_veritas_pairs
  FOR UPDATE
  USING (true);

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_categorized_veritas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categorized_veritas_pairs_updated_at
  BEFORE UPDATE ON public.categorized_veritas_pairs
  FOR EACH ROW
  EXECUTE FUNCTION update_categorized_veritas_updated_at();
