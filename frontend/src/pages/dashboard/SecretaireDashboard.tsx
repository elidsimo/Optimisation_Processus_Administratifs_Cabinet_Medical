import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Calendar, FileText, Clock, User as UserIcon, Phone, CreditCard, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import axios from 'axios';
type User = {
  id: number;
  nom: string;
  prenom: string;
  logo?: string;
  tel: string;
  adresse: string;
  nom_cabinet: string;
  role: 'ADMIN' | 'MEDECIN' | 'SECRETAIRE';
};

// --- CONFIGURATION API ---
const API_BASE_URL = 'http://localhost:8080/api/secretaire';

const navItems = [
  { href: '/dashboard/secretaire', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/secretaire/patients', label: 'Patients', icon: Users },
  { href: '/dashboard/secretaire/rendez-vous', label: 'Rendez-vous', icon: Calendar },
  { href: '/dashboard/secretaire/facturation', label: 'Facturation', icon: FileText },
];

export default function SecretaireDashboard() {
  const [user] = useLocalStorage('user', null);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalRdv: 0,
    rdvEnAttente: 0,
    facturesPayees: 0
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.id) {
        setError("Utilisateur non identifié. Veuillez vous reconnecter.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        
        const [statsRes, aptRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/stats`, { params: { id: user.id } }),
          axios.get(`${API_BASE_URL}/appointments`, { params: { id: user.id } })
        ]);

        setStats(statsRes.data);
        setAppointments(aptRes.data);
        setError(null);
      } catch (err) {
        console.error("Erreur de connexion au serveur:", err);
        
        if (err.response && err.response.status === 500) {
             setError("Erreur interne : Vérifiez que la secrétaire est bien liée à un cabinet.");
        } else {
             setError("Impossible de contacter le serveur.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]); 

  const statCards = [
    { label: 'Patients', value: stats.totalPatients, icon: Users },
    { label: 'Rendez-vous', value: stats.totalRdv, icon: Calendar },
    { label: 'En attente', value: stats.rdvEnAttente, icon: Clock },
    { label: 'Factures payées', value: stats.facturesPayees, icon: CreditCard },
  ];

  return (
    <DashboardLayout role={user?.role} navItems={navItems} userName={user ? `${user.nom} ${user.prenom}` : 'Secrétaire'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Secrétaire
            </h1>
            <p className="text-muted-foreground">
              Voici un résumé de votre cabinet
            </p>
          </div>
        </div>

        {/* Gestion d'erreur globale */}
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="glass" className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="font-display text-3xl font-bold text-foreground">
                        {loading ? "-" : stat.value}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 text-accent`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div>
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2">
            <Card variant="glass">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Rendez-vous du jour
                </CardTitle>
                <Link to='/dashboard/secretaire/rendez-vous' className="inline-block">
                  <Button variant="ghost" size="sm">
                    Voir tout
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* État de chargement */}
                  {loading && (
                    <div className="flex justify-center py-8 text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      Chargement des rendez-vous...
                    </div>
                  )}

                  {/* État vide */}
                  {!loading && !error && appointments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucun rendez-vous prévu pour aujourd'hui.
                    </div>
                  )}

                  {/* Liste des rendez-vous */}
                  {!loading && appointments.map((apt, index) => (
                    <motion.div
                      key={apt.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          {/* Note: apt.patientName vient du DTO Spring Boot */}
                          <p className="font-medium text-foreground">{apt.patientName}</p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {apt.time}
                            </span>
                            {apt.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {apt.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Badge de statut */}
                      <div className="flex items-center gap-2">
                        {apt.status === 'confirmed' && (
                          <span className="px-3 py-1 rounded-full bg-success/20 text-success text-xs font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Confirmé
                          </span>
                        )}
                        {apt.status === 'waiting' && (
                          <span className="px-3 py-1 rounded-full bg-warning/20 text-warning text-xs font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            En attente
                          </span>
                        )}
                        {(apt.status === 'pending' || apt.status === 'cancelled') && (
                          <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                            {apt.status === 'cancelled' ? 'Annulé' : 'À confirmer'}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}