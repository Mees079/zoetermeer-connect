import { Link } from 'react-router-dom';
import { SoundButton } from '@/components/SoundButton';
import { HexagonBackground } from '@/components/HexagonBackground';
import { Users, Calendar, Heart, MessageSquare, ArrowRight, Info } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import logo from '@/assets/logo.png';

const Index = () => {
  return (
    <div className="min-h-screen relative">
      <HexagonBackground />
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-8 animate-fade-in">
            <div className="flex justify-center mb-6">
              <img 
                src={logo} 
                alt="AJOS Logo" 
                className="w-32 h-32 md:w-40 md:h-40 rounded-full shadow-2xl animate-float"
              />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold">
              <span className="text-gradient">AJOS</span>
              <br />
              <span className="text-foreground text-3xl md:text-4xl">Activiteiten Jongeren Ouderen Seghwaert</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Een platform waar ouderen en jongeren elkaar ontmoeten door leuke activiteiten.<br/>
              In samenwerking met ONC Parkdreef bouwen we aan een warme, levendige gemeenschap.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <SoundButton asChild size="lg" className="text-lg px-8 py-6 rounded-2xl shadow-glow hover-lift" soundType="success">
                <Link to="/activiteiten">
                  Bekijk Activiteiten
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </SoundButton>
              <SoundButton asChild variant="outline" size="lg" className="text-lg px-8 py-6 rounded-2xl hover-lift">
                <Link to="/suggesties">
                  Deel je Idee
                </Link>
              </SoundButton>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section for elderly */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="glass-card p-8 rounded-3xl border-2 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Info className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-primary">Voor ouderen en jongeren</h3>
                <p className="text-lg text-foreground/80">
                  Je hoeft <strong>geen account</strong> aan te maken om deel te nemen aan activiteiten of suggesties in te dienen. 
                  Vul gewoon je naam in en kies of je "ouderen" of "jongeren" bent!
                </p>
                <p className="text-muted-foreground mt-2">
                  Vrijwilligers loggen in om activiteiten te beheren via de "Vrijwilliger Login" knop.
                </p>
              </div>
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
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Bekijk Activiteiten</h3>
              <p className="text-muted-foreground">
                Ontdek het aanbod van activiteiten georganiseerd door onze vrijwilligers.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl hover-lift text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-glow">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Vul je Naam in</h3>
              <p className="text-muted-foreground">
                Geen account nodig - vul je naam in en kies of je ouderen of jongeren bent.
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
              Bekijk de activiteiten en schrijf je in - simpel en zonder account!
            </p>
            <SoundButton asChild size="lg" className="text-lg px-8 py-6 rounded-2xl shadow-glow" soundType="success">
              <Link to="/activiteiten">
                Bekijk Activiteiten
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </SoundButton>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
