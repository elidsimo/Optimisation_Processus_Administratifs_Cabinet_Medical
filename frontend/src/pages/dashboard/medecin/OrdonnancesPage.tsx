import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  FileText,
  Search,
  Calendar,
  Printer,
  Pill,
  Eye,
  AlertCircle
} from 'lucide-react';

// Assure-toi que ces chemins d'importation sont corrects pour ton projet
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/shared/Modal';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// --- TYPES (Correspondance exacte avec les DTOs Java) ---

interface PatientDTO {
  id: number;
  nom: string;
  prenom: string;
  cin: string;
  tel: string;
}

interface LigneOrdonnanceDTO {
  medicamentNom: string;
  medicamentDosage: string;
  medicamentForme: string;
  posologie: string;
  duree: string;
}

interface OrdonnanceDTO {
  id: number;
  dateCreation: string; // Format ISO retourné par Spring Boot
  nomMedecin: string;   // Si tu l'as ajouté dans le DTO java, sinon optionnel
  patient: PatientDTO;
  prescriptions: LigneOrdonnanceDTO[];
}

// Type pour l'utilisateur connecté (LocalStorage)
type UserSession = {
  id: number;
  nom: string;
  prenom: string;
  logo?: string;
  tel: string;
  adresse: string;
  nom_cabinet: string;
  role: 'ADMIN' | 'MEDECIN' | 'SECRETAIRE';
};

const navItems = [
  { href: '/dashboard/medecin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/medecin/patients', label: 'Patients', icon: Users },
  { href: '/dashboard/medecin/consultations', label: 'Consultations', icon: Stethoscope },
  { href: '/dashboard/medecin/ordonnances', label: 'Ordonnances', icon: FileText },
];

