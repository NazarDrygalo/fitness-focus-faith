CREATE TABLE public.prayer_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  details text,
  answered boolean NOT NULL DEFAULT false,
  answered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prayer_entries TO authenticated;
GRANT ALL ON public.prayer_entries TO service_role;
ALTER TABLE public.prayer_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own prayers" ON public.prayer_entries FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER prayer_updated BEFORE UPDATE ON public.prayer_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.group_verse_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  verse_date date NOT NULL,
  reference text NOT NULL,
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 500),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.group_verse_posts TO authenticated;
GRANT ALL ON public.group_verse_posts TO service_role;
ALTER TABLE public.group_verse_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read" ON public.group_verse_posts FOR SELECT TO authenticated
  USING (public.is_group_member(group_id, auth.uid()));
CREATE POLICY "members post" ON public.group_verse_posts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.is_group_member(group_id, auth.uid()));
CREATE POLICY "own delete" ON public.group_verse_posts FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
CREATE INDEX ON public.group_verse_posts (group_id, verse_date);

CREATE TABLE public.bible_reading_days (
  user_id uuid NOT NULL,
  read_on date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, read_on)
);
GRANT SELECT, INSERT, DELETE ON public.bible_reading_days TO authenticated;
GRANT ALL ON public.bible_reading_days TO service_role;
ALTER TABLE public.bible_reading_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reading days" ON public.bible_reading_days FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.bible_highlights
  ADD COLUMN ease numeric NOT NULL DEFAULT 2.5,
  ADD COLUMN interval_days integer NOT NULL DEFAULT 0,
  ADD COLUMN due_on date NOT NULL DEFAULT CURRENT_DATE;