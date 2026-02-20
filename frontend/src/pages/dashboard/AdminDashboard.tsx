import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { LayoutDashboard, Building2, Users, Pill, Power, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';

type User = {
  id: number;
  nom: string;
  prenom: string;
  role: 'ADMIN' | 'MEDECIN' | 'SECRETAIRE';
};

// --- Configuration ---
const API_URL = 'http://localhost:8080/api/admin/dashboard';

const navItems = [
  { href: '/dashboard/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/admin/cabinets', label: 'Cabinets', icon: Building2 },
  { href: '/dashboard/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
  { href: '/dashboard/admin/medicaments', label: 'Médicaments', icon: Pill },
];

export default function AdminDashboard() {
  // --- État (State) ---
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user] = useLocalStorage('user', null);

  // --- Chargement des données ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(API_URL);
        setData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors de la récupération du dashboard:", err);
        setError("Impossible de connecter au serveur.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- Affichage Chargement / Erreur ---
  if (loading) {
    return (
      <DashboardLayout role="ADMIN" navItems={navItems} userName="Admin Principal">
        <div className="flex h-[50vh] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="ADMIN" navItems={navItems} userName="Admin Principal">
        <div className="flex h-[50vh] flex-col items-center justify-center text-destructive gap-4">
          <AlertCircle className="h-12 w-12" />
          <p className="text-lg font-medium">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      </DashboardLayout>
    );
  }

  // --- Préparation des données pour l'affichage ---
  
  // Mapping des stats backend -> frontend
  const stats = [
    { label: 'Cabinets actifs', value: data.stats.cabinetsActifs, icon: Building2 },
    { label: 'Utilisateurs', value: data.stats.utilisateurs, icon: Users, color: 'accent' },
    { label: 'Médicaments', value: data.stats.medicaments, icon: Pill },
    { label: 'Cabinets inactifs', value: data.stats.cabinetsInactifs, icon: Power },
  ];

  return (
    <DashboardLayout role={user.role} navItems={navItems} userName={user.nom + ' ' + user.prenom} >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Administration
            </h1>
            <p className="text-muted-foreground">
              Vue d'ensemble en temps réel
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
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
                        {stat.value.toLocaleString()}
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Cabinets List */}
          <div className="lg:col-span-2">
            <Card variant="glass">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Cabinets récents
                </CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <a href="/dashboard/admin/cabinets">Voir tout</a>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Cabinet</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Spécialité</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Ville</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Utilisateurs</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentCabinets.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">Aucun cabinet trouvé</td>
                        </tr>
                      ) : (
                        data.recentCabinets.map((cabinet, index) => (
                          <motion.tr
                            key={cabinet.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                {cabinet.logoUrl ? (
                                  <div className="w-10 h-10 rounded-full overflow-hidden border border-border bg-background">
                                    <img
                                      src={cabinet.logoUrl}
                                      alt={`${cabinet.name} logo`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-primary" />
                                  </div>
                                )}
                                <span className="font-medium text-foreground">{cabinet.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">{cabinet.specialite}</td>
                            <td className="py-3 px-4 text-muted-foreground">{cabinet.ville}</td>
                            <td className="py-3 px-4 text-muted-foreground">{cabinet.users}</td>
                            <td className="py-3 px-4">
                              {cabinet.status === 'active' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Actif
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-medium">
                                  <XCircle className="w-3 h-3" />
                                  Inactif
                                </span>
                              )}
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Medications */}
          <div className="space-y-6">
            <Card variant="glass">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-green-500" />
                  Médicaments Ajoutés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.recentMedicaments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucun médicament récent</p>
                  ) : (
                    data.recentMedicaments.map((med) => (
                      <div key={med.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                        <div>
                          <p className="font-medium text-foreground text-sm">{med.nom}</p>
                          <p className="text-xs text-muted-foreground">{med.forme} - {med.dosage}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}