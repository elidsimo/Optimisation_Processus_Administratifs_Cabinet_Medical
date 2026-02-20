import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Search, Edit, Trash2, LayoutDashboard, Building2, Pill, Shield, Stethoscope, ClipboardList, Loader2 } from 'lucide-react';
import axios from 'axios';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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

type UserRole = 'ADMIN' | 'MEDECIN' | 'SECRETAIRE';

type Cabinet = {
  id: number;
  nom: string;
};

type Utilisateur = {
  id: number;
  login: string;
  nom: string;
  prenom: string;
  numTel: string;
  role: UserRole;
  cabinetId?: number;
  cabinetNom?: string;
};

// Configuration API
const api = axios.create({
  baseURL: 'http://localhost:8080/api/admin'
});

const navItems = [
  { href: '/dashboard/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/admin/cabinets', label: 'Cabinets', icon: Building2 },
  { href: '/dashboard/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
  { href: '/dashboard/admin/medicaments', label: 'Médicaments', icon: Pill },
];

const rolesConfig: { value: UserRole; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'ADMIN', label: 'Administrateur', icon: Shield, color: 'text-success' },
  { value: 'MEDECIN', label: 'Médecin', icon: Stethoscope, color: 'text-accent' },
  { value: 'SECRETAIRE', label: 'Secrétaire', icon: ClipboardList, color: 'text-primary' },
];

