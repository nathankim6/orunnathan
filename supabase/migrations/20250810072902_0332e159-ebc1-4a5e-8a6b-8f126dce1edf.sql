-- Create saved_mock_exams table
CREATE TABLE public.saved_mock_exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  question_configs JSONB NOT NULL,
  analysis_result JSONB,
  generated_questions JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.saved_mock_exams ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own saved exams" 
ON public.saved_mock_exams 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved exams" 
ON public.saved_mock_exams 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved exams" 
ON public.saved_mock_exams 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved exams" 
ON public.saved_mock_exams 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_saved_exams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_saved_mock_exams_updated_at
BEFORE UPDATE ON public.saved_mock_exams
FOR EACH ROW
EXECUTE FUNCTION public.update_saved_exams_updated_at();
