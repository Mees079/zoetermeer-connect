-- Add end_date to activities
ALTER TABLE public.activities ADD COLUMN end_date timestamp with time zone;

-- Add fields to activity_reviews for anonymous reviews
ALTER TABLE public.activity_reviews 
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN reviewer_name text,
  ADD COLUMN reviewer_email text,
  ADD COLUMN photo_url text;

-- Update RLS policy for activity_reviews to allow anonymous reviews
DROP POLICY IF EXISTS "Participants can create reviews" ON public.activity_reviews;

CREATE POLICY "Anyone can create reviews" 
ON public.activity_reviews 
FOR INSERT 
WITH CHECK (true);

-- Insert example reviews
INSERT INTO public.activity_reviews (activity_id, rating, comment, reviewer_name, reviewer_email, photo_url)
SELECT 
  id as activity_id,
  5 as rating,
  'Geweldige activiteit! Ik heb veel plezier gehad en nieuwe mensen leren kennen.' as comment,
  'Maria de Vries' as reviewer_name,
  'maria@example.com' as reviewer_email,
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' as photo_url
FROM public.activities
LIMIT 1;

INSERT INTO public.activity_reviews (activity_id, rating, comment, reviewer_name, reviewer_email, photo_url)
SELECT 
  id as activity_id,
  4 as rating,
  'Leuke middag gehad. De vrijwilligers waren erg behulpzaam.' as comment,
  'Jan Bakker' as reviewer_name,
  'jan.bakker@example.com' as reviewer_email,
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' as photo_url
FROM public.activities
LIMIT 1;

INSERT INTO public.activity_reviews (activity_id, rating, comment, reviewer_name, reviewer_email, photo_url)
SELECT 
  id as activity_id,
  5 as rating,
  'Fantastisch initiatief! Kom zeker terug.' as comment,
  'Els Jansen' as reviewer_name,
  'els.jansen@example.com' as reviewer_email,
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face' as photo_url
FROM public.activities
LIMIT 1;