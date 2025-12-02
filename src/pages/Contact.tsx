import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
const Contact = () => {
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
                <address className="not-italic text-foreground/80">AJOS 
Seghwaert 
Zoetermeer
Nederland
                <br />
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
              <CardTitle>Over AJOS activiteiten jongeren ouderen seghwaert </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="text-foreground/80">
                ONC Parkdreef is een gemeenschapscentrum in Zoetermeer dat zich inzet voor het verbinden 
                van generaties. Ons doel is om een warme, inclusieve omgeving te creëren waar ouderen en 
                jongeren elkaar kunnen ontmoeten, van elkaar kunnen leren en samen mooie herinneringen 
                kunnen maken.
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