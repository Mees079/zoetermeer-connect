import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar, MapPin, Users, Loader2, Clock, Star } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface Activity {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  max_participants: number | null;
  image_url: string | null;
  created_by: string;
  participant_count?: number;
  is_participant?: boolean;
  average_rating?: number;
  review_count?: number;
}

const Activiteiten = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchActivities();
    }
  }, [user, authLoading, navigate]);

  const fetchActivities = async () => {
    try {
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true });

      if (activitiesError) throw activitiesError;

      // Get participant counts and check if user is participant
      const activitiesWithDetails = await Promise.all(
        (activitiesData || []).map(async (activity) => {
          const { count } = await supabase
            .from('activity_participants')
            .select('*', { count: 'exact', head: true })
            .eq('activity_id', activity.id);

          const { data: participantData } = await supabase
            .from('activity_participants')
            .select('id')
            .eq('activity_id', activity.id)
            .eq('user_id', user!.id)
            .maybeSingle();

          // Get average rating
          const { data: reviewsData } = await supabase
            .from('activity_reviews')
            .select('rating')
            .eq('activity_id', activity.id);

          const averageRating = reviewsData && reviewsData.length > 0
            ? reviewsData.reduce((acc, r) => acc + r.rating, 0) / reviewsData.length
            : 0;

          return {
            ...activity,
            participant_count: count || 0,
            is_participant: !!participantData,
            average_rating: averageRating,
            review_count: reviewsData?.length || 0,
          };
        })
      );

      setActivities(activitiesWithDetails);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Fout bij het ophalen van activiteiten');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinActivity = async (activityId: string) => {
    try {
      const { error } = await supabase
        .from('activity_participants')
        .insert({
          activity_id: activityId,
          user_id: user!.id,
        });

      if (error) {
        if (error.message.includes('duplicate')) {
          toast.error('Je bent al ingeschreven voor deze activiteit');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Je bent ingeschreven!');
      fetchActivities();
    } catch (error) {
      console.error('Error joining activity:', error);
      toast.error('Fout bij het inschrijven');
    }
  };

  const handleLeaveActivity = async (activityId: string) => {
    try {
      const { error } = await supabase
        .from('activity_participants')
        .delete()
        .eq('activity_id', activityId)
        .eq('user_id', user!.id);

      if (error) throw error;

      toast.success('Je bent uitgeschreven');
      fetchActivities();
    } catch (error) {
      console.error('Error leaving activity:', error);
      toast.error('Fout bij het uitschrijven');
    }
  };

  if (authLoading || loading) {
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
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8 animate-fade-in">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="text-gradient">Activiteiten</span>
              </h1>
              <p className="text-muted-foreground">
                Ontdek aankomende activiteiten en schrijf je in
              </p>
            </div>
          </div>

          {activities.length === 0 ? (
            <Card className="glass-card text-center py-12">
              <CardContent>
                <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">
                  Er zijn momenteel geen aankomende activiteiten
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activities.map((activity) => (
                <Card key={activity.id} className="glass-card hover-lift overflow-hidden">
                  {activity.image_url && (
                    <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                      <img
                        src={activity.image_url}
                        alt={activity.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-2xl">{activity.title}</CardTitle>
                      {activity.is_participant && (
                        <Badge className="bg-primary">Ingeschreven</Badge>
                      )}
                    </div>
                    <CardDescription className="text-base">
                      {activity.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="w-4 h-4 mr-2" />
                        {format(new Date(activity.date), 'EEEE d MMMM yyyy, HH:mm', { locale: nl })}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        {activity.location}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Users className="w-4 h-4 mr-2" />
                        {activity.participant_count} {activity.max_participants && `/ ${activity.max_participants}`} deelnemers
                      </div>
                      {activity.review_count > 0 && (
                        <div className="flex items-center text-muted-foreground">
                          <Star className="w-4 h-4 mr-2 fill-primary text-primary" />
                          {activity.average_rating.toFixed(1)} ({activity.review_count} {activity.review_count === 1 ? 'recensie' : 'recensies'})
                        </div>
                      )}
                    </div>

                    {activity.is_participant ? (
                      <Button
                        variant="outline"
                        className="w-full rounded-xl"
                        onClick={() => handleLeaveActivity(activity.id)}
                      >
                        Uitschrijven
                      </Button>
                    ) : (
                      <Button
                        className="w-full rounded-xl"
                        onClick={() => handleJoinActivity(activity.id)}
                        disabled={
                          activity.max_participants !== null &&
                          activity.participant_count >= activity.max_participants
                        }
                      >
                        {activity.max_participants !== null &&
                        activity.participant_count >= activity.max_participants
                          ? 'Vol'
                          : 'Inschrijven'}
                      </Button>
                    )}
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

export default Activiteiten;
