-- Create table for storing generated questions
CREATE TABLE public.generated_questions_storage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  access_code TEXT NOT NULL,
  title TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.generated_questions_storage ENABLE ROW LEVEL SECURITY;

-- Create policies for access
CREATE POLICY "Anyone can view generated questions storage"
ON public.generated_questions_storage
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert generated questions storage"
ON public.generated_questions_storage
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update generated questions storage"
ON public.generated_questions_storage
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete generated questions storage"
ON public.generated_questions_storage
FOR DELETE
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_generated_questions_storage_updated_at
BEFORE UPDATE ON public.generated_questions_storage
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_generated_questions_storage_access_code ON public.generated_questions_storage(access_code);
CREATE INDEX idx_generated_questions_storage_created_at ON public.generated_questions_storage(created_at DESC);
