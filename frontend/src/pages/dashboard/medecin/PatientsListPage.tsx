import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  FileText,
  Search,
  User,
  Calendar,
  Phone,
  Eye,
  Activity
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/shared/Modal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';
import type { Patient, DossierMedical, Consultation } from '@/types';

const API_URL = 'http://localhost:8080/api/medecin/consulatation';

const navItems = [
  { href: '/dashboard/medecin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/medecin/patients', label: 'Patients', icon: Users },
  { href: '/dashboard/medecin/consultations', label: 'Consultations', icon: Stethoscope },
  { href: '/dashboard/medecin/ordonnances', label: 'Ordonnances', icon: FileText },
];

export default function PatientsListPage() {
  const navigate = useNavigate();
  const [user] = useLocalStorage('user', null);
  
  // States
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Modal States
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [selectedDossier, setSelectedDossier] = useState<DossierMedical | null>(null);
  const [patientHistory, setPatientHistory] = useState<Consultation[]>([]);

  // 1. Fetch Patients avec conversion des types
  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_URL}/patients`, {
          params: { query: searchQuery }
        });
        
        // IMPORTANT : Conversion des données API vers l'interface Patient stricte
        const typedData: Patient[] = response.data.map((p: any) => ({
          ...p,
          dateNaissance: new Date(p.dateNaissance), // String "YYYY-MM-DD" -> Objet Date
          cabinetId: p.cabinet?.id || 0             // Extraction ID si nested object
        }));

        setPatients(typedData);
      } catch (error) {
        console.error("Erreur API Patients:", error);
        toast.error("Impossible de récupérer la liste des patients");
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => fetchPatients(), 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // 2. Fetch Dossier lors de l'ouverture de la modale
  useEffect(() => {
    if (viewingPatient) {
      const fetchDetails = async () => {
        try {
          const [dossierRes, historyRes] = await Promise.all([
            axios.get(`${API_URL}/patients/${viewingPatient.id}/dossier`),
            axios.get(`${API_URL}/patients/${viewingPatient.id}/consultations`)
          ]);
          setSelectedDossier(dossierRes.data);
          setPatientHistory(historyRes.data);
        } catch (error) {
          console.log("Pas de dossier ou erreur serveur");
          setSelectedDossier(null);
          setPatientHistory([]);
        }
      };
      fetchDetails();
    }
  }, [viewingPatient]);

  const calculateAge = (birthDate: Date) => {
    if (!birthDate) return 0;
    const today = new Date();
    // birthDate est un objet Date ici
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <DashboardLayout role={user?.role || 'MEDECIN'} navItems={navItems} userName={user ? `${user.nom} ${user.prenom}` : 'Dr.'}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Liste des Patients</h1>
            <p className="text-muted-foreground">{patients.length} patients enregistrés</p>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou CIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Grille */}
        {isLoading ? (
          <div className="text-center py-10 text-muted-foreground">Chargement des données...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((patient, index) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card variant="glass" className="h-full hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {patient.prenom} {patient.nom}
                        </h3>
                        <p className="text-sm text-muted-foreground">CIN: {patient.cin}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{calculateAge(patient.dateNaissance)} ans</span>
                        <span className="px-2 py-0.5 rounded-full bg-secondary text-xs">
                          {patient.sexe === 'HOMME' ? 'M' : 'F'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{patient.numTel}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Activity className="w-4 h-4" />
                        <span>Mutuelle: {patient.typeMutuelle}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setViewingPatient(patient)}
                      >
                        <Eye className="w-4 h-4 mr-1" /> Dossier
                      </Button>
                      <Button 
                        variant="hero" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => navigate(`/dashboard/medecin/consultation?patientId=${patient.id}`)}
                      >
                        <Stethoscope className="w-4 h-4 mr-1" /> Consulter
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modale Dossier */}
        <Modal
          isOpen={!!viewingPatient}
          onClose={() => setViewingPatient(null)}
          title="Dossier médical"
          size="lg"
        >
          {viewingPatient && (
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50">
                <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {viewingPatient.prenom} {viewingPatient.nom}
                  </h3>
                  <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                    <span>CIN: {viewingPatient.cin}</span>
                    <span>{calculateAge(viewingPatient.dateNaissance)} ans</span>
                    <span>{viewingPatient.sexe}</span>
                  </div>
                </div>
              </div>

              {selectedDossier ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-secondary/50">
                    <p className="text-sm text-muted-foreground mb-1">Antécédents médicaux</p>
                    <p className="text-foreground">{selectedDossier.antMedicaux || '-'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/50">
                    <p className="text-sm text-muted-foreground mb-1">Antécédents chirurgicaux</p>
                    <p className="text-foreground">{selectedDossier.antChirurg || '-'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive mb-1">Allergies</p>
                    <p className="text-foreground font-medium">{selectedDossier.allergies || 'Aucune'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">Dossier médical vide.</p>
              )}

              <div>
                <h4 className="font-semibold text-foreground mb-3">Historique consultations ({patientHistory.length})</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {patientHistory.map(consult => (
                    <div key={consult.id} className="p-4 rounded-xl bg-secondary/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-foreground">{consult.diagnostic}</p>
                          <p className="text-sm text-muted-foreground mt-1">{consult.observations}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(consult.dateConsultation).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setViewingPatient(null)}>
                  Fermer
                </Button>
                <Button variant="hero" onClick={() => navigate(`/dashboard/medecin/consultation?patientId=${viewingPatient.id}`)}>
                  <Stethoscope className="w-4 h-4 mr-1" /> Nouvelle consultation
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}