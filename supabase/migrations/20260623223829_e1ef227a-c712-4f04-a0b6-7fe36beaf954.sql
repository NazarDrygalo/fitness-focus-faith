
CREATE TABLE public.bible_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reference TEXT NOT NULL,
  verse_text TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bible_highlights TO authenticated;
GRANT ALL ON public.bible_highlights TO service_role;
ALTER TABLE public.bible_highlights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own highlights" ON public.bible_highlights
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_bible_highlights_user ON public.bible_highlights(user_id, created_at DESC);

CREATE TABLE public.bible_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reflection_date DATE NOT NULL,
  reference TEXT NOT NULL,
  prompt TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, reflection_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bible_reflections TO authenticated;
GRANT ALL ON public.bible_reflections TO service_role;
ALTER TABLE public.bible_reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reflections" ON public.bible_reflections
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_bible_reflections_updated_at BEFORE UPDATE ON public.bible_reflections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.reading_plan_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  day_index INTEGER NOT NULL,
  completed_on DATE NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, plan_id, day_index)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_plan_progress TO authenticated;
GRANT ALL ON public.reading_plan_progress TO service_role;
ALTER TABLE public.reading_plan_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own plan progress" ON public.reading_plan_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_reading_plan_progress_user_plan ON public.reading_plan_progress(user_id, plan_id);