export default function UtilisateursPage() {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user] = useLocalStorage('user', null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Utilisateur | null>(null);
  
  const [formData, setFormData] = useState({
    login: '',
    nom: '',
    prenom: '',
    numTel: '',
    role: 'SECRETAIRE' as UserRole,
    password: '',
    cabinetId: 0, 
  });


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersRes, cabinetsRes] = await Promise.all([
        api.get<Utilisateur[]>('/utilisateurs'),
        api.get<Cabinet[]>('/cabinet')
      ]);
      setUtilisateurs(usersRes.data);
      setCabinets(cabinetsRes.data);
    } catch (error) {
      console.error("Erreur de chargement des données:", error);
      alert("Impossible de connecter au serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation basique
    if ((formData.role === 'MEDECIN' || formData.role === 'SECRETAIRE') && !formData.cabinetId) {
      alert("Veuillez sélectionner un cabinet pour ce rôle.");
      return;
    }

    try {
      const payload = {
        login: formData.login,
        nom: formData.nom,
        prenom: formData.prenom,
        numTel: formData.numTel,
        role: formData.role,
        password: formData.password, // Vide si pas de changement en edit
        cabinetId: formData.cabinetId > 0 ? formData.cabinetId : null
      };

      if (editingUser) {
        // UPDATE
        const response = await api.put<Utilisateur>(`/utilisateurs/${editingUser.id}`, payload);
        setUtilisateurs(prev => prev.map(u => u.id === editingUser.id ? response.data : u));
      } else {
        // CREATE
        const response = await api.post<Utilisateur>('/utilisateurs', payload);
        setUtilisateurs(prev => [...prev, response.data]);
      }
      closeModal();
    } catch (error: any) {
      console.error("Erreur sauvegarde:", error);
      alert(error.response?.data?.message || "Une erreur est survenue lors de l'enregistrement.");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      try {
        await api.delete(`/utilisateurs/${id}`);
        setUtilisateurs(prev => prev.filter(u => u.id !== id));
      } catch (error) {
        console.error("Erreur suppression:", error);
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const openNewModal = () => {
    setEditingUser(null);
    setFormData({
      login: '',
      nom: '',
      prenom: '',
      numTel: '',
      role: 'SECRETAIRE',
      password: '',
      cabinetId: cabinets.length > 0 ? cabinets[0].id : 0,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (userToEdit: Utilisateur) => {
    setEditingUser(userToEdit);
    setFormData({
      login: userToEdit.login,
      nom: userToEdit.nom,
      prenom: userToEdit.prenom,
      numTel: userToEdit.numTel,
      role: userToEdit.role,
      password: '', // On ne récupère jamais le mot de passe du serveur
      cabinetId: userToEdit.cabinetId || (cabinets.length > 0 ? cabinets[0].id : 0),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const filteredUsers = utilisateurs.filter(u => {
    const matchesSearch = 
      u.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.login.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleInfo = (role: UserRole) => rolesConfig.find(r => r.value === role);

  return (
    <DashboardLayout role={user.role} navItems={navItems} userName={user.nom + ' ' + user.prenom}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Gestion des Utilisateurs</h1>
            <p className="text-muted-foreground">Gérez les accès Administrateurs, Médecins et Secrétaires</p>
          </div>
          <Button onClick={openNewModal} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouvel Utilisateur
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, prénom ou login..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Button 
              variant={filterRole === 'ALL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterRole('ALL')}
            >
              Tous
            </Button>
            {rolesConfig.map(role => (
              <Button
                key={role.value}
                variant={filterRole === role.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterRole(role.value)}
                className="gap-1 whitespace-nowrap"
              >
                <role.icon className="w-4 h-4" />
                {role.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <Card variant="glass">
          <CardContent className="p-0">
            {isLoading ? (
               <div className="flex items-center justify-center py-12">
                 <Loader2 className="w-8 h-8 animate-spin text-primary" />
                 <span className="ml-2 text-muted-foreground">Chargement...</span>
               </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-muted-foreground">Identité</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Login / Rôle</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Détails</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((userItem, index) => {
                      const roleInfo = getRoleInfo(userItem.role);
                      return (
                        <motion.tr
                          key={userItem.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                                userItem.role === 'ADMIN' ? 'from-success to-success/60' :
                                userItem.role === 'MEDECIN' ? 'from-accent to-accent/60' :
                                'from-primary to-primary/60'
                              } flex items-center justify-center text-white font-bold`}>
                                {userItem.prenom[0]}{userItem.nom[0]}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{userItem.prenom} {userItem.nom}</p>
                                <p className="text-xs text-muted-foreground">{userItem.numTel}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium">{userItem.login}</p>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  userItem.role === 'ADMIN' ? 'bg-success/20 text-success' :
                                  userItem.role === 'MEDECIN' ? 'bg-accent/20 text-accent' :
                                  'bg-primary/20 text-primary'
                                }`}>
                                  {roleInfo && <roleInfo.icon className="w-3 h-3" />}
                                  {roleInfo?.label}
                                </span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {userItem.cabinetNom ? (
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    {userItem.cabinetNom}
                                </div>
                            ) : (
                                userItem.role === 'ADMIN' ? <span className="opacity-50">Accès global</span> : <span className="text-warning">Non assigné</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleEdit(userItem)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDelete(userItem.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Empty State */}
        {!isLoading && filteredUsers.length === 0 && (
          <div className="text-center py-12 bg-secondary/20 rounded-xl">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
          </div>
        )}

        {/* Modal Création / Édition */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Prénom</label>
                <Input
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  placeholder="Prénom"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nom</label>
                <Input
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Nom"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Login (Identifiant)</label>
                <Input
                  value={formData.login}
                  onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                  placeholder="Nom d'utilisateur"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {editingUser ? 'Nouveau mot de passe (Laisser vide si inchangé)' : 'Mot de passe'}
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingUser ? "••••••••" : "Mot de passe requis"}
                  required={!editingUser} // Requis seulement à la création
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Téléphone</label>
                <Input
                  value={formData.numTel}
                  onChange={(e) => setFormData({ ...formData, numTel: e.target.value })}
                  placeholder="+212 6..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Rôle</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-foreground"
                  disabled={!!editingUser} // Souvent on interdit de changer le rôle en édition à cause de l'héritage JPA
                >
                  {rolesConfig.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
                {editingUser && <p className="text-xs text-muted-foreground mt-1">Le rôle ne peut pas être modifié après création.</p>}
              </div>
            </div>

            {/* Sélection du cabinet (Conditionnel) */}
            {(formData.role === 'MEDECIN' || formData.role === 'SECRETAIRE') && (
              <div className="bg-secondary/30 p-4 rounded-xl border border-border/50">
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Cabinet d'affectation
                </label>
                {cabinets.length > 0 ? (
                    <select
                        value={formData.cabinetId}
                        onChange={(e) => setFormData({ ...formData, cabinetId: Number(e.target.value) })}
                        className="w-full h-10 px-3 rounded-xl border border-input bg-background text-foreground"
                        required
                    >
                        <option value={0} disabled>-- Sélectionner un cabinet --</option>
                        {cabinets.map(cabinet => (
                        <option key={cabinet.id} value={cabinet.id}>{cabinet.nom}</option>
                        ))}
                    </select>
                ) : (
                    <div className="text-destructive text-sm">
                        Aucun cabinet disponible. Veuillez d'abord créer un cabinet.
                    </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-border mt-2">
              <Button type="button" variant="outline" onClick={closeModal} className="flex-1">
                Annuler
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {editingUser ? 'Sauvegarder les modifications' : 'Créer l\'utilisateur'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}