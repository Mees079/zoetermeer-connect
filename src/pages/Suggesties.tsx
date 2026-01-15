import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SoundButton } from '@/components/SoundButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Lightbulb, Loader2, Upload, Trash2, Edit, X } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { z } from 'zod';

const suggestionSchema = z.object({
  title: z.string().trim().min(3, 'Titel moet minimaal 3 tekens zijn').max(100),
  description: z.string().trim().min(10, 'Beschrijving moet minimaal 10 tekens zijn').max(1000),
  suggesterName: z.string().trim().min(2, 'Naam moet minimaal 2 tekens zijn').max(100),
  suggesterType: z.enum(['ouderen', 'jongeren'], { required_error: 'Selecteer of je ouderen of jongeren bent' }),
});

interface Suggestion {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  created_at: string;
  suggested_by: string | null;
  suggester_name: string | null;
  suggester_type: string | null;
  suggester_email: string | null;
  profiles?: {
    full_name: string | null;
  };
}

const Suggesties = () => {
  const { user, hasRole } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    suggesterName: '',
    suggesterType: '' as 'ouderen' | 'jongeren' | '',
    suggesterEmail: '',
  });

  const isVrijwilliger = user && hasRole('vrijwilliger');

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_suggestions')
        .select(`
          *,
          profiles (
            full_name
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Afbeelding mag maximaal 5MB zijn');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `anonymous/${Date.now()}-${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('suggestion-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('suggestion-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Fout bij het uploaden van afbeelding');
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // For volunteers editing, don't require name/type
      if (editingId && isVrijwilliger) {
        const { error } = await supabase
          .from('activity_suggestions')
          .update({
            title: formData.title.trim(),
            description: formData.description.trim(),
            ...(imageFile && { image_url: await uploadImage(imageFile) }),
          })
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Suggestie bijgewerkt!');
        setEditingId(null);
      } else {
        // For new suggestions (anyone can create)
        const validatedData = suggestionSchema.parse({
          title: formData.title.trim(),
          description: formData.description.trim(),
          suggesterName: formData.suggesterName.trim(),
          suggesterType: formData.suggesterType,
        });

        let imageUrl = null;
        if (imageFile) {
          imageUrl = await uploadImage(imageFile);
        }

        const { error } = await supabase
          .from('activity_suggestions')
          .insert({
            title: validatedData.title,
            description: validatedData.description,
            suggester_name: validatedData.suggesterName,
            suggester_type: validatedData.suggesterType,
            suggester_email: formData.suggesterEmail.trim() || null,
            ...(imageUrl && { image_url: imageUrl }),
          });

        if (error) throw error;
        toast.success('Suggestie ingediend!');
      }

      setFormData({ title: '', description: '', suggesterName: '', suggesterType: '', suggesterEmail: '' });
      setImageFile(null);
      setImagePreview(null);
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

  const handleEdit = (suggestion: Suggestion) => {
    setEditingId(suggestion.id);
    setFormData({
      title: suggestion.title,
      description: suggestion.description,
      suggesterName: suggestion.suggester_name || '',
      suggesterType: (suggestion.suggester_type as 'ouderen' | 'jongeren') || '',
      suggesterEmail: suggestion.suggester_email || '',
    });
    if (suggestion.image_url) {
      setImagePreview(suggestion.image_url);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze suggestie wilt verwijderen?')) return;

    try {
      const { error } = await supabase
        .from('activity_suggestions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Suggestie verwijderd!');
      fetchSuggestions();
    } catch (error) {
      console.error('Error deleting suggestion:', error);
      toast.error('Fout bij het verwijderen van suggestie');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', suggesterName: '', suggesterType: '', suggesterEmail: '' });
    setImageFile(null);
    setImagePreview(null);
  };

  const getSuggesterDisplay = (suggestion: Suggestion) => {
    if (suggestion.suggester_name) {
      return `${suggestion.suggester_name} (${suggestion.suggester_type === 'ouderen' ? 'Ouderen' : 'Jongeren'})`;
    }
    if (suggestion.profiles?.full_name) {
      return suggestion.profiles.full_name;
    }
    return 'Anoniem';
  };

  const getSuggesterEmail = (suggestion: Suggestion) => {
    return suggestion.suggester_email;
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
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-gradient">Suggesties</span>
            </h1>
            <p className="text-muted-foreground">
              Deel jouw ideeën voor nieuwe activiteiten
            </p>
          </div>

          {/* Submit Form */}
          <Card className="glass-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                {editingId ? 'Suggestie Bewerken' : 'Nieuwe Suggestie'}
              </CardTitle>
              <CardDescription>
                {editingId ? 'Pas de suggestie aan' : 'Wat voor activiteit zou je graag willen zien?'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!editingId && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="suggesterName">Je naam</Label>
                        <Input
                          id="suggesterName"
                          value={formData.suggesterName}
                          onChange={(e) => setFormData({ ...formData, suggesterName: e.target.value })}
                          placeholder="Vul je naam in"
                          required
                          maxLength={100}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="suggesterType">Ik ben</Label>
                        <Select
                          value={formData.suggesterType}
                          onValueChange={(value: 'ouderen' | 'jongeren') =>
                            setFormData({ ...formData, suggesterType: value })
                          }
                        >
                          <SelectTrigger id="suggesterType">
                            <SelectValue placeholder="Selecteer..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ouderen">Ouderen</SelectItem>
                            <SelectItem value="jongeren">Jongeren</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="suggesterEmail">E-mailadres (optioneel)</Label>
                      <Input
                        id="suggesterEmail"
                        type="email"
                        value={formData.suggesterEmail}
                        onChange={(e) => setFormData({ ...formData, suggesterEmail: e.target.value })}
                        placeholder="je@email.nl"
                        maxLength={100}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="title">Titel</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Bijvoorbeeld: Spelletjesmiddag in het park"
                    required
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Beschrijving</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Vertel meer over je idee..."
                    rows={4}
                    required
                    maxLength={1000}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Foto (optioneel, max 5MB)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <SoundButton
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('image')?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {imageFile ? 'Andere foto kiezen' : 'Foto uploaden'}
                    </SoundButton>
                    {imagePreview && (
                      <div className="relative">
                        <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <SoundButton
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-primary to-primary-glow"
                    soundType="success"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {editingId ? 'Bijwerken...' : 'Indienen...'}
                      </>
                    ) : (
                      <>{editingId ? 'Bijwerken' : 'Suggestie Indienen'}</>
                    )}
                  </SoundButton>
                  {editingId && (
                    <SoundButton
                      type="button"
                      variant="outline"
                      onClick={cancelEdit}
                    >
                      Annuleren
                    </SoundButton>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Suggestions List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Alle Suggesties</h2>
            
            {suggestions.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="py-12 text-center text-muted-foreground">
                  Nog geen suggesties. Wees de eerste!
                </CardContent>
              </Card>
            ) : (
              suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="glass-card hover-lift">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-primary" />
                          {suggestion.title}
                        </CardTitle>
                        <CardDescription>
                          Door {getSuggesterDisplay(suggestion)} •{' '}
                          {format(new Date(suggestion.created_at), 'd MMMM yyyy', { locale: nl })}
                          {isVrijwilliger && getSuggesterEmail(suggestion) && (
                            <span className="block mt-1">✉️ {getSuggesterEmail(suggestion)}</span>
                          )}
                        </CardDescription>
                      </div>
                      {isVrijwilliger && (
                        <div className="flex gap-2">
                          <SoundButton
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(suggestion)}
                          >
                            <Edit className="w-4 h-4" />
                          </SoundButton>
                          <SoundButton
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(suggestion.id)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </SoundButton>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {suggestion.image_url && (
                      <div className="mb-4">
                        <img
                          src={suggestion.image_url}
                          alt={suggestion.title}
                          className="w-full max-h-64 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <p className="text-foreground/80 whitespace-pre-wrap">
                      {suggestion.description}
                    </p>
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