export default function OrdonnancesPage() {
  // --- STATES ---
  const [ordonnances, setOrdonnances] = useState<OrdonnanceDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingOrdonnance, setViewingOrdonnance] = useState<OrdonnanceDTO | null>(null);
  
  // États de chargement et d'erreur pour l'API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [user] = useLocalStorage<UserSession>('user', {
    id: 0, nom: '', prenom: '', tel: '', adresse: '', nom_cabinet: '', role: 'MEDECIN'
  });

  // --- API CALL ---
  useEffect(() => {
    fetchOrdonnances();
  }, []);

  const fetchOrdonnances = async () => {
    try {
      setLoading(true);
      // Remplace l'URL par celle de ton backend
      const response = await axios.get<OrdonnanceDTO[]>('http://localhost:8080/api/medecin/ordonnances');
      setOrdonnances(response.data);
      setError(null);
    } catch (err) {
      console.error("Erreur API:", err);
      setError("Impossible de charger les ordonnances. Vérifiez que le backend est lancé.");
    } finally {
      setLoading(false);
    }
  };

  // --- FILTRAGE ---
  const filteredOrdonnances = ordonnances.filter(ord =>
    !searchQuery || (ord.patient && 
      `${ord.patient.prenom} ${ord.patient.nom}`.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // --- IMPRESSION ---
  const handlePrint = (ordonnance: OrdonnanceDTO) => {
    const printContent = `
      <html>
        <head>
          <title>Ordonnance - ${ordonnance.patient.nom}</title>
          <style>
            body { font-family: 'Georgia', serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #00d4ff; padding-bottom: 20px; }
            .header h1 { color: #00d4ff; margin: 0; font-size: 24px; }
            .header p { margin: 5px 0; color: #666; }
            .patient-info { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 30px; }
            .ordonnance-title { font-size: 18px; font-weight: bold; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 2px; }
            .prescription { border-left: 3px solid #00d4ff; padding-left: 15px; margin-bottom: 20px; page-break-inside: avoid; }
            .prescription-name { font-weight: bold; font-size: 16px; color: #00d4ff; }
            .prescription-details { margin-top: 5px; color: #666; }
            .footer { margin-top: 60px; text-align: right; }
            .signature { border-top: 1px solid #333; width: 200px; margin-left: auto; padding-top: 10px; }
            .date { text-align: right; margin-bottom: 30px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Cabinet ${user.nom_cabinet || 'Médical'}</h1>
            <p>Dr. ${user.nom} ${user.prenom}</p>
            <p>Adresse: ${user.adresse} | Tél: ${user.tel}</p>
          </div>
          
          <p class="date">${new Date(ordonnance.dateCreation).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          <div class="patient-info">
            <strong>Patient:</strong> ${ordonnance.patient?.prenom} ${ordonnance.patient?.nom}<br>
            <strong>CIN:</strong> ${ordonnance.patient?.cin || '-'}
          </div>
          
          <p class="ordonnance-title">Ordonnance</p>
          
          ${ordonnance.prescriptions.map((p, i) => `
            <div class="prescription">
              <p class="prescription-name">${i + 1}. ${p.medicamentNom} ${p.medicamentDosage}</p>
              <p class="prescription-details">
                Forme: ${p.medicamentForme}<br>
                Posologie: ${p.posologie}<br>
                Durée: ${p.duree}
              </p>
            </div>
          `).join('')}
          
          <div class="footer">
            <p>Dr. ${user.nom} ${user.prenom}</p>
            <div class="signature">Signature</div>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '', 'height=800,width=600');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      // Petit délai pour assurer le chargement des styles avant l'impression
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <DashboardLayout role={user.role} navItems={navItems} userName={user.nom + ' ' + user.prenom} >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Ordonnances
            </h1>
            <p className="text-muted-foreground">
              {loading ? 'Chargement...' : `${ordonnances.length} ordonnances enregistrées`}
            </p>
          </div>
          <Button onClick={fetchOrdonnances} variant="outline" size="sm">
            Actualiser
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par patient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Gestion des états (Loading / Error / Data) */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des données...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 rounded-xl border border-red-200">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <p className="text-red-600 font-medium">{error}</p>
            <Button variant="outline" className="mt-4" onClick={fetchOrdonnances}>Réessayer</Button>
          </div>
        ) : filteredOrdonnances.length === 0 ? (
          <div className="text-center py-12 bg-secondary/30 rounded-xl border border-border">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Aucune ordonnance trouvée</p>
          </div>
        ) : (
          /* Liste des ordonnances */
          <div className="grid gap-4">
            {filteredOrdonnances.map((ordonnance, index) => (
              <motion.div
                key={ordonnance.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card variant="glass" className="hover-lift transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Ordonnance </p>
                          <h3 className="font-semibold text-foreground text-lg">
                            {ordonnance.patient ? `${ordonnance.patient.prenom} ${ordonnance.patient.nom}` : 'Patient inconnu'}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(ordonnance.dateCreation).toLocaleDateString('fr-FR')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Pill className="w-4 h-4" />
                              {ordonnance.prescriptions.length} médicaments
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setViewingOrdonnance(ordonnance)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Voir
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handlePrint(ordonnance)}
                        >
                          <Printer className="w-4 h-4 mr-2" />
                          Imprimer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal de visualisation */}
        <Modal
          isOpen={!!viewingOrdonnance}
          onClose={() => setViewingOrdonnance(null)}
          title="Détails de l'ordonnance"
          size="md"
        >
          {viewingOrdonnance && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Patient</h4>
                    <p className="text-foreground text-lg">
                      {viewingOrdonnance.patient?.prenom} {viewingOrdonnance.patient?.nom}
                    </p>
                    <p className="text-sm text-muted-foreground">CIN: {viewingOrdonnance.patient?.cin}</p>
                    <p className="text-sm text-muted-foreground">Tél: {viewingOrdonnance.patient?.tel}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {new Date(viewingOrdonnance.dateCreation).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Pill className="w-4 h-4" /> Prescriptions
                </h4>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {viewingOrdonnance.prescriptions.map((pres, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white dark:bg-slate-800 border-l-4 border-primary shadow-sm">
                      <p className="font-medium text-foreground">
                        {i + 1}. {pres.medicamentNom} <span className="text-muted-foreground">({pres.medicamentDosage})</span>
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                         <p className="text-muted-foreground">
                           <span className="font-semibold">Forme:</span> {pres.medicamentForme}
                         </p>
                         <p className="text-muted-foreground">
                           <span className="font-semibold">Durée:</span> {pres.duree}
                         </p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 bg-secondary/50 p-2 rounded">
                        <span className="font-semibold">Posologie:</span> {pres.posologie}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setViewingOrdonnance(null)}>
                  Fermer
                </Button>
                <Button variant="hero" onClick={() => handlePrint(viewingOrdonnance)}>
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimer
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}