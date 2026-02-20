import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pill, Plus, Search, Edit, Trash2, Building2, LayoutDashboard, Users, Upload, Download } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Modal } from '@/components/shared/Modal';
import { toast } from 'sonner';
import axios from 'axios'; // N'oublie pas d'importer axios
import { useLocalStorage } from '@/hooks/useLocalStorage';

type User = {
  id: number;
  nom: string;
  prenom: string;
  role: 'ADMIN' | 'MEDECIN' | 'SECRETAIRE';
};

// Définition du type correspondant exactement à l'entité Java
type Medicament = {
  id: number;
  nomCommercial: string;
  dosage: string;
  forme: string;
};

const navItems = [
  { href: '/dashboard/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/admin/cabinets', label: 'Cabinets', icon: Building2 },
  { href: '/dashboard/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
  { href: '/dashboard/admin/medicaments', label: 'Médicaments', icon: Pill },
];

const formes = [
  'Comprimé', 'Gélule', 'Sachet', 'Spray', 'Sirop', 
  'Injectable', 'Suppositoire', 'Crème', 'Pommade', 'Gouttes'
];

// URL de ton backend Spring Boot
const API_URL = "http://localhost:8080/api/medicaments";

export default function MedicamentsPage() {
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingMedicament, setEditingMedicament] = useState<Medicament | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user] = useLocalStorage('user', null);

  const [formData, setFormData] = useState({
    nomCommercial: '',
    dosage: '',
    forme: 'Comprimé',
  });
  
  const [importData, setImportData] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 1. CHARGEMENT DES DONNÉES (READ) ---
  const fetchMedicaments = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(API_URL);
      setMedicaments(response.data);
    } catch (error) {
      console.error("Erreur chargement:", error);
      toast.error("Impossible de charger la liste des médicaments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicaments();
  }, []);

  // Filtrage local (pour éviter de rappeler le backend à chaque frappe)
  const filteredMedicaments = medicaments.filter(med =>
    med.nomCommercial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.forme.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- 2. AJOUT ET MODIFICATION (CREATE / UPDATE) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingMedicament) {
        // UPDATE (PUT)
        await axios.put(`${API_URL}/${editingMedicament.id}`, formData);
        toast.success('Médicament modifié avec succès');
      } else {
        // CREATE (POST)
        await axios.post(API_URL, formData);
        toast.success('Médicament ajouté avec succès');
      }
      
      // Rafraîchir la liste et fermer
      fetchMedicaments();
      closeModal();
      
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement du médicament");
    }
  };

  // --- 3. SUPPRESSION (DELETE) ---
  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce médicament ?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        // Mise à jour optimiste ou re-fetch
        setMedicaments(medicaments.filter(m => m.id !== id));
        toast.success('Médicament supprimé');
      } catch (error) {
        console.error(error);
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  // --- GESTION DES MODALES ---
  const handleEdit = (medicament: Medicament) => {
    setEditingMedicament(medicament);
    setFormData({
      nomCommercial: medicament.nomCommercial,
      dosage: medicament.dosage,
      forme: medicament.forme,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMedicament(null);
    setFormData({ nomCommercial: '', dosage: '', forme: 'Comprimé' });
  };

  const openNewModal = () => {
    setEditingMedicament(null);
    setFormData({ nomCommercial: '', dosage: '', forme: 'Comprimé' });
    setIsModalOpen(true);
  };

  // --- IMPORT / EXPORT ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setImportData(text);
      };
      reader.readAsText(file);
    }
  };

  const handleImport = async () => {
    if (!importData) return;

    try {
      const lines = importData.trim().split('\n');
      let successCount = 0;
      
      // On parcourt le CSV et on envoie une requête POST pour chaque ligne valide
      // Note: Pour de gros fichiers, il vaudrait mieux un endpoint backend "batch"
      const promises = lines.map(async (line, index) => {
        if (index === 0 && line.toLowerCase().includes('nom')) return; // Skip header
        
        const parts = line.split(/[,;\t]/);
        if (parts.length >= 2) {
            const newMed = {
                nomCommercial: parts[0].trim(),
                dosage: parts[1]?.trim() || 'Inconnu',
                forme: parts[2]?.trim() || 'Comprimé',
            };
            
            // Appel API pour chaque ligne
            await axios.post(API_URL, newMed);
            successCount++;
        }
      });

      await Promise.all(promises);

      if (successCount > 0) {
        toast.success(`${successCount} médicaments importés avec succès`);
        setIsImportModalOpen(false);
        setImportData('');
        fetchMedicaments(); // Rafraîchir la liste depuis la BDD
      } else {
        toast.error('Aucun médicament valide trouvé dans le fichier');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de l\'import. Vérifiez le format du fichier.');
    }
  };

  const handleExport = () => {
    const header = 'Nom Commercial,Dosage,Forme\n';
    const data = medicaments.map(m => `${m.nomCommercial},${m.dosage},${m.forme}`).join('\n');
    const blob = new Blob([header + data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'medicaments.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Liste exportée avec succès');
  };

  return (
    <DashboardLayout role={user.role} navItems={navItems} userName={user.nom + ' ' + user.prenom} >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Base de Médicaments</h1>
            <p className="text-muted-foreground">Gérez la liste des médicaments pour l'autocomplétion</p>
          </div>
          <div className="flex gap-2">
            
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="w-4 h-4" />
              Exporter
            </Button>
            <Button onClick={openNewModal} className="gap-2">
              <Plus className="w-4 h-4" />
              Ajouter
            </Button>
          </div>
        </div>

        {/* Search & Stats */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un médicament..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary">
            <Pill className="w-4 h-4" />
            <span className="font-medium">{medicaments.length} médicaments</span>
          </div>
        </div>

        {/* Liste plate de tous les médicaments */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Pill className="w-5 h-5 text-primary" />
                Tous les médicaments
                <span className="text-sm font-normal text-muted-foreground">({filteredMedicaments.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">Chargement...</div>
              ) : filteredMedicaments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredMedicaments.map((med, index) => (
                    <motion.div
                      key={med.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="group flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">{med.nomCommercial}</p>
                        <p className="text-sm text-muted-foreground">{med.dosage} · {med.forme}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(med)}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(med.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Pill className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Aucun médicament trouvé</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingMedicament ? 'Modifier le médicament' : 'Nouveau médicament'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nom commercial
              </label>
              <Input
                value={formData.nomCommercial}
                onChange={(e) => setFormData({ ...formData, nomCommercial: e.target.value })}
                placeholder="Ex: Doliprane"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Dosage
              </label>
              <Input
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="Ex: 1000mg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Forme
              </label>
              <select
                value={formData.forme}
                onChange={(e) => setFormData({ ...formData, forme: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-foreground"
              >
                {formes.map(forme => (
                  <option key={forme} value={forme}>{forme}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeModal} className="flex-1">
                Annuler
              </Button>
              <Button type="submit" className="flex-1">
                {editingMedicament ? 'Modifier' : 'Ajouter'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Import Modal */}
        <Modal
            isOpen={isImportModalOpen}
            onClose={() => { setIsImportModalOpen(false); setImportData(''); }}
            title="Importer des médicaments (CSV)"
        >
            <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Le fichier doit être au format CSV avec les colonnes : <strong>Nom, Dosage, Forme</strong>.
                </p>
                <div className="flex items-center gap-2">
                    <Input 
                        type="file" 
                        accept=".csv,.txt"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />
                </div>
                {importData && (
                    <div className="p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                        <pre>{importData.substring(0, 200)}...</pre>
                    </div>
                )}
                <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setIsImportModalOpen(false)} className="flex-1">
                        Annuler
                    </Button>
                    <Button onClick={handleImport} disabled={!importData} className="flex-1">
                        Lancer l'import
                    </Button>
                </div>
            </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}