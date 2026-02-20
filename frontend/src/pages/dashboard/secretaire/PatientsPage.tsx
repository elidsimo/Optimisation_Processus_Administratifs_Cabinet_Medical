import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Calendar, FileText, Plus, Search, Edit, Trash2, Eye, Phone, User as UserIcon, AlertCircle, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/shared/Modal';
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

type Sexe = 'HOMME' | 'FEMME';
type TypeMutuelle = 'CNSS' | 'CNOPS' | 'AMO' | 'PRIVEE' | 'AUCUNE';

type Patient = {
  id: number;
  cin: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  sexe: Sexe;
  numTel: string;
  typeMutuelle: TypeMutuelle;
};

const API_URL = 'http://localhost:8080/api/patients';

const navItems = [
  { href: '/dashboard/secretaire', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/secretaire/patients', label: 'Patients', icon: Users },
  { href: '/dashboard/secretaire/rendez-vous', label: 'Rendez-vous', icon: Calendar },
  { href: '/dashboard/secretaire/facturation', label: 'Facturation', icon: FileText },
];

export default function PatientsPage() {
  const [user] = useLocalStorage('user', null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  

  // Valeurs par défaut
  const initialFormState = {
    cin: '', nom: '', prenom: '', dateNaissance: '',
    sexe: 'HOMME' as Sexe, numTel: '', typeMutuelle: 'AUCUNE' as TypeMutuelle,
  };
  const [formData, setFormData] = useState(initialFormState);

  // --- 1. Charger les patients ---
  const fetchPatients = async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const res = await axios.get(API_URL, { params: { secretaireId: user.id } });
      setPatients(res.data);
      setErrorMsg(null);
    } catch (error) {
      console.error("Erreur chargement patients", error);
      setErrorMsg("Impossible de charger la liste des patients.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [user]);

  // --- 2. Sauvegarder (Création ou Modif) ---
  const handleSavePatient = async () => {
    if (!user?.id) return;
    try {
      if (editingPatient) {
        // UPDATE
        const res = await axios.put(`${API_URL}/${editingPatient.id}`, formData);
        setPatients(prev => prev.map(p => p.id === editingPatient.id ? res.data : p));
      } else {
        // CREATE
        // On envoie le secretaireId en paramètre pour lier au cabinet
        const res = await axios.post(API_URL, formData, { params: { secretaireId: user.id } });
        setPatients(prev => [...prev, res.data]);
      }
      setIsModalOpen(false);
      setErrorMsg(null);
    } catch (error: any) {
      console.error("Erreur sauvegarde", error);
      // Afficher message d'erreur du backend (ex: validation)
      const msg = error.response?.data?.message || JSON.stringify(error.response?.data) || "Erreur lors de l'enregistrement";
      alert(msg); 
    }
  };

  // --- 3. Supprimer ---
  const handleDeletePatient = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setPatients(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Erreur suppression", error);
      alert("Impossible de supprimer ce patient.");
    }
  };

  // --- Logique UI existante ---
  const filteredPatients = patients.filter(p => 
    p.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.cin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateAge = (dateString: string) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const handleOpenModal = (patient?: Patient) => {
    if (patient) {
      setEditingPatient(patient);
      setFormData({
        cin: patient.cin, nom: patient.nom, prenom: patient.prenom,
        dateNaissance: patient.dateNaissance, sexe: patient.sexe,
        numTel: patient.numTel, typeMutuelle: patient.typeMutuelle,
      });
    } else {
      setEditingPatient(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout role={user.role} navItems={navItems} userName={user.nom + ' ' + user.prenom} >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Gestion des Patients</h1>
            <p className="text-muted-foreground">{patients.length} patients enregistrés</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par CIN ou nom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="hero" onClick={() => handleOpenModal()}>
              <Plus className="w-4 h-4" /> Nouveau patient
            </Button>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-lg flex gap-2 items-center">
            <AlertCircle className="w-5 h-5"/> {errorMsg}
          </div>
        )}

        {/* Patients Table */}
        <Card variant="glass">
          <CardContent className="p-0">
            {isLoading ? (
               <div className="p-8 flex justify-center text-muted-foreground">
                 <Loader2 className="animate-spin mr-2"/> Chargement...
               </div>
            ) : filteredPatients.length === 0 ? (
               <div className="p-8 text-center text-muted-foreground">Aucun patient trouvé.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Patient</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">CIN</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Âge</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Téléphone</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Mutuelle</th>
                      <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((patient, index) => (
                      <motion.tr
                        key={patient.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              patient.sexe === 'HOMME' ? 'bg-primary/20' : 'bg-accent/20'
                            }`}>
                              <UserIcon className={`w-5 h-5 ${patient.sexe === 'HOMME' ? 'text-primary' : 'text-accent'}`} />
                            </div>
                            <div>
                              <span className="font-medium text-foreground">{patient.prenom} {patient.nom}</span>
                              <p className="text-xs text-muted-foreground">{patient.sexe === 'HOMME' ? 'Homme' : 'Femme'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6"><span className="px-2 py-1 rounded-lg bg-secondary text-sm font-mono">{patient.cin}</span></td>
                        <td className="py-4 px-6 text-muted-foreground">{calculateAge(patient.dateNaissance)} ans</td>
                        <td className="py-4 px-6"><span className="flex items-center gap-1 text-muted-foreground"><Phone className="w-3 h-3" />{patient.numTel}</span></td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            patient.typeMutuelle === 'AUCUNE' ? 'bg-destructive/20 text-destructive' : 'bg-success/20 text-success'
                          }`}>{patient.typeMutuelle}</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewingPatient(patient)}><Eye className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenModal(patient)}><Edit className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeletePatient(patient.id)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingPatient ? 'Modifier le patient' : 'Nouveau patient'}
          size="lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-2">CIN *</label><Input value={formData.cin} onChange={e => setFormData(prev => ({...prev, cin: e.target.value}))} placeholder="AB123456" /></div>
            <div><label className="block text-sm font-medium mb-2">Téléphone</label><Input value={formData.numTel} onChange={e => setFormData(prev => ({...prev, numTel: e.target.value}))} placeholder="+212..." /></div>
            <div><label className="block text-sm font-medium mb-2">Prénom *</label><Input value={formData.prenom} onChange={e => setFormData(prev => ({...prev, prenom: e.target.value}))} /></div>
            <div><label className="block text-sm font-medium mb-2">Nom *</label><Input value={formData.nom} onChange={e => setFormData(prev => ({...prev, nom: e.target.value}))} /></div>
            <div><label className="block text-sm font-medium mb-2">Date de naissance *</label><Input type="date" value={formData.dateNaissance} onChange={e => setFormData(prev => ({...prev, dateNaissance: e.target.value}))} /></div>
            <div>
              <label className="block text-sm font-medium mb-2">Sexe *</label>
              <select value={formData.sexe} onChange={e => setFormData(prev => ({...prev, sexe: e.target.value as Sexe}))} className="w-full h-10 px-3 rounded-xl bg-input border border-border">
                <option value="HOMME">Masculin</option>
                <option value="FEMME">Féminin</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Mutuelle</label>
              <select value={formData.typeMutuelle} onChange={e => setFormData(prev => ({...prev, typeMutuelle: e.target.value as TypeMutuelle}))} className="w-full h-10 px-3 rounded-xl bg-input border border-border">
                <option value="AUCUNE">Aucune</option>
                <option value="CNSS">CNSS</option>
                <option value="CNOPS">CNOPS</option>
                <option value="AMO">AMO</option>
                <option value="PRIVEE">Privée</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button variant="hero" onClick={handleSavePatient}>
              {editingPatient ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </Modal>

        {/* View Modal (inchangé ou presque) */}
        <Modal isOpen={!!viewingPatient} onClose={() => setViewingPatient(null)} title="Détails" size="md">
            {viewingPatient && (
              <div className="space-y-4">
                 <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                        <UserIcon className="w-8 h-8 text-primary"/>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">{viewingPatient.prenom} {viewingPatient.nom}</h3>
                        <p className="text-muted-foreground">{viewingPatient.cin}</p>
                    </div>
                 </div>
                 {/* ... autres détails ... */}
              </div>
            )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}