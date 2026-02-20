import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Calendar, FileText, Plus, Search, Edit, Trash2, CheckCircle2, XCircle, User as UserIcon, ChevronLeft, ChevronRight, Loader2} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/shared/Modal';
import { PatientSearch } from '@/components/shared/PatientSearch';
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

type StatutRdv = 'CONFIRME' | 'EN_ATTENTE' | 'TERMINE' | 'ANNULE';

interface PatientLite {
  id: number;
  nom: string;
  prenom: string;
  cin: string;
  numTel: string;
}

interface RendezVous {
  id: number;
  dateRdv: string; // Format ISO venant du backend
  motif: string;
  notes: string;
  statut: StatutRdv;
  patient: PatientLite; 
  patientId?: number;
}

const API_URL = 'http://localhost:8080/api/rendez-vous';

const navItems = [
  { href: '/dashboard/secretaire', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/secretaire/patients', label: 'Patients', icon: Users },
  { href: '/dashboard/secretaire/rendez-vous', label: 'Rendez-vous', icon: Calendar },
  { href: '/dashboard/secretaire/facturation', label: 'Facturation', icon: FileText },
];

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

export default function RendezVousPage() {
  const [user] = useLocalStorage('user', null);
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRdv, setEditingRdv] = useState<RendezVous | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<PatientLite | null>(null);
  
  const [formData, setFormData] = useState({
    date: '',
    time: '09:00',
    motif: '',
    notes: '',
  });

  // --- CHARGEMENT DES DONNÉES ---
  const fetchRdv = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // Format YYYY-MM-DD local pour l'API (évite décalage timezone)
      const dateStr = currentDate.toLocaleDateString('en-CA'); 
      
      const res = await axios.get(API_URL, {
        params: { 
          secretaireId: user.id,
          date: dateStr 
        }
      });
      setRendezVous(res.data);
    } catch (error) {
      console.error("Erreur chargement RDV", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRdv();
  }, [currentDate, user]);

  // --- GESTION DU TEMPS ---
  const formatDateHeader = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handlePrevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  // --- ACTIONS ---

  const handleOpenModal = (rdv?: RendezVous) => {
    if (rdv) {
      // MODE EDITION
      setEditingRdv(rdv);
      setSelectedPatient(rdv.patient);
      
      const rdvObj = new Date(rdv.dateRdv);
      setFormData({
        date: rdvObj.toISOString().split('T')[0],
        time: rdvObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        motif: rdv.motif,
        notes: rdv.notes || '',
      });
    } else {
      // MODE CREATION
      setEditingRdv(null);
      setSelectedPatient(null);
      setFormData({
        date: currentDate.toISOString().split('T')[0], // Pré-remplir avec la date affichée
        time: '09:00',
        motif: '',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveRdv = async () => {
    if (!selectedPatient || !user?.id) return;

    // Construction LocalDateTime ISO (YYYY-MM-DDTHH:mm:ss)
    const dateTime = `${formData.date}T${formData.time}:00`;

    const payload = {
      dateRdv: dateTime,
      motif: formData.motif,
      notes: formData.notes,
      patientId: selectedPatient.id,
      medecinId: 3 // TODO: Rendre dynamique si plusieurs médecins
    };

    try {
      if (editingRdv) {
        await axios.put(`${API_URL}/${editingRdv.id}`, payload);
      } else {
        await axios.post(API_URL, payload, { params: { secretaireId: user.id } });
      }
      setIsModalOpen(false);
      fetchRdv(); // Rafraîchir la liste
    } catch (error) {
      console.error("Erreur sauvegarde", error);
      alert("Erreur lors de l'enregistrement du rendez-vous.");
    }
  };

  const handleChangeStatus = async (rdvId: number, newStatus: StatutRdv) => {
    // 1. Optimistic UI : Mise à jour immédiate
    const previousRdv = rendezVous; // Sauvegarde en cas d'erreur
    setRendezVous(prev => prev.map(r => r.id === rdvId ? { ...r, statut: newStatus } : r));
    
    try {
      // 2. Appel API
      // Note : On passe 'null' en body car c'est un PATCH, 
      // et les params sont dans l'objet de config.
      await axios.patch(`${API_URL}/${rdvId}/statut`, null, {
        params: { statut: newStatus }
      });
      
      console.log("Statut mis à jour avec succès");

    } catch (error) {
      console.error("Erreur changement statut", error);
      
      // 3. Rollback : En cas d'erreur, on remet la liste précédente
      // ou on recharge depuis le serveur
      setRendezVous(previousRdv); 
      // Ou : fetchRdv();
      
      alert("Impossible de changer le statut (Vérifiez la console)");
    }
};

  const handleDeleteRdv = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setRendezVous(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error("Erreur suppression", error);
      alert("Impossible de supprimer ce rendez-vous.");
    }
  };

  // --- HELPERS VISUELS ---
  const getStatusColor = (statut: StatutRdv) => {
    switch (statut) {
      case 'CONFIRME': return 'bg-primary/20 text-primary';
      case 'EN_ATTENTE': return 'bg-warning/20 text-warning';
      case 'TERMINE': return 'bg-success/20 text-success';
      case 'ANNULE': return 'bg-destructive/20 text-destructive';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusLabel = (statut: StatutRdv) => {
    switch (statut) {
      case 'CONFIRME': return 'Confirmé';
      case 'EN_ATTENTE': return 'En attente';
      case 'TERMINE': return 'Terminé';
      case 'ANNULE': return 'Annulé';
      default: return statut;
    }
  };

  return (
    <DashboardLayout role={user.role} navItems={navItems} userName={user.nom + ' ' + user.prenom} >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Gestion des Rendez-vous
            </h1>
            <p className="text-muted-foreground">
              {rendezVous.length} rendez-vous pour cette journée
            </p>
          </div>
          <Button variant="hero" onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4" />
            Nouveau RDV
          </Button>
        </div>

        {/* Date Navigation */}
        <Card variant="glass">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={handlePrevDay}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="text-center">
                <p className="font-display text-xl font-semibold text-foreground capitalize">
                  {formatDateHeader(currentDate)}
                </p>
                {currentDate.toDateString() === new Date().toDateString() && (
                  <span className="text-sm text-primary font-medium">Aujourd'hui</span>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={handleNextDay}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Planning du jour
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : rendezVous.length > 0 ? (
              <div className="space-y-3">
                {rendezVous.map((rdv, index) => (
                  <motion.div
                    key={rdv.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="text-center min-w-[60px]">
                      <p className="font-display text-lg font-bold text-foreground">
                        {new Date(rdv.dateRdv).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="h-12 w-px bg-border" />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {rdv.patient?.prenom} {rdv.patient?.nom}
                        </p>
                        <p className="text-sm text-muted-foreground">{rdv.motif}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(rdv.statut)}`}>
                      {getStatusLabel(rdv.statut)}
                    </span>
                    <div className="flex items-center gap-1">
                      {rdv.statut === 'CONFIRME' && (
                        <>
                          <Button 
                            variant="ghost" size="icon" className="h-8 w-8 text-warning"
                            onClick={() => handleChangeStatus(rdv.id, 'EN_ATTENTE')} title="Mettre en attente"
                          >
                            <div className="w-3 h-3 rounded-full bg-warning" />
                          </Button>
                          <Button 
                            variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                            onClick={() => handleChangeStatus(rdv.id, 'ANNULE')} title="Annuler"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {rdv.statut === 'EN_ATTENTE' && (
                         <Button 
                            variant="ghost" size="icon" className="h-8 w-8 text-success"
                            onClick={() => handleChangeStatus(rdv.id, 'TERMINE')} title="Terminer"
                         >
                            <CheckCircle2 className="w-4 h-4" />
                         </Button>
                      )}
                      
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenModal(rdv)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteRdv(rdv.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun rendez-vous pour cette journée</p>
                <Button variant="outline" className="mt-4" onClick={() => handleOpenModal()}>
                  <Plus className="w-4 h-4" />
                  Planifier un RDV
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal Création / Edition */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingRdv ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
          size="lg"
        >
          <div className="space-y-4">
            {/* Sélection Patient */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Patient *</label>
              
              {!selectedPatient ? (
                <PatientSearch onSelectPatient={(p: any) => setSelectedPatient(p)} />
              ) : (
                <div className="mt-2 p-3 rounded-lg bg-secondary/50 flex items-center gap-3 justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{selectedPatient.prenom} {selectedPatient.nom}</p>
                      <p className="text-xs text-muted-foreground">{selectedPatient.cin} - {selectedPatient.numTel}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedPatient(null)}>
                    Changer
                  </Button>
                </div>
              )}
            </div>

            {/* Date et Heure */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Date *</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Heure *</label>
                <select
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl bg-input border border-border text-foreground"
                >
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Motif et Notes */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Motif *</label>
              <Input
                value={formData.motif}
                onChange={(e) => setFormData(prev => ({ ...prev, motif: e.target.value }))}
                placeholder="Ex: Consultation générale"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notes supplémentaires..."
                className="w-full h-24 px-3 py-2 rounded-xl bg-input border border-border text-foreground resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button variant="hero" onClick={handleSaveRdv} disabled={!selectedPatient || !formData.date || !formData.motif}>
              {editingRdv ? 'Enregistrer' : 'Créer le RDV'}
            </Button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}