-- Add image_url to activity_suggestions for photo uploads
ALTER TABLE public.activity_suggestions
  ADD COLUMN image_url TEXT;

-- Create storage bucket for suggestion images
INSERT INTO storage.buckets (id, name, public)
VALUES ('suggestion-images', 'suggestion-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for suggestion images
CREATE POLICY "Anyone can view suggestion images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'suggestion-images');

CREATE POLICY "Users can upload suggestion images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'suggestion-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Update suggestion policies to allow vrijwilligers to update and delete
CREATE POLICY "Vrijwilligers can update suggestions"
  ON public.activity_suggestions FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'vrijwilliger'));

CREATE POLICY "Vrijwilligers can delete suggestions"
  ON public.activity_suggestions FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'vrijwilliger'));

-- Create storage bucket for activity images
INSERT INTO storage.buckets (id, name, public)
VALUES ('activity-images', 'activity-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for activity images
CREATE POLICY "Anyone can view activity images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'activity-images');

CREATE POLICY "Vrijwilligers can upload activity images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'activity-images' 
    AND public.has_role(auth.uid(), 'vrijwilliger')
  );

CREATE POLICY "Vrijwilligers can update activity images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'activity-images'
    AND public.has_role(auth.uid(), 'vrijwilliger')
  );

CREATE POLICY "Vrijwilligers can delete activity images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'activity-images'
    AND public.has_role(auth.uid(), 'vrijwilliger')
  );