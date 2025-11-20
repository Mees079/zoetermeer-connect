import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MessageSquare, Users, Plus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, profile, hasRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  const isVrijwilliger = hasRole('vrijwilliger');
  const isAdmin = hasRole('admin');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold mb-2">
              Welkom terug, <span className="text-gradient">{profile.full_name || 'daar'}!</span>
            </h1>
            <p className="text-muted-foreground">
              Welkom bij ONC Zoetermeer
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Link to="/activiteiten" className="block">
              <Card className="glass-card hover-lift cursor-pointer h-full">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle>Activiteiten</CardTitle>
                  <CardDescription>
                    Bekijk en schrijf je in voor aankomende activiteiten
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/suggesties" className="block">
              <Card className="glass-card hover-lift cursor-pointer h-full">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center mb-4">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle>Suggesties</CardTitle>
                  <CardDescription>
                    Deel je ideeën voor nieuwe activiteiten
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {isVrijwilliger && (
              <Link to="/activiteiten/nieuw" className="block">
                <Card className="glass-card hover-lift cursor-pointer h-full border-2 border-primary/20">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle>Nieuwe Activiteit</CardTitle>
                    <CardDescription>
                      Organiseer een nieuwe activiteit voor de gemeenschap
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )}

            {isAdmin && (
              <Link to="/admin" className="block">
                <Card className="glass-card hover-lift cursor-pointer h-full border-2 border-accent/20">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center mb-4">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle>Admin Panel</CardTitle>
                    <CardDescription>
                      Beheer gebruikers en rollen
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )}

            <Link to="/contact" className="block">
              <Card className="glass-card hover-lift cursor-pointer h-full">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle>Contact</CardTitle>
                  <CardDescription>
                    Neem contact op met het team
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>

          {isVrijwilliger && (
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle>Vrijwilliger Snelkoppelingen</CardTitle>
                <CardDescription>
                  Extra functies voor vrijwilligers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/activiteiten/nieuw">
                  <Button className="w-full justify-start rounded-xl" variant="outline">
                    <Plus className="mr-2 w-4 h-4" />
                    Nieuwe activiteit aanmaken
                  </Button>
                </Link>
                <Link to="/activiteiten">
                  <Button className="w-full justify-start rounded-xl" variant="outline">
                    <Calendar className="mr-2 w-4 h-4" />
                    Mijn activiteiten beheren
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
