DELETE FROM public.bible_highlights a
USING public.bible_highlights b
WHERE a.user_id = b.user_id AND a.reference = b.reference AND a.ctid > b.ctid;

ALTER TABLE public.bible_highlights
  ADD CONSTRAINT bible_highlights_user_id_reference_key UNIQUE (user_id, reference);