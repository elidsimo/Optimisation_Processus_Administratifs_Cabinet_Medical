import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Play, Clock} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Menu, X, Activity } from 'lucide-react';

const navLinks = [
  { href: 'Accueil', label: 'Accueil' },
  { href: 'Fonctionnalites', label: 'Fonctionnalites' },
  { href: 'Tarifs', label: 'Tarifs' },
];

import { 
  Users, 
  Calendar, 
  FileText, 
  CreditCard, 
  Stethoscope, 
  Bell,
  Shield,
  BarChart3,
  UserCog,  
  ClipboardList,
  CheckCircle2
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Gestion des Patients',
    description: 'Enregistrement complet, dossiers médicaux et historique des consultations accessibles en un clic.',
    color: 'from-accent to-accent/50',
  },
  {
    icon: Calendar,
    title: 'Rendez-vous Intelligents',
    description: 'Planification, modification et rappels automatiques pour une gestion optimale de votre agenda.',
    color: 'from-accent to-accent/50',
  },
  {
    icon: Stethoscope,
    title: 'Consultations Digitales',
    description: 'Saisie des diagnostics, prescriptions et génération automatique des ordonnances.',
    color: 'from-accent to-accent/50',
  },
  {
    icon: CreditCard,
    title: 'Facturation Simplifiée',
    description: 'Validation des paiements, impression des factures et suivi financier complet.',
    color: 'from-accent to-accent/50',
  },
  {
    icon: FileText,
    title: 'Ordonnances Signées',
    description: 'Ordonnances médicaments et examens avec signature électronique automatique.',
    color: 'from-accent to-accent/50',
  },
  {
    icon: Bell,
    title: 'Notifications Temps Réel',
    description: 'Alertes pour les rendez-vous, patients en attente et rappels importants.',
    color: 'from-accent to-accent/50',
  },
  {
    icon: Shield,
    title: 'Sécurité Maximale',
    description: 'Rôles et permissions granulaires pour médecins, secrétaires et administrateurs.',
    color: 'from-accent to-accent/50',
  },
  {
    icon: BarChart3,
    title: 'Tableau de Bord',
    description: 'Statistiques et indicateurs clés pour suivre la performance de votre cabinet.',
    color: 'from-accent to-accent/50',
  },
];

const roles = [
  {
    icon: ClipboardList,
    title: 'Secrétaire',
    description: 'Gérez les patients et rendez-vous avec efficacité',
    features: [
      'Enregistrement et modification des patients',
      'Recherche rapide par CIN ou nom',
      'Gestion complète des rendez-vous',
      'Validation et impression des factures',
    ],
    color: 'accent',
  },
  {
    icon: Stethoscope,
    title: 'Médecin',
    description: 'Concentrez-vous sur vos patients, nous gérons le reste',
    features: [
      'Accès au dossier médical complet',
      'Saisie des diagnostics et prescriptions',
      'Ordonnances signées automatiquement',
      'Dashboard et statistiques personnalisées',
    ],
    color: 'accent',
  },
  {
    icon: UserCog,
    title: 'Administrateur',
    description: 'Contrôle total sur votre infrastructure',
    features: [
      'Création et gestion des cabinets',
      'Gestion des comptes utilisateurs',
      'Base de données médicaments',
      'Activation/désactivation des services',
    ],
    color: 'accent',
  },
];

