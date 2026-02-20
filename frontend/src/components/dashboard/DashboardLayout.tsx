import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, Bell, ChevronDown, User} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { UserRole } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

type User = {
  id: number;
  nom: string;
  prenom: string;
  logo?: string;
  nom_cabinet?: string;
  role: 'ADMIN' | 'MEDECIN' | 'SECRETAIRE';
};

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: UserRole;
  navItems: NavItem[];
  userName?: string;
}

export function DashboardLayout({ children, role, navItems, userName = 'Utilisateur' }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [user] = useLocalStorage('user', null);

  const roleColors = {
    SECRETAIRE: 'from-primary to-primary/60',
    MEDECIN: 'from-accent to-accent/60',
    ADMIN: 'from-success to-success/60',
  };

  const roleTitles = {
    SECRETAIRE: 'Secrétaire',
    MEDECIN: 'Médecin',
    ADMIN: 'Administrateur',
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:flex flex-col fixed left-0 top-0 bottom-0 bg-sidebar border-r border-sidebar-border transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            {user?.logo ? (
              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                <img
                  src={user.logo}
                  alt={user.nom ? `${user.nom} ${user.prenom}` : 'Logo'}
                  className="w-10 h-10 object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                <img
                  src="/public/7.png"
                  alt="7M7Cabinet"
                  className="w-10 h-10 rounded-xl object-cover"
                />
              </div>
            )}
            
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-display text-lg font-bold text-sidebar-foreground"
              >
                Cabinet {user?.nom_cabinet ?? '7M7'}
              </motion.span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
          >
            <Menu className="w-5 h-5 text-sidebar-foreground" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? '' : 'group-hover:text-primary'}`} />
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className={`flex items-center gap-3 ${sidebarOpen ? '' : 'justify-center'}`}>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleColors[role]} flex items-center justify-center shrink-0`}>
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sidebar-foreground truncate">
                  {user.nom + ' ' + user.prenom}
                </div>
                <div className="text-xs text-muted-foreground">
                  {user.role}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-xl border-b border-border z-50 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <img
              src="/public/7.png" // ou le chemin de votre photo dans /public ou importée
              alt="7M7Cabinet"
              className="w-10 h-10 rounded-xl object-cover"
            />
          </div>
          <span className="font-display text-lg font-bold">MediCabinet</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3 }}
            className="lg:hidden fixed inset-0 top-16 bg-background z-40"
          >
            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-foreground hover:bg-secondary'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-destructive"
                onClick={() => navigate('/login')}
              >
                <LogOut className="w-5 h-5" />
                Déconnexion
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Top Bar */}
        <div className="h-16 hidden lg:flex items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-30">
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              {navItems.find(item => item.href === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-4">          
            <div className="relative">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${roleColors[role]} flex items-center justify-center`}>
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-medium text-foreground">{userName}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg overflow-hidden"
                  >
                    <button 
                      onClick={() => navigate('/')}
                      className="w-full flex items-center gap-2 px-4 py-3 text-destructive hover:bg-secondary transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6 pt-20 lg:pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}
