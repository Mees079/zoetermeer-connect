import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useState } from 'react';

export const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = user ? [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/activiteiten', label: 'Activiteiten' },
    { to: '/suggesties', label: 'Suggesties' },
    { to: '/contact', label: 'Contact' },
  ] : [
    { to: '/auth', label: 'Inloggen' },
    { to: '/contact', label: 'Contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white font-bold">
              ONC
            </div>
            <span className="text-xl font-bold text-gradient">Generaties Verbinden</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`transition-colors ${
                  isActive(link.to)
                    ? 'text-primary font-semibold'
                    : 'text-foreground/70 hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {user && profile && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-accent">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium capitalize">{profile.role}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 transition-colors ${
                  isActive(link.to)
                    ? 'text-primary font-semibold'
                    : 'text-foreground/70 hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {user && profile && (
              <div className="pt-3 border-t border-border space-y-2">
                <div className="flex items-center space-x-2 px-3 py-2 rounded-full bg-accent w-fit">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium capitalize">{profile.role}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Uitloggen
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
