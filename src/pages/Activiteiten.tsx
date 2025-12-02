import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar, MapPin, Users, Loader2, Clock, Star } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { z } from 'zod';

const participantSchema = z.object({
  name: z.string().trim().min(2, 'Naam moet minimaal 2 tekens zijn').max(100),
  type: z.enum(['ouderen', 'jongeren'], { required_error: 'Selecteer of je ouderen of jongeren bent' }),
});

interface Activity {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  max_participants: number | null;
  max_ouderen: number | null;
  max_jongeren: number | null;
  image_url: string | null;
  created_by: string;
  participant_count?: number;
  ouderen_count?: number;
  jongeren_count?: number;
  average_rating?: number;
  review_count?: number;
}

const Activiteiten = () => {
  const { user, hasRole } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningActivity, setJoiningActivity] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [participantForm, setParticipantForm] = useState({
    name: '',
    type: '' as 'ouderen' | 'jongeren' | '',
  });

  const isVrijwilliger = user && hasRole('vrijwilliger');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true });

      if (activitiesError) throw activitiesError;

      const activitiesWithDetails = await Promise.all(
        (activitiesData || []).map(async (activity) => {
          const { count } = await supabase
            .from('activity_participants')
            .select('*', { count: 'exact', head: true })
            .eq('activity_id', activity.id);

          // Count by type
          const { count: ouderenCount } = await supabase
            .from('activity_participants')
            .select('*', { count: 'exact', head: true })
            .eq('activity_id', activity.id)
            .eq('participant_type', 'ouderen');

          const { count: jongerenCount } = await supabase
            .from('activity_participants')
            .select('*', { count: 'exact', head: true })
            .eq('activity_id', activity.id)
            .eq('participant_type', 'jongeren');

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
            ouderen_count: ouderenCount || 0,
            jongeren_count: jongerenCount || 0,
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

  const openJoinDialog = (activity: Activity) => {
    setSelectedActivity(activity);
    setParticipantForm({ name: '', type: '' });
    setDialogOpen(true);
  };

  const handleJoinActivity = async () => {
    if (!selectedActivity) return;

    try {
      const validatedData = participantSchema.parse({
        name: participantForm.name.trim(),
        type: participantForm.type,
      });

      // Check if max for this type is reached
      if (validatedData.type === 'ouderen' && selectedActivity.max_ouderen !== null) {
        if ((selectedActivity.ouderen_count || 0) >= selectedActivity.max_ouderen) {
          toast.error('Maximum aantal ouderen is bereikt');
          return;
        }
      }
      if (validatedData.type === 'jongeren' && selectedActivity.max_jongeren !== null) {
        if ((selectedActivity.jongeren_count || 0) >= selectedActivity.max_jongeren) {
          toast.error('Maximum aantal jongeren is bereikt');
          return;
        }
      }

      setJoiningActivity(selectedActivity.id);

      const { error } = await supabase
        .from('activity_participants')
        .insert({
          activity_id: selectedActivity.id,
          participant_name: validatedData.name,
          participant_type: validatedData.type,
        });

      if (error) throw error;

      toast.success('Je bent ingeschreven voor ' + selectedActivity.title + '!');
      setDialogOpen(false);
      fetchActivities();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error('Error joining activity:', error);
        toast.error('Fout bij het inschrijven');
      }
    } finally {
      setJoiningActivity(null);
    }
  };

  const isFull = (activity: Activity) => {
    if (activity.max_participants !== null && activity.participant_count! >= activity.max_participants) {
      return true;
    }
    return false;
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
                    <CardTitle className="text-2xl">{activity.title}</CardTitle>
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
                      <div className="flex gap-2 text-sm">
                        <Badge variant="outline">
                          {activity.ouderen_count} ouderen {activity.max_ouderen && `/ ${activity.max_ouderen}`}
                        </Badge>
                        <Badge variant="outline">
                          {activity.jongeren_count} jongeren {activity.max_jongeren && `/ ${activity.max_jongeren}`}
                        </Badge>
                      </div>
                      {activity.review_count! > 0 && (
                        <div className="flex items-center text-muted-foreground">
                          <Star className="w-4 h-4 mr-2 fill-primary text-primary" />
                          {activity.average_rating!.toFixed(1)} ({activity.review_count} {activity.review_count === 1 ? 'recensie' : 'recensies'})
                        </div>
                      )}
                    </div>

                    <Dialog open={dialogOpen && selectedActivity?.id === activity.id} onOpenChange={(open) => {
                      if (!open) setDialogOpen(false);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full rounded-xl"
                          onClick={() => openJoinDialog(activity)}
                          disabled={isFull(activity)}
                        >
                          {isFull(activity) ? 'Vol' : 'Inschrijven'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Inschrijven voor {activity.title}</DialogTitle>
                          <DialogDescription>
                            Vul je gegevens in om deel te nemen aan deze activiteit.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label htmlFor="participant-name">Je naam</Label>
                            <Input
                              id="participant-name"
                              placeholder="Vul je naam in"
                              value={participantForm.name}
                              onChange={(e) => setParticipantForm({ ...participantForm, name: e.target.value })}
                              maxLength={100}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="participant-type">Ik ben</Label>
                            <Select
                              value={participantForm.type}
                              onValueChange={(value: 'ouderen' | 'jongeren') =>
                                setParticipantForm({ ...participantForm, type: value })
                              }
                            >
                              <SelectTrigger id="participant-type">
                                <SelectValue placeholder="Selecteer..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ouderen">Ouderen</SelectItem>
                                <SelectItem value="jongeren">Jongeren</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            className="w-full"
                            onClick={handleJoinActivity}
                            disabled={joiningActivity === activity.id}
                          >
                            {joiningActivity === activity.id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Bezig...
                              </>
                            ) : (
                              'Bevestig Inschrijving'
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
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
