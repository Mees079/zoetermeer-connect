import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, LogOut } from 'lucide-react';
import { SoundButton } from '@/components/SoundButton';
import { SettingsMenu } from '@/components/SettingsMenu';
import logo from '@/assets/logo.png';

export const Navbar = () => {
  const { user, hasRole, signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isVrijwilliger = user && hasRole('vrijwilliger');

  // Public links for everyone
  const publicLinks = [
    { to: '/', label: 'Home' },
    { to: '/activiteiten', label: 'Activiteiten' },
    { to: '/reviews', label: 'Recensies' },
    { to: '/suggesties', label: 'Suggesties' },
    { to: '/contact', label: 'Contact' },
  ];

  // Additional links for logged in volunteers
  const volunteerLinks = isVrijwilliger ? [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/activiteiten/nieuw', label: 'Nieuwe Activiteit' },
  ] : [];

  const adminLinks = user && hasRole('admin') ? [
    { to: '/admin', label: 'Admin' },
  ] : [];

  const navLinks = [...publicLinks, ...volunteerLinks, ...adminLinks];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <img src={logo} alt="AJOS Logo" className="h-10 w-auto" />
            <span className="text-2xl font-bold text-gradient">AJOS</span>
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
            
            <SettingsMenu />
            
            {user ? (
              <SoundButton
                onClick={signOut}
                variant="outline"
                size="sm"
                className="rounded-xl"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Uitloggen
              </SoundButton>
            ) : (
              <SoundButton
                asChild
                variant="default"
                size="sm"
                className="rounded-xl"
              >
                <Link to="/auth">Vrijwilliger Login</Link>
              </SoundButton>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    isActive(link.to)
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {user ? (
                <SoundButton
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  variant="outline"
                  className="mx-3 rounded-xl"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Uitloggen
                </SoundButton>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mx-3 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-center"
                >
                  Vrijwilliger Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
