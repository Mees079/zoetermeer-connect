import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Loader2, MapPin, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const NieuweActiviteit = () => {
  const { user, hasRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    end_date: '',
    max_participants: '',
    max_ouderen: '',
    max_jongeren: '',
  });

  useEffect(() => {
    if (!authLoading && (!user || !hasRole('vrijwilliger'))) {
      navigate('/dashboard');
    }
  }, [user, hasRole, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('activities')
        .insert({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          date: new Date(formData.date).toISOString(),
          end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
          max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
          max_ouderen: formData.max_ouderen ? parseInt(formData.max_ouderen) : null,
          max_jongeren: formData.max_jongeren ? parseInt(formData.max_jongeren) : null,
          created_by: user!.id,
        });

      if (error) throw error;

      toast({
        title: 'Activiteit aangemaakt!',
        description: 'De nieuwe activiteit is succesvol toegevoegd.',
      });

      navigate('/activiteiten');
    } catch (error: any) {
      toast({
        title: 'Fout',
        description: error.message || 'Er ging iets mis bij het aanmaken van de activiteit.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
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
        <div className="max-w-2xl mx-auto">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-3xl">Nieuwe Activiteit Aanmaken</CardTitle>
              <CardDescription>
                Organiseer een nieuwe activiteit voor de gemeenschap
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Titel *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Bijvoorbeeld: Koffie & Gezelligheid"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Beschrijving *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Vertel meer over deze activiteit..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Locatie *
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Bijvoorbeeld: Wijkcentrum"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Start Datum & Tijd *
                    </Label>
                    <Input
                      id="date"
                      type="datetime-local"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Eind Datum & Tijd (optioneel)
                  </Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Als je dit invult, wordt de activiteit als "bezig" getoond tussen start en eind
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Users className="w-4 h-4" />
                    Maximaal Aantal Deelnemers
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max_participants">Totaal</Label>
                      <Input
                        id="max_participants"
                        type="number"
                        min="1"
                        value={formData.max_participants}
                        onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                        placeholder="Onbeperkt"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max_ouderen">Max Ouderen</Label>
                      <Input
                        id="max_ouderen"
                        type="number"
                        min="0"
                        value={formData.max_ouderen}
                        onChange={(e) => setFormData({ ...formData, max_ouderen: e.target.value })}
                        placeholder="Onbeperkt"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max_jongeren">Max Jongeren</Label>
                      <Input
                        id="max_jongeren"
                        type="number"
                        min="0"
                        value={formData.max_jongeren}
                        onChange={(e) => setFormData({ ...formData, max_jongeren: e.target.value })}
                        placeholder="Onbeperkt"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/activiteiten')}
                    className="flex-1"
                  >
                    Annuleren
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Aanmaken...
                      </>
                    ) : (
                      'Activiteit Aanmaken'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NieuweActiviteit;
