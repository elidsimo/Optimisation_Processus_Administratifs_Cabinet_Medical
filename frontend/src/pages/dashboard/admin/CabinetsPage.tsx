import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Power,
  MapPin,
  Phone,
  Stethoscope,
  LayoutDashboard,
  Users,
  Pill,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Modal } from '@/components/shared/Modal';
import { useLocalStorage } from '@/hooks/useLocalStorage';

type User = {
  id: number;
  nom: string;
  prenom: string;
  role: 'ADMIN' | 'MEDECIN' | 'SECRETAIRE';
};

const API_URL = 'http://localhost:8080/api/admin/cabinets';

const navItems = [
  { href: '/dashboard/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/admin/cabinets', label: 'Cabinets', icon: Building2 },
  { href: '/dashboard/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
  { href: '/dashboard/admin/medicaments', label: 'Médicaments', icon: Pill },
];

const specialites = [
  { value: 'GENERALISTE', label: 'Généraliste' },
  { value: 'CARDIOLOGUE', label: 'Cardiologue' },
  { value: 'DERMATOLOGUE', label: 'Dermatologue' },
  { value: 'PEDIATRE', label: 'Pédiatre' },
  { value: 'OPHTALMOLOGUE', label: 'Ophtalmologue' },
  { value: 'NEUROLOGUE', label: 'Neurologue' },
  { value: 'PSYCHIATRE', label: 'Psychiatre' },
  { value: 'GYNECOLOGUE', label: 'Gynécologue' },
  { value: 'UROLOGUE', label: 'Urologue' },
  { value: 'ORTHOPEDISTE', label: 'Orthopédiste' },
];



export default function CabinetsPage() {
  
  const [cabinets, setCabinets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [user] = useLocalStorage('user', null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCabinet, setEditingCabinet] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    specialite: 'GENERALISTE',
    adresse: '',
    tel: '',
    logoFile: null,     // Le fichier File object (pour l'envoi)
    logoPreview: ''     // L'URL temporaire (pour la prévisualisation)
  });
  // --- Chargement initial ---
  const fetchCabinets = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setCabinets(response.data);
      setError(null);
    } catch (err) {
      console.error("Erreur chargement cabinets", err);
      setError("Impossible de charger les cabinets. Vérifiez que le backend est lancé.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCabinets();
  }, []);

  // --- Handlers (CRUD) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Utilisation de FormData car on envoie un fichier + du texte
    const data = new FormData();
    data.append('nom', formData.nom);
    data.append('specialite', formData.specialite);
    data.append('adresse', formData.adresse);
    data.append('tel', formData.tel);
    
    // On ajoute le fichier seulement s'il a été changé/sélectionné
    if (formData.logoFile) {
      data.append('logo', formData.logoFile);
    }

    try {
      if (editingCabinet) {
        // UPDATE (PUT)
        await axios.put(`${API_URL}/${editingCabinet.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // CREATE (POST)
        await axios.post(API_URL, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      // Recharger la liste et fermer
      fetchCabinets();
      closeModal();
    } catch (err) {
      console.error("Erreur sauvegarde", err);
      alert("Une erreur est survenue lors de l'enregistrement.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce cabinet ?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        // Mise à jour optimiste de l'UI
        setCabinets(cabinets.filter(c => c.id !== id));
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  const toggleStatus = async (id) => {
    try {
      await axios.patch(`${API_URL}/${id}/status`);
      // Mise à jour locale pour éviter un rechargement complet
      setCabinets(cabinets.map(c => 
        c.id === id ? { ...c, estActif: !c.estActif } : c
      ));
    } catch (err) {
      alert("Impossible de changer le statut");
    }
  };

  const handleEdit = (cabinet) => {
    setEditingCabinet(cabinet);
    setFormData({
      nom: cabinet.nom,
      specialite: cabinet.specialite,
      adresse: cabinet.adresse,
      tel: cabinet.tel,
      logoFile: null, // On ne pré-remplit pas le fichier input
      logoPreview: cabinet.logoUrl || '' // On affiche l'image existante du backend
    });
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setEditingCabinet(null);
    setFormData({ 
      nom: '', 
      specialite: 'GENERALISTE', 
      adresse: '', 
      tel: '', 
      logoFile: null, 
      logoPreview: '' 
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCabinet(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Créer une URL temporaire pour la prévisualisation immédiate
      const previewUrl = URL.createObjectURL(file);
      setFormData({ 
        ...formData, 
        logoFile: file, 
        logoPreview: previewUrl 
      });
    }
  };
  // --- Filtrage ---
  const filteredCabinets = cabinets.filter(cabinet =>
    cabinet.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cabinet.adresse.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // --- Rendu ---
  return (
    <DashboardLayout role={user.role} navItems={navItems} userName={user.nom + ' ' + user.prenom}>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Gestion des Cabinets</h1>
            <p className="text-muted-foreground">Créez et gérez les cabinets médicaux</p>
          </div>
          <Button onClick={openNewModal} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouveau Cabinet
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un cabinet (nom, adresse)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 text-destructive flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
           <div className="flex justify-center items-center py-20">
             <Loader2 className="w-10 h-10 animate-spin text-primary" />
           </div>
        ) : (
          /* Cabinets Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCabinets.map((cabinet, index) => (
              <motion.div
                key={cabinet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card variant="glass" className="h-full hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                          {/* Affichage Logo */}
                          {cabinet.logoUrl ? (
                            <div className="w-12 h-12 rounded-xl relative overflow-hidden border border-border">
                              <img
                                src={cabinet.logoUrl}
                                alt={`${cabinet.nom} logo`}
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-secondary`}>
                              <Building2 className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                          
                        <div>
                          <CardTitle className="text-base">{cabinet.nom}</CardTitle>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            cabinet.estActif 
                              ? 'bg-green-500/10 text-green-600' 
                              : 'bg-red-500/10 text-red-600'
                          }`}>
                            {cabinet.estActif ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Stethoscope className="w-4 h-4 text-primary" />
                      <span>{specialites.find(s => s.value === cabinet.specialite)?.label || cabinet.specialite}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                      <span>{cabinet.adresse}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 text-primary" />
                      <span>{cabinet.tel}</span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-border/50 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 hover:bg-primary/5 hover:text-primary"
                        onClick={() => handleEdit(cabinet)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Modifier
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="px-3 hover:bg-yellow-500/10 hover:text-yellow-600"
                        onClick={() => toggleStatus(cabinet.id)}
                        title={cabinet.estActif ? "Désactiver" : "Activer"}
                      >
                        <Power className={`w-4 h-4 ${cabinet.estActif ? 'text-yellow-600' : 'text-green-600'}`} />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="px-3 hover:bg-red-500/10 hover:text-red-600 hover:border-red-200"
                        onClick={() => handleDelete(cabinet.id)}
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredCabinets.length === 0 && (
          <div className="text-center py-12 bg-secondary/20 rounded-xl border border-dashed border-border">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Aucun cabinet trouvé</p>
            <Button variant="link" onClick={openNewModal}>Créer le premier cabinet</Button>
          </div>
        )}

        {/* Modal Formulaire */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingCabinet ? 'Modifier le cabinet' : 'Nouveau cabinet'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nom du cabinet
              </label>
              <Input
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Ex: Cabinet Cardiologie Centre"
                required
              />
            </div>
            
            {/* Gestion Image */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Logo (image)
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="cursor-pointer file:text-foreground"
              />
              {formData.logoPreview && (
                <div className="mt-3 flex items-center justify-center p-2 border border-border rounded-lg bg-secondary/20">
                  <img
                    src={formData.logoPreview}
                    alt="Aperçu"
                    className="max-h-32 object-contain"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Spécialité
              </label>
              <select
                value={formData.specialite}
                onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {specialites.map(spec => (
                  <option key={spec.value} value={spec.value}>{spec.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Adresse
              </label>
              <Input
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                placeholder="Ex: 123 Bd Mohammed V, Casablanca"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Téléphone
              </label>
              <Input
                value={formData.tel}
                onChange={(e) => setFormData({ ...formData, tel: e.target.value })}
                placeholder="Ex: 05 22 12 34 56"
                required
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <Button type="button" variant="ghost" onClick={closeModal} className="flex-1">
                Annuler
              </Button>
              <Button type="submit" className="flex-1">
                {editingCabinet ? 'Enregistrer les modifications' : 'Créer le cabinet'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}