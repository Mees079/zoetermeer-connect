import { Link } from 'react-router-dom';
import { SoundButton } from '@/components/SoundButton';
import { HexagonBackground } from '@/components/HexagonBackground';
import { Users, Calendar, Heart, MessageSquare, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen relative">
      <HexagonBackground />
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-8 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold">
              <span className="text-gradient">AJOS</span>
              <br />
              <span className="text-foreground text-3xl md:text-4xl">Activiteiten Jongeren Ouderen Seghweart</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Een platform waar ouderen en jongeren elkaar ontmoeten door leuke activiteiten.<br/>
              In samenwerking met ONC Parkdreef bouwen we aan een warme, levendige gemeenschap.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                <SoundButton asChild size="lg" className="text-lg px-8 py-6 rounded-2xl shadow-glow hover-lift" soundType="success">
                  <Link to="/dashboard">
                    Naar Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </SoundButton>
              ) : (
                <>
                  <SoundButton asChild size="lg" className="text-lg px-8 py-6 rounded-2xl shadow-glow hover-lift" soundType="success">
                    <Link to="/auth?mode=signup">
                      Word Lid
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </SoundButton>
                  <SoundButton asChild variant="outline" size="lg" className="text-lg px-8 py-6 rounded-2xl hover-lift">
                    <Link to="/auth">
                      Inloggen
                    </Link>
                  </SoundButton>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-16 text-gradient">Hoe het werkt</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="glass-card p-8 rounded-3xl hover-lift text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-glow">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Maak een Account</h3>
              <p className="text-muted-foreground">
                Meld je aan als ouderen, jongeren of vrijwilliger en maak je profiel compleet.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl hover-lift text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-glow">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Ontdek Activiteiten</h3>
              <p className="text-muted-foreground">
                Bekijk het aanbod van activiteiten georganiseerd door onze vrijwilligers.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl hover-lift text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center shadow-glow">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Doe Mee</h3>
              <p className="text-muted-foreground">
                Schrijf je in voor activiteiten en maak verbinding met anderen in je buurt.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl hover-lift text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-glow">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Deel Ideeën</h3>
              <p className="text-muted-foreground">
                Suggereer nieuwe activiteiten en help mee de gemeenschap te versterken.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="glass-card p-12 rounded-3xl text-center space-y-6">
            <h2 className="text-4xl font-bold text-gradient">Klaar om te beginnen?</h2>
            <p className="text-xl text-muted-foreground">
              Sluit je aan bij onze gemeenschap en ontdek hoe leuk het is om generaties te verbinden!
            </p>
            {!user && (
              <SoundButton asChild size="lg" className="text-lg px-8 py-6 rounded-2xl shadow-glow" soundType="success">
                <Link to="/auth?mode=signup">
                  Meld je Nu Aan
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </SoundButton>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
