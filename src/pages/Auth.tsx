import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2, Lock } from 'lucide-react';
import { z } from 'zod';
import logo from '@/assets/logo.png';

const loginSchema = z.object({
  email: z.string().email('Vul een geldig e-mailadres in').max(255),
  password: z.string().min(6, 'Wachtwoord moet minimaal 6 tekens zijn').max(100),
});

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
          <Link to="/" className="inline-flex items-center space-x-3 mb-4">
            <img src={logo} alt="AJOS Logo" className="w-14 h-14 rounded-full" />
            <span className="text-2xl font-bold text-gradient">AJOS</span>
          </Link>
        </div>

        <Card className="glass-card border-border/50 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Lock className="w-6 h-6" />
              Vrijwilliger Login
            </CardTitle>
            <CardDescription>
              Alleen voor vrijwilligers - beheer activiteiten en suggesties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mailadres</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="onc@AJOS.nl"
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
                Inloggen
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                Geen vrijwilliger? Geen probleem!<br />
                Ouderen en jongeren kunnen zonder account deelnemen aan activiteiten en suggesties indienen.
              </p>
              <Button
                variant="outline"
                className="w-full mt-4 rounded-xl"
                onClick={() => navigate('/activiteiten')}
              >
                Bekijk Activiteiten
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Standaard login: onc@AJOS.nl / ajosONC123
        </p>
      </div>
    </div>
  );
};

export default Auth;
