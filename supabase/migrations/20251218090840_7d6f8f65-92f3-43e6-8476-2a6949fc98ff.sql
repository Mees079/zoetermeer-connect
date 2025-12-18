-- Add policy for vrijwilligers to delete any review
CREATE POLICY "Vrijwilligers can delete any review" 
ON public.activity_reviews 
FOR DELETE 
USING (has_role(auth.uid(), 'vrijwilliger'::app_role));