import { Link } from 'react-router-dom';
import { Activity, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card/50 border-t border-border py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img
                src="/public/7.png" // ou le chemin de votre photo dans /public ou importée
                alt="7M7Cabinet"
                className="w-10 h-10 rounded-xl object-cover"
              />
              <span className="font-display text-xl font-bold">
                7M7<span className="text-gradient">Cabinet</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm mb-6">
              La solution moderne pour la gestion complète de votre cabinet médical.
            </p>
            <div className="space-y-3">
              <a href="mailto:contact@medicabinet.ma" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="w-4 h-4" />
                7m7cabinet@gmail.com
              </a>
              <a href="tel:+212522000000" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Phone className="w-4 h-4" />
                +212 522 302 473
              </a>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                Khouribga, Maroc
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Produit</h4>
            <ul className="space-y-3">
              {['Fonctionnalités', 'Tarifs', 'Sécurité', 'Mises à jour'].map((link) => (
                <li key={link}>
                  <Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-3">
              {['Documentation', 'Guide de démarrage', 'FAQ', 'Contact'].map((link) => (
                <li key={link}>
                  <Link to="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          
        </div>

        <div className="border-t border-border mt-12 pt-6 flex items-center justify-center">
          <p className="text-sm text-muted-foreground text-center">
            © 2025 7M7Cabinet. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
