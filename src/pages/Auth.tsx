import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2, Users } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().min(1, 'Vul een gebruikersnaam in').max(255),
  password: z.string().min(6, 'Wachtwoord moet minimaal 6 tekens zijn').max(100),
});

const signupSchema = z.object({
  email: z.string().email('Ongeldig e-mailadres').max(255),
  password: z.string().min(6, 'Wachtwoord moet minimaal 6 tekens zijn').max(100),
  fullName: z.string().min(2, 'Naam moet minimaal 2 tekens zijn').max(100),
  role: z.enum(['ouderen', 'jongeren', 'vrijwilliger']),
});

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const [isVolunteer, setIsVolunteer] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: '' as 'ouderen' | 'jongeren' | 'vrijwilliger' | '',
  });

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Validate login (allows username without @)
        loginSchema.parse({
          email: formData.email.trim(),
          password: formData.password,
        });
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email.trim(),
          password: formData.password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Onjuiste inloggegevens');
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success('Welkom terug!');
        navigate('/dashboard');
      } else {
        // Validate signup (requires proper email)
        if (!isVolunteer) {
          signupSchema.parse({
            email: formData.email.trim(),
            password: formData.password,
            fullName: formData.fullName.trim(),
            role: formData.role,
          });
        }
        if (!isVolunteer && !formData.role) {
          toast.error('Selecteer een rol');
          return;
        }

        const redirectUrl = `${window.location.origin}/`;
        const { data, error } = await supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: formData.fullName.trim(),
              role: isVolunteer ? 'vrijwilliger' : formData.role,
            },
          },
        });

        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('Dit e-mailadres is al geregistreerd');
          } else {
            toast.error(error.message);
          }
          return;
        }

        if (data.user) {
          // Create profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
              id: data.user.id,
              email: formData.email.trim(),
              full_name: formData.fullName.trim(),
              role: (isVolunteer ? 'vrijwilliger' : formData.role) as 'ouderen' | 'jongeren' | 'vrijwilliger',
            }]);

          if (profileError) {
            console.error('Profile creation error:', profileError);
          }

          toast.success('Account aangemaakt! Je bent nu ingelogd.');
          navigate('/dashboard');
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error('Er is iets misgegaan');
      }
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-accent/20 to-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white font-bold">
              ONC
            </div>
            <span className="text-2xl font-bold text-gradient">Generaties Verbinden</span>
          </Link>
        </div>

        <Card className="glass-card border-border/50 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              {isLogin ? 'Welkom terug' : 'Account aanmaken'}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? 'Log in om door te gaan'
                : isVolunteer
                ? 'Maak een vrijwilligers account aan'
                : 'Kies je rol en maak een account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && !isVolunteer && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="role">Ik ben</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: 'ouderen' | 'jongeren') =>
                        setFormData({ ...formData, role: value })
                      }
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Selecteer je rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ouderen">Ouderen</SelectItem>
                        <SelectItem value="jongeren">Jongeren</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Volledige naam</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Je volledige naam"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      required
                      maxLength={100}
                    />
                  </div>
                </>
              )}

              {!isLogin && isVolunteer && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Volledige naam</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Je volledige naam"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    required
                    maxLength={100}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email / Gebruikersnaam</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder={isLogin ? "ONCParkdreef" : "naam@voorbeeld.nl"}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  maxLength={255}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Wachtwoord</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  maxLength={100}
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-xl"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                {isLogin ? 'Inloggen' : 'Account aanmaken'}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">of</span>
                </div>
              </div>

              {!isVolunteer ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={() => setIsVolunteer(true)}
                >
                  <Users className="mr-2 w-4 h-4" />
                  Inloggen als vrijwilliger
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={() => setIsVolunteer(false)}
                >
                  Terug naar normale login
                </Button>
              )}

              <div className="text-center text-sm">
                {isLogin ? (
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="text-primary hover:underline"
                  >
                    Nog geen account? Registreer hier
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="text-primary hover:underline"
                  >
                    Al een account? Log in
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Test account: ONCParkdreef / ONC123
        </p>
      </div>
    </div>
  );
};

export default Auth;