const Index = () => {
  const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
  
    useEffect(() => {
      const handleScroll = () => {
        setScrolled(window.scrollY > 20);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);
  return (
    <div className="min-h-screen bg-background">
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-background/80 backdrop-blur-xl border-b border-border' 
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <img
                  src="/public/7.png" // ou le chemin de votre photo dans /public ou importée
                  alt="7M7Cabinet"
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-accent blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              </div>
              <span className="font-display text-xl font-bold text-foreground">
                7M7<span className="text-gradient">Cabinet</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.hash === `#${link.href}` || location.pathname === `/${link.href}`;
                return (
                  <a
                    key={link.href}
                    href={`#${link.href}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById(link.href);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      else window.location.hash = `#${link.href}`;
                    }}
                    className={`nav-link ${isActive ? 'text-foreground active' : ''}`}
                  >
                    {link.label}
                  </a>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              
              <Button variant="hero" asChild>
                <Link to="/login">Connexion</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border"
            >
              <div className="container mx-auto px-4 py-4 space-y-2">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={`#${link.href}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setIsOpen(false);
                      const el = document.getElementById(link.href);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      else window.location.hash = `#${link.href}`;
                    }}
                    className={`block py-3 px-4 rounded-xl transition-colors ${
                      location.hash === `#${link.href}`
                        ? 'bg-secondary text-foreground'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    {link.label}
                  </a>
                ))}
                <div className="pt-4 space-y-2">
                  <Button variant="hero" className="w-full" asChild>
                    <Link to="/login" onClick={() => setIsOpen(false)}>Connexion</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      <main>
        <section id='Accueil' className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" />
          <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-accent/20 rounded-full blur-[120px]" />
          
          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}
          />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              {/* Badge */}
              

              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
              >
                Gestion de Cabinet{' '}
                <span className="text-gradient">Médicale</span>{' '}
                <br className="hidden sm:block" />
                Nouvelle Génération
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
              >
                Optimisez votre cabinet médical avec notre plateforme tout en ligne. 
                Patients, rendez-vous, consultations et facturation sont tout simplifiés.
              </motion.p>

              {/* CTA Buttons */}
              

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
              >
                {[
                  { icon: Users, value: '2,500+', label: 'Cabinets actifs' },
                  { icon: Clock, value: '40%', label: 'Temps économisé' },
                  { icon: Shield, value: '100%', label: 'Données sécurisées' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                    className="glass-card p-6 hover-lift"
                  >
                    <stat.icon className="w-8 h-8 text-primary mb-3 mx-auto" />
                    <div className="font-display text-3xl font-bold text-foreground mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>

        </section>

        <section id='Fonctionnalites' className="py-24 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/20 to-transparent" />
          
          <div className="container mx-auto px-4 relative z-10">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <span className="text-primary text-sm font-medium tracking-wider uppercase">
                Fonctionnalités
              </span>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-4 mb-6">
                Tout ce dont vous avez{' '}
                <span className="text-gradient">besoin</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Une suite complète d'outils conçus pour simplifier la gestion quotidienne 
                de votre cabinet médical.
              </p>
            </motion.div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group"
                >
                  <div className="glass-card p-6 h-full hover-lift hover:border-primary/30 transition-all duration-300">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-display text-lg font-semibold mb-3 text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id='Tarifs' className="py-24 relative overflow-hidden">
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}
          />
          <div className="container mx-auto px-4 relative z-10">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-4 mb-6">
                Un espace adapté à{' '}
                <span className="text-gradient">votre rôle</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Chaque membre de l'équipe bénéficie d'une interface personnalisée 
                selon ses responsabilités.
              </p>
            </motion.div>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {roles.map((role, index) => (
                <motion.div
                  key={role.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative"
                >
                  <div className="glass-card p-8 h-full hover-lift relative overflow-hidden">
                    {/* Glow Effect */}
                    <div className={`absolute top-0 right-0 w-40 h-40 bg-${role.color}/20 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    <div className="relative z-10">
                      <div className={`w-14 h-14 rounded-2xl bg-${role.color}/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <role.icon className={`w-7 h-7 text-${role.color}`} />
                      </div>
                      
                      <h3 className="font-display text-2xl font-bold mb-2 text-foreground">
                        {role.title}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {role.description}
                      </p>
                      
                      <ul className="space-y-3">
                        {role.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-3">
                            <CheckCircle2 className={`w-5 h-5 text-${role.color} shrink-0 mt-0.5`} />
                            <span className="text-foreground/80 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>      
      </main>
      <Footer />
    </div>
  );
};

export default Index;
