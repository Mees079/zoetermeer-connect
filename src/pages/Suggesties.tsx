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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Lightbulb, Loader2, Send } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { z } from 'zod';

const suggestionSchema = z.object({
  title: z.string().trim().min(3, 'Titel moet minimaal 3 tekens zijn').max(100, 'Titel mag maximaal 100 tekens zijn'),
  description: z.string().trim().min(10, 'Beschrijving moet minimaal 10 tekens zijn').max(1000, 'Beschrijving mag maximaal 1000 tekens zijn'),
});

interface Suggestion {
  id: string;
  title: string;
  description: string;
  created_at: string;
  profiles: {
    full_name: string | null;
    role: string;
  };
}

const Suggesties = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchSuggestions();
    }
  }, [user, authLoading, navigate]);

  const fetchSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_suggestions')
        .select(`
          *,
          profiles (
            full_name,
            role
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      toast.error('Fout bij het ophalen van suggesties');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate input
      const validatedData = suggestionSchema.parse({
        title: formData.title.trim(),
        description: formData.description.trim(),
      });

      const { error } = await supabase
        .from('activity_suggestions')
        .insert({
          title: validatedData.title,
          description: validatedData.description,
          suggested_by: user!.id,
        });

      if (error) throw error;

      toast.success('Suggestie ingediend!');
      setFormData({ title: '', description: '' });
      fetchSuggestions();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error('Error submitting suggestion:', error);
        toast.error('Fout bij het indienen van suggestie');
      }
    } finally {
      setSubmitting(false);
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-gradient">Suggesties</span>
            </h1>
            <p className="text-muted-foreground">
              Deel je ideeën voor nieuwe activiteiten met de gemeenschap
            </p>
          </div>

          <Card className="glass-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="w-6 h-6 mr-2 text-primary" />
                Nieuwe Suggestie
              </CardTitle>
              <CardDescription>
                Wat voor activiteit zou je graag willen zien?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titel</Label>
                  <Input
                    id="title"
                    placeholder="Bijv. Kookworkshop voor beginners"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Beschrijving</Label>
                  <Textarea
                    id="description"
                    placeholder="Beschrijf je idee in detail..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    rows={4}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.description.length}/1000 tekens
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-xl"
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                  <Send className="mr-2 w-4 h-4" />
                  Suggestie Indienen
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Eerdere Suggesties</h2>
            {suggestions.length === 0 ? (
              <Card className="glass-card text-center py-12">
                <CardContent>
                  <Lightbulb className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg text-muted-foreground">
                    Nog geen suggesties. Wees de eerste!
                  </p>
                </CardContent>
              </Card>
            ) : (
              suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="glass-card hover-lift">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{suggestion.title}</CardTitle>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(suggestion.created_at), 'd MMM yyyy', { locale: nl })}
                      </div>
                    </div>
                    <CardDescription className="text-sm">
                      Door {suggestion.profiles.full_name || 'Anoniem'} ({suggestion.profiles.role})
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/80">{suggestion.description}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Suggesties;
