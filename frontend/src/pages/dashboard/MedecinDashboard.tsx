import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  FileText, 
  Clock,
  User,
  Pill,
  ClipboardList,
  HeartPulse
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Link } from 'react-router-dom';

type User = {
  id: number;
  nom: string;
  prenom: string;
  role: 'ADMIN' | 'MEDECIN' | 'SECRETAIRE';
};

interface WaitingPatient {
  idRdv: number;
  name: string;
  age: number;
  motif: string;
  waitTime: string;
  priority: 'high' | 'normal';
}

interface RecentConsultation {
  id: number;
  patient: string;
  diagnostic: string;
  date: string;
}

interface DashboardData {
  nbConsultationsToday: number;
  nbPatientsAttente: number;
  nbOrdonnancesEmises: number;
  nbDossiersMisAJour: number;
  waitingPatients: WaitingPatient[];
  recentConsultations: RecentConsultation[];
}

const navItems = [
  { href: '/dashboard/medecin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/medecin/patients', label: 'Patients', icon: Users },
  { href: '/dashboard/medecin/consultations', label: 'Consultations', icon: Stethoscope },
  { href: '/dashboard/medecin/ordonnances', label: 'Ordonnances', icon: FileText },
];

export default function MedecinDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user] = useLocalStorage('user', null);

  // Simulation de l'ID du médecin connecté (à récupérer via votre contexte d'authentification)
  const medecinId = user.id; 

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Appel vers le backend Spring Boot
      const response = await axios.get(`http://localhost:8080/api/medecin/dashboard/${medecinId}`);
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error("Erreur lors de la récupération des données:", err);
      setError("Impossible de charger les données du tableau de bord. Vérifiez que le backend est lancé.");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Consultations de ce jour', value: data?.nbConsultationsToday || 0, icon: Stethoscope, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Patients en attente', value: data?.nbPatientsAttente || 0, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Ordonnances émises', value: data?.nbOrdonnancesEmises || 0, icon: Pill, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Dossiers mis à jour', value: data?.nbDossiersMisAJour || 0, icon: ClipboardList, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <DashboardLayout role={user.role} navItems={navItems} userName={user.nom + ' ' + user.prenom} >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Bonjour, Dr. {user.nom} !
            </h1>
            <p className="text-muted-foreground">
              {data?.nbPatientsAttente || 0} patients vous attendent en consultation
            </p>
          </div>
          
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="font-display text-3xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div>
          {/* Waiting Patients */}
          <div className="lg:col-span-2">
            <Card variant="glass">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-warning" />
                  Patients en attente
                </CardTitle>
                <span className="px-3 py-1 rounded-full bg-warning/20 text-warning text-sm font-medium">
                  {data?.waitingPatients.length} en attente
                </span>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data?.waitingPatients.map((patient: any, index: number) => (
                    <motion.div
                      key={patient.idRdv}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
                        patient.priority === 'high' 
                          ? 'bg-destructive/10 border border-destructive/20' 
                          : 'bg-secondary/50 hover:bg-secondary'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          patient.priority === 'high' ? 'bg-destructive/20' : 'bg-accent/20'
                        }`}>
                          <User className={`w-5 h-5 ${patient.priority === 'high' ? 'text-destructive' : 'text-accent'}`} />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{patient.name}</p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{patient.age} ans</span>
                            <span>•</span>
                            <span>{patient.motif}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">{patient.waitTime}</p>
                          <p className="text-xs text-muted-foreground">d'attente</p>
                        </div>
                        <Link to={`/dashboard/medecin/patients`}>
                          <Button variant={patient.priority === 'high' ? 'destructive' : 'hero'} size="sm">
                            Consulter
                          </Button>
                        </Link>
                        {/* 
                        <Button
                          variant={patient.priority === 'high' ? 'destructive' : 'hero'}
                          size="sm"
                          onClick={async () => {
                            try {
                              setLoading(true);
                              // Appel backend pour démarrer la consultation (adapter l'endpoint selon votre API)
                              await axios.post(`http://localhost:8080/api/rdv/start/${patient.idRdv}`);
                              // Recharger les données du tableau de bord
                              await fetchDashboardData();
                            } catch (err) {
                              console.error("Erreur démarrage consultation:", err);
                            } finally {
                              setLoading(false);
                            }
                          }}
                        >
                          Consulter
                        </Button>
                        */}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Consultations */}
            <Card variant="glass" className="mt-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-primary" />
                  Consultations récentes
                </CardTitle>
                <Button variant="ghost" size="sm">
                  Voir tout
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data?.recentConsultations.map((consultation: any, index: number) => (
                    <motion.div
                      key={consultation.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-secondary/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <HeartPulse className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{consultation.patient}</p>
                          <p className="text-sm text-muted-foreground">{consultation.diagnostic}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{consultation.date}</p>
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