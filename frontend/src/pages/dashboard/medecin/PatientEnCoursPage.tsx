import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  FileText,
  User,
  Calendar,
  Phone,
  AlertTriangle,
  Save,
  Printer,
  ArrowLeft,
  Plus,
  Trash2,
  Pill,
  ClipboardList
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PatientSearch } from '@/components/shared/PatientSearch'; 
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';
import type { Patient, Medicament, DossierMedical, Consultation, PrescriptionItem, TypeConsultation } from '@/types';

const API_URL = 'http://localhost:8080/api/medecin/consulatation';

const navItems = [
  { href: '/dashboard/medecin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/medecin/patients', label: 'Patients', icon: Users },
  { href: '/dashboard/medecin/consultations', label: 'Consultations', icon: Stethoscope },
  { href: '/dashboard/medecin/ordonnances', label: 'Ordonnances', icon: FileText },
];

export default function PatientEnCoursPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientIdParam = searchParams.get('patientId');
  const [user] = useLocalStorage('user', null);

  // --- Données ---
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [dossier, setDossier] = useState<DossierMedical | null>(null);
  const [historique, setHistorique] = useState<Consultation[]>([]);

  // --- Formulaire ---
  const [consultationForm, setConsultationForm] = useState({
    typeConsultation: 'CONSULTATION' as TypeConsultation,
    examenClinique: '',
    diagnostic: '',
    observations: '',
  });

  // --- Prescription ---
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [medicamentSearch, setMedicamentSearch] = useState('');
  const [foundMedicaments, setFoundMedicaments] = useState<Medicament[]>([]);
  const [showMedicamentDropdown, setShowMedicamentDropdown] = useState(false);

  // 1. Chargement Patient au démarrage
  useEffect(() => {
    if (patientIdParam) {
      loadPatientData(parseInt(patientIdParam));
    }
  }, [patientIdParam]);

  const loadPatientData = async (id: number) => {
    try {
      // Chargement info patient
      const pRes = await axios.get(`${API_URL}/patients/${id}`);
      
      // Conversion type strict
      const rawPatient = pRes.data;
      const patientTyped: Patient = {
        ...rawPatient,
        dateNaissance: new Date(rawPatient.dateNaissance),
        cabinetId: rawPatient.cabinet?.id || 0
      };
      setSelectedPatient(patientTyped);

      // Chargement dossier et historique
      const [dRes, hRes] = await Promise.all([
        axios.get(`${API_URL}/patients/${id}/dossier`),
        axios.get(`${API_URL}/patients/${id}/consultations`)
      ]);
      setDossier(dRes.data);
      setHistorique(hRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du chargement des données patient");
    }
  };

  // 2. Recherche Médicaments (Live Search)
  useEffect(() => {
    if (medicamentSearch.length < 2) {
      setFoundMedicaments([]);
      setShowMedicamentDropdown(false);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        const res = await axios.get(`${API_URL}/medicaments`, {
          params: { query: medicamentSearch }
        });
        setFoundMedicaments(res.data);
        setShowMedicamentDropdown(true);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [medicamentSearch]);

  const addPrescription = (medicament: Medicament) => {
    if (!prescriptions.find(p => p.medicament.id === medicament.id)) {
      setPrescriptions([...prescriptions, {
        medicament,
        posologie: '',
        duree: '',
        instructions: '',
      }]);
    }
    setMedicamentSearch('');
    setShowMedicamentDropdown(false);
  };

  const removePrescription = (medicamentId: number) => {
    setPrescriptions(prescriptions.filter(p => p.medicament.id !== medicamentId));
  };

  const updatePrescription = (id: number, field: keyof Omit<PrescriptionItem, 'medicament'>, val: string) => {
    setPrescriptions(prescriptions.map(p => p.medicament.id === id ? { ...p, [field]: val } : p));
  };

  // 3. Sauvegarde
  const handleSaveConsultation = async () => {
    if (!selectedPatient) return;

    const payload = {
      patientId: selectedPatient.id,
      typeConsultation: consultationForm.typeConsultation,
      examenClinique: consultationForm.examenClinique,
      diagnostic: consultationForm.diagnostic,
      observations: consultationForm.observations,
      prescriptions: prescriptions.map(p => ({
        medicamentId: p.medicament.id,
        posologie: p.posologie,
        duree: p.duree,
        instructions: p.instructions
      }))
    };

    try {
      await axios.post(`${API_URL}/consultations`, payload);
      toast.success('Consultation enregistrée avec succès');
      navigate('/dashboard/medecin/patients');
    } catch (error) {
      console.error(error);
      toast.error("Erreur technique lors de l'enregistrement");
    }
  };

  // Helper impression
  const handlePrintOrdonnance = () => {
    if (prescriptions.length === 0) {
      toast.error('Aucune prescription à imprimer');
      return;
    }
    // Logique d'impression (window.open, etc.) à conserver comme dans ton code initial
    toast.info("Impression lancée...");
  };

  const calculateAge = (birthDate: Date) => {
    if(!birthDate) return 0;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  return (
    <DashboardLayout role={user?.role || 'MEDECIN'} navItems={navItems} userName={user ? `${user.nom} ${user.prenom}` : 'Dr.'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/medecin/patients')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Consultation en cours</h1>
            <p className="text-muted-foreground">Saisie du diagnostic et des prescriptions</p>
          </div>
        </div>

        {/* Sélection Patient */}
        {!selectedPatient ? (
          <Card variant="glass">
            <CardHeader><CardTitle>Sélectionner un patient</CardTitle></CardHeader>
            <CardContent>
              {/* Le composant PatientSearch doit renvoyer l'objet ou l'ID */}
              <PatientSearch 
                onSelectPatient={(p: any) => {
                   const id = p.id || p; 
                   navigate(`/dashboard/medecin/consultation?patientId=${id}`);
                }}
                placeholder="Rechercher par CIN ou nom..."
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Colonne Gauche : Infos + Form + Rx */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Carte Info Patient */}
              <Card variant="glass">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
                        <User className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-foreground">
                          {selectedPatient.prenom} {selectedPatient.nom}
                        </h2>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {calculateAge(selectedPatient.dateNaissance)} ans
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {selectedPatient.numTel}
                          </span>
                          <span>CIN: {selectedPatient.cin}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedPatient(null); navigate('/dashboard/medecin/consultation'); }}>
                      Changer
                    </Button>
                  </div>
                  
                  {dossier?.allergies && dossier.allergies !== 'Aucune' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-destructive">Attention : Allergies</p>
                        <p className="text-sm text-foreground">{dossier.allergies}</p>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              {/* Formulaire Consultation */}
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-primary" /> Consultation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Type</label>
                    <select
                      value={consultationForm.typeConsultation}
                      onChange={(e) => setConsultationForm({ ...consultationForm, typeConsultation: e.target.value as TypeConsultation })}
                      className="w-full h-10 px-3 rounded-xl bg-input border border-border"
                    >
                      <option value="CONSULTATION">Consultation</option>
                      <option value="CONTROLE">Contrôle</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Examen Clinique</label>
                      <Textarea
                        value={consultationForm.examenClinique}
                        onChange={(e) => setConsultationForm({ ...consultationForm, examenClinique: e.target.value })}
                        placeholder="TA, Poids, Auscultation..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Diagnostic</label>
                      <Textarea
                        value={consultationForm.diagnostic}
                        onChange={(e) => setConsultationForm({ ...consultationForm, diagnostic: e.target.value })}
                        placeholder="Diagnostic principal..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Observations</label>
                    <Textarea
                      value={consultationForm.observations}
                      onChange={(e) => setConsultationForm({ ...consultationForm, observations: e.target.value })}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Ordonnance */}
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="w-5 h-5 text-accent" /> Ordonnance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Input
                      value={medicamentSearch}
                      onChange={(e) => setMedicamentSearch(e.target.value)}
                      placeholder="Rechercher un médicament..."
                    />
                    {showMedicamentDropdown && foundMedicaments.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-xl shadow-lg max-h-60 overflow-auto">
                        {foundMedicaments.map(med => (
                          <button
                            key={med.id}
                            onClick={() => addPrescription(med)}
                            className="w-full px-4 py-3 text-left hover:bg-secondary/50 transition-colors"
                          >
                            <p className="font-medium text-foreground">{med.nomCommercial}</p>
                            <p className="text-sm text-muted-foreground">{med.dosage} - {med.forme}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {prescriptions.length > 0 ? (
                    <div className="space-y-4">
                      {prescriptions.map((pres, index) => (
                        <div key={pres.medicament.id} className="p-4 rounded-xl bg-secondary/50 border border-border">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-semibold text-foreground">
                                {index + 1}. {pres.medicament.nomCommercial}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {pres.medicament.dosage} - {pres.medicament.forme}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => removePrescription(pres.medicament.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <Input
                              placeholder="Posologie (ex: 1cp 3x/j)"
                              value={pres.posologie}
                              onChange={(e) => updatePrescription(pres.medicament.id, 'posologie', e.target.value)}
                            />
                            <Input
                              placeholder="Durée (ex: 7j)"
                              value={pres.duree}
                              onChange={(e) => updatePrescription(pres.medicament.id, 'duree', e.target.value)}
                            />
                            <Input
                              placeholder="Instructions"
                              value={pres.instructions}
                              onChange={(e) => updatePrescription(pres.medicament.id, 'instructions', e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Pill className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Aucun médicament prescrit</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Boutons Action */}
              <div className="flex flex-wrap gap-3">
                <Button variant="hero" className="flex-1" onClick={handleSaveConsultation}>
                  <Save className="w-4 h-4 mr-2" /> Enregistrer
                </Button>
                <Button variant="outline" className="flex-1" onClick={handlePrintOrdonnance}>
                  <Printer className="w-4 h-4 mr-2" /> Imprimer
                </Button>
              </div>
            </div>

            {/* Colonne Droite : Sidebar */}
            <div className="space-y-6">
              {/* Antécédents */}
              {dossier && (
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-warning" /> Antécédents
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Médicaux</p>
                      <p className="text-sm">{dossier.antMedicaux || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Chirurgicaux</p>
                      <p className="text-sm">{dossier.antChirurg || '-'}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Historique */}
              <Card variant="glass">
                <CardHeader>
                  <CardTitle>Historique</CardTitle>
                </CardHeader>
                <CardContent>
                  {historique.length > 0 ? (
                    <div className="space-y-3">
                      {historique.slice(0, 5).map(consult => (
                        <div key={consult.id} className="p-3 rounded-lg bg-secondary/50">
                          <p className="text-sm font-medium text-foreground">{consult.diagnostic}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(consult.dateConsultation).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucun historique disponible
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}