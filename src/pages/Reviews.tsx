import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Star, Loader2, User, Plus, Trash2, ImageOff } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  reviewer_name: string | null;
  reviewer_email: string | null;
  photo_url: string | null;
  created_at: string;
  activity_title?: string;
}

const Reviews = () => {
  const { hasRole } = useAuth();
  const isVrijwilliger = hasRole('vrijwilliger') || hasRole('admin');
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activities, setActivities] = useState<{ id: string; title: string }[]>([]);
  const [photoPreviewError, setPhotoPreviewError] = useState(false);
  
  const [reviewForm, setReviewForm] = useState({
    activity_id: '',
    rating: 5,
    comment: '',
    reviewer_name: '',
    reviewer_email: '',
    photo_url: '',
  });

  useEffect(() => {
    fetchReviews();
    fetchActivities();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_reviews')
        .select(`
          *,
          activities (title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedReviews = (data || []).map((review: any) => ({
        ...review,
        activity_title: review.activities?.title,
      }));

      setReviews(formattedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Fout bij het ophalen van recensies');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    const { data } = await supabase
      .from('activities')
      .select('id, title')
      .order('date', { ascending: false });
    
    setActivities(data || []);
  };

  const handleSubmitReview = async () => {
    if (!reviewForm.activity_id || !reviewForm.reviewer_name || !reviewForm.reviewer_email) {
      toast.error('Vul alle verplichte velden in');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('activity_reviews')
        .insert({
          activity_id: reviewForm.activity_id,
          rating: reviewForm.rating,
          comment: reviewForm.comment || null,
          reviewer_name: reviewForm.reviewer_name,
          reviewer_email: reviewForm.reviewer_email,
          photo_url: reviewForm.photo_url || null,
        });

      if (error) throw error;

      toast.success('Bedankt voor je recensie!');
      setDialogOpen(false);
      setReviewForm({
        activity_id: '',
        rating: 5,
        comment: '',
        reviewer_name: '',
        reviewer_email: '',
        photo_url: '',
      });
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Fout bij het plaatsen van je recensie');
    } finally {
      setSubmitting(false);
      setPhotoPreviewError(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onSelect?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onSelect?.(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8 animate-fade-in">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="text-gradient">Recensies</span>
              </h1>
              <p className="text-muted-foreground">
                Lees wat anderen vinden van onze activiteiten
              </p>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Recensie Schrijven
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Schrijf een Recensie</DialogTitle>
                  <DialogDescription>
                    Deel je ervaring met een activiteit
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Activiteit *</Label>
                    <select
                      value={reviewForm.activity_id}
                      onChange={(e) => setReviewForm({ ...reviewForm, activity_id: e.target.value })}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Selecteer activiteit...</option>
                      {activities.map((activity) => (
                        <option key={activity.id} value={activity.id}>
                          {activity.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Beoordeling *</Label>
                    {renderStars(reviewForm.rating, true, (rating) => 
                      setReviewForm({ ...reviewForm, rating })
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reviewer_name">Je naam *</Label>
                    <Input
                      id="reviewer_name"
                      value={reviewForm.reviewer_name}
                      onChange={(e) => setReviewForm({ ...reviewForm, reviewer_name: e.target.value })}
                      placeholder="Vul je naam in"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reviewer_email">E-mailadres *</Label>
                    <Input
                      id="reviewer_email"
                      type="email"
                      value={reviewForm.reviewer_email}
                      onChange={(e) => setReviewForm({ ...reviewForm, reviewer_email: e.target.value })}
                      placeholder="je@email.nl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="photo_url">Foto URL (optioneel)</Label>
                    <Input
                      id="photo_url"
                      value={reviewForm.photo_url}
                      onChange={(e) => {
                        setReviewForm({ ...reviewForm, photo_url: e.target.value });
                        setPhotoPreviewError(false);
                      }}
                      placeholder="https://..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Link naar een profielfoto
                    </p>
                    {reviewForm.photo_url && (
                      <div className="mt-2">
                        {photoPreviewError ? (
                          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                            <ImageOff className="w-6 h-6 text-destructive" />
                          </div>
                        ) : (
                          <img
                            src={reviewForm.photo_url}
                            alt="Preview"
                            className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                            onError={() => setPhotoPreviewError(true)}
                          />
                        )}
                        <p className={`text-xs mt-1 ${photoPreviewError ? 'text-destructive' : 'text-green-600'}`}>
                          {photoPreviewError ? 'Foto kon niet geladen worden' : 'Foto preview'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comment">Je verhaal (optioneel)</Label>
                    <Textarea
                      id="comment"
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      placeholder="Vertel over je ervaring..."
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={handleSubmitReview}
                    disabled={submitting}
                    className="w-full"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verzenden...
                      </>
                    ) : (
                      'Recensie Plaatsen'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {reviews.length === 0 ? (
            <Card className="glass-card text-center py-12">
              <CardContent>
                <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">
                  Er zijn nog geen recensies
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <Card key={review.id} className="glass-card">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        {review.photo_url ? (
                          <img
                            src={review.photo_url}
                            alt={review.reviewer_name || 'Reviewer'}
                            className="w-14 h-14 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-7 h-7 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold">
                              {review.reviewer_name || 'Anoniem'}
                            </h3>
                            {isVrijwilliger && review.reviewer_email && (
                              <p className="text-sm text-muted-foreground">
                                ✉️ {review.reviewer_email}
                              </p>
                            )}
                            {review.activity_title && (
                              <p className="text-sm text-muted-foreground">
                                Over: {review.activity_title}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2">
                              {renderStars(review.rating)}
                              {isVrijwilliger && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={async () => {
                                    if (!confirm('Weet je zeker dat je deze recensie wilt verwijderen?')) return;
                                    const { error } = await supabase
                                      .from('activity_reviews')
                                      .delete()
                                      .eq('id', review.id);
                                    if (error) {
                                      toast.error('Fout bij verwijderen');
                                    } else {
                                      toast.success('Recensie verwijderd');
                                      fetchReviews();
                                    }
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(review.created_at), 'd MMM yyyy', { locale: nl })}
                            </span>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="mt-3 text-foreground/80">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Reviews;
