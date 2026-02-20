import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Stethoscope, FileText, Search, Calendar, User, Eye, Loader2, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/shared/Modal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
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
type TypeConsultation =  'SUIVI' | 'SPECIALISEE' | 'NORMALE';

interface ConsultationDTO {
  id: number;
  dateConsultation: string; 
  typeConsultation: TypeConsultation;
  diagnostic: string;
  examenClinique: string;
  observations: string;
  patientId: number;
  patientNom: string;
  patientPrenom: string;
  patientCin: string;
  dossierId: number;
  antMedicaux: string;
  antChirurg: string;  
  allergies: string;
}

const navItems = [
  { href: '/dashboard/medecin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/medecin/patients', label: 'Patients', icon: Users },
  { href: '/dashboard/medecin/consultations', label: 'Consultations', icon: Stethoscope },
  { href: '/dashboard/medecin/ordonnances', label: 'Ordonnances', icon: FileText },
];

const typeConsultationLabels: Record<string, string> = {
  SUIVI: 'Suivi',
  SPECIALISEE: 'Spécialisée',
  NORMALE: 'Normale',
};

export default function ConsultationsPage() {
  // --- STATES ---
  const [consultations, setConsultations] = useState<ConsultationDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user] = useLocalStorage('user', null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewingConsultation, setViewingConsultation] = useState<ConsultationDTO | null>(null);
  
  // --- API CALLS ---
  useEffect(() => {
    // Petit délai (debounce) pour éviter de spammer l'API à chaque frappe
    const delayDebounceFn = setTimeout(() => {
      fetchConsultations(searchQuery);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchConsultations = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      // L'URL doit correspondre à ton Controller Spring Boot
      const url = query 
        ? `http://localhost:8080/api/medecin/consultations?search=${query}`
        : `http://localhost:8080/api/medecin/consultations`;

      const response = await axios.get<ConsultationDTO[]>(url);
      setConsultations(response.data);
    } catch (err) {
      console.error("Erreur API:", err);
      setError("Impossible de charger les consultations. Vérifiez que le backend est lancé.");
    } finally {
      setLoading(false);
    }
  };

  // --- FILTRAGE LOCAL (Type) ---
  // La recherche texte est faite côté serveur, le filtre type est fait côté client ici
  const filteredConsultations = consultations.filter(c => {
    return filterType === 'all' || c.typeConsultation === filterType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SUIVI': return 'bg-accent/20 text-accent';
      case 'SPECIALISEE': return 'bg-destructive/20 text-destructive';
      case 'NORMALE': return 'bg-success/20 text-success';
      default: return 'bg-secondary text-foreground';
    }
  };

  return (
    <DashboardLayout role={user.role} navItems={navItems} userName={`${user.nom} ${user.prenom}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Gestion des Consultations
            </h1>
            <p className="text-muted-foreground">
              {consultations.length} consultations trouvées
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom du patient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="h-10 px-3 rounded-xl bg-input border border-border text-foreground"
              >
                <option value="all">Tous les types</option>
                {Object.entries(typeConsultationLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 text-destructive flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          /* Consultations List */
          <div className="grid gap-4">
            {filteredConsultations.map((consultation, index) => (
              <motion.div
                key={consultation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card variant="glass" className="hover-lift">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {consultation.patientNom} {consultation.patientPrenom}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(consultation.dateConsultation).toLocaleDateString('fr-FR')}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${getTypeColor(consultation.typeConsultation)}`}>
                              {typeConsultationLabels[consultation.typeConsultation] || consultation.typeConsultation}
                            </span>
                          </div>
                          <p className="mt-2 text-foreground line-clamp-1">{consultation.diagnostic || 'Aucun diagnostic'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setViewingConsultation(consultation)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Voir détails
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredConsultations.length === 0 && !error && (
          <div className="text-center py-12">
            <Stethoscope className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Aucune consultation trouvée</p>
          </div>
        )}

        {/* View Consultation Modal */}
        <Modal
          isOpen={!!viewingConsultation}
          onClose={() => setViewingConsultation(null)}
          title="Détails de la consultation"
          size="lg"
        >
          {viewingConsultation && (
            <div className="space-y-6">
              {/* Patient Info */}
              <div className="p-4 rounded-xl bg-secondary/50">
                <h4 className="font-semibold text-foreground mb-2">Patient</h4>
                <p className="text-foreground text-lg">{viewingConsultation.patientNom} {viewingConsultation.patientPrenom}</p>
                <p className="text-sm text-muted-foreground">CIN: {viewingConsultation.patientCin}</p>
              </div>

              {/* Consultation Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-secondary/50">
                  <p className="text-sm text-muted-foreground mb-1">Date</p>
                  <p className="font-medium text-foreground">
                    {new Date(viewingConsultation.dateConsultation).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/50">
                  <p className="text-sm text-muted-foreground mb-1">Type</p>
                  <p className="font-medium text-foreground">
                    {typeConsultationLabels[viewingConsultation.typeConsultation] || viewingConsultation.typeConsultation}
                  </p>
                </div>
              </div>

              {/* Examen */}
              <div className="p-4 rounded-xl bg-secondary/50">
                <h4 className="font-semibold text-foreground mb-2">Examen clinique</h4>
                <p className="text-foreground whitespace-pre-wrap">{viewingConsultation.examenClinique || '-'}</p>
              </div>

              {/* Diagnostic */}
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <h4 className="font-semibold text-primary mb-2">Diagnostic</h4>
                <p className="text-foreground font-medium">{viewingConsultation.diagnostic || '-'}</p>
              </div>

              {/* Observations */}
              <div className="p-4 rounded-xl bg-secondary/50">
                <h4 className="font-semibold text-foreground mb-2">Observations</h4>
                <p className="text-foreground">{viewingConsultation.observations || '-'}</p>
              </div>

              {/* Antécédents (Provenant du DTO) */}
              <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
                <h4 className="font-semibold text-warning mb-2">Dossier Médical (Antécédents)</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground font-medium">Médicaux:</span> {viewingConsultation.antMedicaux || '-'}</p>
                  <p><span className="text-muted-foreground font-medium">Chirurgicaux:</span> {viewingConsultation.antChirurg || '-'}</p>
                  <p><span className="text-muted-foreground font-medium">Allergies:</span> {viewingConsultation.allergies || '-'}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setViewingConsultation(null)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}