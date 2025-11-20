import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

export const Footer = () => {
  return (
    <footer className="glass-card border-t border-border py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="AJOS Logo" className="h-12 w-auto" />
            <div>
              <h3 className="font-semibold text-primary">AJOS</h3>
              <p className="text-sm text-muted-foreground">
                Activiteiten Jongeren Ouderen Seghweart
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/activiteiten" className="text-muted-foreground hover:text-primary transition-colors">
                  Activiteiten
                </Link>
              </li>
              <li>
                <Link to="/suggesties" className="text-muted-foreground hover:text-primary transition-colors">
                  Suggesties
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <p className="text-sm text-muted-foreground">
              Voor vragen of meer informatie,<br />
              bezoek onze contactpagina.
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border">
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>&copy; {new Date().getFullYear()} AJOS - In samenwerking met ONC Parkdreef</p>
            <p className="text-primary font-medium text-base">
              Gemaakt door De kippetjes VWO 3 Oranje Nassau College Parkdreef
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
