CREATE TABLE public.weight_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  log_date DATE NOT NULL,
  weight NUMERIC(5,1) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'lb',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, log_date)
);

ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own weight logs"
ON public.weight_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own weight logs"
ON public.weight_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weight logs"
ON public.weight_logs FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weight logs"
ON public.weight_logs FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_weight_logs_updated_at
BEFORE UPDATE ON public.weight_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();