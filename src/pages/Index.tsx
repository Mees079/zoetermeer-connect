import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Heart, MessageSquare, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-background via-accent/20 to-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-8 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold">
              <span className="text-gradient">Generaties</span> Verbinden
              <br />
              <span className="text-foreground/80">in Zoetermeer</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Een platform waar ouderen en jongeren elkaar ontmoeten door leuke activiteiten. 
              Samen bouwen we aan een warme, levendige gemeenschap.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" className="text-lg px-8 py-6 rounded-2xl shadow-lg hover-lift">
                    Naar Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth?mode=signup">
                    <Button size="lg" className="text-lg px-8 py-6 rounded-2xl shadow-lg hover-lift">
                      Word Lid
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-6 rounded-2xl hover-lift">
                      Inloggen
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-16">Hoe het werkt</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="glass-card p-8 rounded-3xl hover-lift text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Maak een Account</h3>
              <p className="text-muted-foreground">
                Meld je aan als ouderen, jongeren of vrijwilliger en maak je profiel compleet.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl hover-lift text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Ontdek Activiteiten</h3>
              <p className="text-muted-foreground">
                Bekijk het aanbod van activiteiten georganiseerd door onze vrijwilligers.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl hover-lift text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Doe Mee</h3>
              <p className="text-muted-foreground">
                Schrijf je in voor activiteiten en maak nieuwe connecties in de gemeenschap.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl hover-lift text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Deel Je Ervaring</h3>
              <p className="text-muted-foreground">
                Laat een recensie achter en help anderen de mooiste activiteiten te vinden.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 px-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-bold mb-6">Klaar om deel te nemen?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Word lid van onze gemeenschap en ontmoet nieuwe mensen in Zoetermeer
            </p>
            <Link to="/auth?mode=signup">
              <Button size="lg" className="text-lg px-8 py-6 rounded-2xl shadow-lg hover-lift">
                Start Nu
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Index;
