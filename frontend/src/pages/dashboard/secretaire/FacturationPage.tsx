import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { LayoutDashboard, Users, Calendar, FileText, Search, CheckCircle2, XCircle, Printer, CreditCard, Banknote, Building2, User, Eye, Loader2 } from 'lucide-react';
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

type StatutFacture = 'PAYEE' | 'EN_ATTENTE' | 'ANNULEE';
type ModePaiement = 'ESPECES' | 'CARTE' | 'CHEQUE' | 'VIREMENT' | 'ASSURANCE';

interface FactureDTO {
  id: number;
  montant: number;
  statut: StatutFacture;
  modePaiement: ModePaiement | null;
  consultationId: number;
  dateConsultation: string;
  patientNom: string;
  patientPrenom: string;
  patientCin: string;
}

const navItems = [
  { href: '/dashboard/secretaire', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/secretaire/patients', label: 'Patients', icon: Users },
  { href: '/dashboard/secretaire/rendez-vous', label: 'Rendez-vous', icon: Calendar },
  { href: '/dashboard/secretaire/facturation', label: 'Facturation', icon: FileText },
];

export default function FacturationPage() {
  // États
  const [factures, setFactures] = useState<FactureDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [user] = useLocalStorage('user', null);
  
  // États Modales
  const [viewingFacture, setViewingFacture] = useState<FactureDTO | null>(null);
  const [paymentModal, setPaymentModal] = useState<FactureDTO | null>(null);
  const [selectedModePaiement, setSelectedModePaiement] = useState<ModePaiement>('ESPECES');
  
  const printRef = useRef<HTMLDivElement>(null);
  const API_URL = 'http://localhost:8080/api/secretaire/factures';

 
  useEffect(() => {
    fetchFactures();
  }, []);

  const fetchFactures = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<FactureDTO[]>(API_URL);
      setFactures(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des factures:", error);
      // Optionnel : Ajouter un toast d'erreur ici
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidatePayment = async () => {
    if (!paymentModal) return;
    try {
      // Appel API PUT
      const response = await axios.put(`${API_URL}/${paymentModal.id}/payer`, {
        modePaiement: selectedModePaiement
      });

      // Mise à jour optimiste de l'UI avec la réponse du serveur
      setFactures(prev => prev.map(f => 
        f.id === paymentModal.id ? response.data : f
      ));
      setPaymentModal(null);
    } catch (error) {
      console.error("Erreur lors du paiement:", error);
      alert("Erreur lors de la validation du paiement.");
    }
  };

  const handleCancelFacture = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette facture ?')) {
      try {
        const response = await axios.put(`${API_URL}/${id}/annuler`);
        setFactures(prev => prev.map(f => 
          f.id === id ? response.data : f
        ));
      } catch (error) {
        console.error("Erreur annulation:", error);
        alert("Impossible d'annuler la facture.");
      }
    }
  };

  const getStatusColor = (statut: StatutFacture) => {
    switch (statut) {
      case 'PAYEE': return 'bg-green-500/20 text-green-600';
      case 'EN_ATTENTE': return 'bg-yellow-500/20 text-yellow-600';
      case 'ANNULEE': return 'bg-red-500/20 text-red-600';
      default: return 'bg-secondary text-foreground';
    }
  };

  const getStatusLabel = (statut: StatutFacture) => {
    switch (statut) {
      case 'PAYEE': return 'Payée';
      case 'EN_ATTENTE': return 'En attente';
      case 'ANNULEE': return 'Annulée';
      default: return statut;
    }
  };

  const getModePaiementIcon = (mode: ModePaiement | null) => {
    switch (mode) {
      case 'CARTE': return <CreditCard className="w-4 h-4" />;
      case 'ESPECES': return <Banknote className="w-4 h-4" />;
      case 'CHEQUE': return <FileText className="w-4 h-4" />;
      case 'VIREMENT': return <Building2 className="w-4 h-4" />;
      default: return null;
    }
  };

  // --- FILTRAGE ---
  const filteredFactures = factures.filter(f => {
    const fullName = `${f.patientPrenom} ${f.patientNom}`.toLowerCase();
    const cin = f.patientCin ? f.patientCin.toLowerCase() : '';
    const search = searchQuery.toLowerCase();

    const matchesSearch = !searchQuery || fullName.includes(search) || cin.includes(search);
    const matchesStatus = filterStatus === 'all' || f.statut === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // --- IMPRESSION ---
  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const printWindow = window.open('', '', 'height=600,width=800');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Facture #${viewingFacture?.id}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
                .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #00d4ff; padding-bottom: 20px; }
                .header h1 { color: #00d4ff; margin: 0; }
                .info-row { display: flex; justify-content: space-between; margin-bottom: 20px; }
                .info-box { background: #f9f9f9; padding: 20px; border-radius: 8px; width: 45%; }
                .total { font-size: 28px; font-weight: bold; text-align: right; margin-top: 40px; color: #000; }
                .footer { margin-top: 60px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
                .badge { padding: 5px 10px; border-radius: 4px; font-weight: bold; background: #eee; }
              </style>
            </head>
            <body>${printContent}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const stats = {
    total: factures.length,
    payees: factures.filter(f => f.statut === 'PAYEE').length,
    enAttente: factures.filter(f => f.statut === 'EN_ATTENTE').length,
    // total payé (somme)
    montantTotal: factures
      .filter(f => f.statut === 'PAYEE')
      .reduce((sum, f) => sum + f.montant, 0),
  };

  return (
    <DashboardLayout role={user.role} navItems={navItems} userName={user.nom + ' ' + user.prenom} >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Gestion de la Facturation
            </h1>
            <p className="text-muted-foreground">
              {stats.enAttente} factures en attente de validation
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
                  placeholder="Rechercher par patient (Nom, Prénom ou CIN)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-10 px-3 rounded-xl bg-input border border-border text-foreground outline-none focus:ring-2 ring-primary/20"
              >
                <option value="all">Tous les statuts</option>
                <option value="EN_ATTENTE">En attente</option>
                <option value="PAYEE">Payée</option>
                <option value="ANNULEE">Annulée</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Factures Table */}
        <Card variant="glass">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/20">
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">N° Facture</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Patient</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Date Consult.</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Montant</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Mode</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Statut</th>
                      <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFactures.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-muted-foreground">
                          Aucune facture trouvée.
                        </td>
                      </tr>
                    ) : (
                      filteredFactures.map((facture, index) => (
                        <motion.tr
                          key={facture.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <span className="font-mono text-foreground font-semibold">
                              FAC-{String(facture.id).padStart(4, '0')}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <User className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-foreground">
                                  {facture.patientPrenom} {facture.patientNom}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {facture.patientCin}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-muted-foreground">
                            {facture.dateConsultation 
                              ? new Date(facture.dateConsultation).toLocaleDateString('fr-FR')
                              : '-'}
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-bold text-foreground text-lg">
                              {facture.montant.toFixed(2)} DH
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            {facture.statut === 'PAYEE' ? (
                              <span className="flex items-center gap-2 text-sm text-foreground/80">
                                {getModePaiementIcon(facture.modePaiement)}
                                <span className="capitalize">
                                  {facture.modePaiement?.replace('_', ' ').toLowerCase()}
                                </span>
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-sm italic">-</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(facture.statut)}`}>
                              {getStatusLabel(facture.statut)}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 hover:text-primary hover:bg-primary/10" 
                                onClick={() => setViewingFacture(facture)}
                                title="Voir détails"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              
                              {facture.statut === 'EN_ATTENTE' && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
                                    onClick={() => setPaymentModal(facture)}
                                    title="Valider paiement"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                                    onClick={() => handleCancelFacture(facture.id)}
                                    title="Annuler facture"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              
                              {facture.statut === 'PAYEE' && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-blue-500 hover:bg-blue-100"
                                  onClick={() => { 
                                    setViewingFacture(facture); 
                                    // Petit délai pour laisser le modal s'ouvrir avant d'imprimer
                                    setTimeout(handlePrint, 300); 
                                  }}
                                  title="Imprimer"
                                >
                                  <Printer className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Modal */}
        <Modal
          isOpen={!!paymentModal}
          onClose={() => setPaymentModal(null)}
          title="Valider le paiement"
          size="sm"
        >
          {paymentModal && (
            <div className="space-y-6">
              <div className="text-center p-6 rounded-2xl bg-secondary/30 border border-border">
                <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">Montant à encaisser</p>
                <p className="font-display text-4xl font-bold text-primary">
                  {paymentModal.montant.toFixed(2)} <span className="text-xl text-muted-foreground">DH</span>
                </p>
                <p className="text-sm text-foreground mt-2 font-medium">
                  {paymentModal.patientPrenom} {paymentModal.patientNom}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  Mode de règlement
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['ESPECES', 'CARTE_BANCAIRE', 'CHEQUE', 'VIREMENT'] as ModePaiement[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setSelectedModePaiement(mode)}
                      className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 text-sm font-medium ${
                        selectedModePaiement === mode 
                          ? 'border-primary bg-primary/10 text-primary shadow-sm' 
                          : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-secondary/50'
                      }`}
                    >
                      {getModePaiementIcon(mode)}
                      {mode.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
                <Button variant="outline" onClick={() => setPaymentModal(null)}>
                  Annuler
                </Button>
                <Button variant="hero" onClick={handleValidatePayment}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirmer le paiement
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* View Facture Modal (Détails & Impression) */}
        <Modal
          isOpen={!!viewingFacture}
          onClose={() => setViewingFacture(null)}
          title="Détails de la facture"
          size="md"
        >
          {viewingFacture && (
            <>
              {/* Contenu caché pour l'impression, visible dans la modale */}
              <div ref={printRef} className="bg-white text-black p-4 rounded-lg">
                <div className="header">
                  <h1>Cabinet {user.nom_cabinet}</h1>
                  <p className="text-sm text-gray-500">Facture N° FAC-{String(viewingFacture.id).padStart(4, '0')}</p>
                </div>
                
                <div className="info-row">
                  <div className="info-box">
                    <h3 className="font-bold border-b border-gray-300 mb-2 pb-1">Patient</h3>
                    <p><span className="font-semibold">Nom:</span> {viewingFacture.patientNom}</p>
                    <p><span className="font-semibold">Prénom:</span> {viewingFacture.patientPrenom}</p>
                    <p><span className="font-semibold">CIN:</span> {viewingFacture.patientCin || 'N/A'}</p>
                  </div>
                  <div className="info-box">
                    <h3 className="font-bold border-b border-gray-300 mb-2 pb-1">Détails</h3>
                    <p>
                      <span className="font-semibold">Date:</span>{' '}
                      {viewingFacture.dateConsultation 
                        ? new Date(viewingFacture.dateConsultation).toLocaleDateString('fr-FR') 
                        : '-'}
                    </p>
                    <p>
                      <span className="font-semibold">Statut:</span>{' '}
                      {getStatusLabel(viewingFacture.statut)}
                    </p>
                    {viewingFacture.modePaiement && (
                      <p><span className="font-semibold">Paiement:</span> {viewingFacture.modePaiement.replace('_', ' ')}</p>
                    )}
                  </div>
                </div>

                <div className="total">
                  Total TTC: {viewingFacture.montant.toFixed(2)} DH
                </div>

                <div className="footer">
                  <p>{user.nom_cabinet} - Gestion de Cabinet Médical</p>
                  <p>Merci de votre confiance.</p>
                </div>
              </div>

              {/* Boutons d'action du Modal */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
                 <div className="text-sm text-muted-foreground">
                    ID Technique: {viewingFacture.id}
                 </div>
                 <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setViewingFacture(null)}>
                      Fermer
                    </Button>
                    {viewingFacture.statut === 'PAYEE' && (
                      <Button variant="default" onClick={handlePrint}>
                        <Printer className="w-4 h-4 mr-2" />
                        Imprimer le reçu
                      </Button>
                    )}
                 </div>
              </div>
            </>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}