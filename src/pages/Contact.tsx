import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Clock, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';
const contactSchema = z.object({
  name: z.string().trim().min(1, "Naam is verplicht").max(100, "Naam mag maximaal 100 tekens zijn"),
  email: z.string().trim().email("Ongeldig e-mailadres").max(255, "E-mail mag maximaal 255 tekens zijn"),
  message: z.string().trim().min(1, "Bericht is verplicht").max(2000, "Bericht mag maximaal 2000 tekens zijn")
});
const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = contactSchema.safeParse(formData);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }
    setIsSubmitting(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('send-contact-email', {
        body: formData
      });
      if (error) throw error;
      toast.success('Bericht verzonden! Je ontvangt een bevestiging per e-mail.');
      setFormData({
        name: '',
        email: '',
        message: ''
      });
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast.error('Er ging iets mis. Probeer het later opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 animate-fade-in text-center">
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-gradient">Contact</span>
            </h1>
            <p className="text-muted-foreground">
              Heb je vragen? Neem contact met ons op!
            </p>
          </div>

          {/* Contact Form */}
          <Card className="glass-card mb-8">
            <CardHeader>
              <CardTitle>Stuur ons een bericht</CardTitle>
              <CardDescription>Vul het formulier in en we nemen zo snel mogelijk contact op.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Naam</Label>
                    <Input id="name" placeholder="Je naam" value={formData.name} onChange={e => setFormData({
                    ...formData,
                    name: e.target.value
                  })} disabled={isSubmitting} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" placeholder="je@email.nl" value={formData.email} onChange={e => setFormData({
                    ...formData,
                    email: e.target.value
                  })} disabled={isSubmitting} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Bericht</Label>
                  <Textarea id="message" placeholder="Schrijf hier je bericht..." rows={5} value={formData.message} onChange={e => setFormData({
                  ...formData,
                  message: e.target.value
                })} disabled={isSubmitting} />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                  {isSubmitting ? <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verzenden...
                    </> : <>
                      <Send className="mr-2 h-4 w-4" />
                      Verstuur bericht
                    </>}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="glass-card hover-lift">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <CardTitle>E-mail</CardTitle>
                <CardDescription>Stuur ons een e-mail</CardDescription>
              </CardHeader>
              <CardContent>
                <a href="mailto:info@oncparkdreef.nl" className="text-primary hover:underline">
                  info@oncparkdreef.nl
                </a>
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Telefoon</CardTitle>
                <CardDescription>Bel ons tijdens kantooruren</CardDescription>
              </CardHeader>
              <CardContent>
                <a href="tel:+31791234567" className="text-primary hover:underline">
                  079 123 4567
                </a>
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Locatie</CardTitle>
                <CardDescription>Bezoek ons op:</CardDescription>
              </CardHeader>
              <CardContent>
                <address className="not-italic text-foreground/80">
                  AJOS Seghwaert<br />
                  Zoetermeer<br />
                  Nederland
                </address>
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Openingstijden</CardTitle>
                <CardDescription>We zijn bereikbaar op:</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 text-foreground/80">
                <p>Maandag - Vrijdag: 9:00 - 17:00</p>
                <p>Weekend: Gesloten</p>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Over AJOS activiteiten jongeren ouderen seghwaert</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="text-foreground/80 font-mono text-lg">AJOS Activiteiten Jongeren & Ouderen Seghwaert is een organisatie die zich inzet tegen eenzaamheid en het versterken van de band tussen jongeren en ouderen. Met deze activiteiten hopen wij van Seghwaert een hechtere en betere wijk te maken.


            </p>
              <p className="text-foreground/80 mt-4">
                Door diverse activiteiten en evenementen organiseren we ontmoetingen die betekenisvol zijn 
                voor beide generaties. Van sportieve activiteiten tot culturele evenementen, er is voor elk 
                wat wils!
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>;
};
export default Contact;