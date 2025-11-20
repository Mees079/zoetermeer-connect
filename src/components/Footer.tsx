import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white font-bold text-sm">
                ONC
              </div>
              <span className="font-bold text-gradient">Generaties Verbinden</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Samen bouwen aan een levendige gemeenschap in Zoetermeer waar ouderen en jongeren elkaar ontmoeten.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Links</h3>
            <div className="space-y-2">
              <Link to="/activiteiten" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Activiteiten
              </Link>
              <Link to="/suggesties" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Suggesties
              </Link>
              <Link to="/contact" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Locatie</h3>
            <p className="text-sm text-muted-foreground">
              ONC Parkdreef<br />
              Zoetermeer<br />
              Nederland
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            Gemaakt met <Heart className="w-4 h-4 text-primary fill-primary" /> voor de gemeenschap van Zoetermeer
          </p>
        </div>
      </div>
    </footer>
  );
};
