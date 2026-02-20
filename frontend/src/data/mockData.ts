import type { Patient, RendezVous, Consultation, Facture, Medicament, DossierMedical, Cabinet, Utilisateur, Notification } from '@/types';

// Mock Patients
export const mockPatients: Patient[] = [
  { id: 1, cin: 'AB123456', nom: 'Alami', prenom: 'Ahmed', dateNaissance: new Date('1985-03-15'), sexe: 'MASCULIN', numTel: '+212 6 12 34 56 78', typeMutuelle: 'CNSS', cabinetId: 1 },
  { id: 2, cin: 'CD789012', nom: 'Benali', prenom: 'Fatima', dateNaissance: new Date('1990-07-22'), sexe: 'FEMININ', numTel: '+212 6 23 45 67 89', typeMutuelle: 'CNOPS', cabinetId: 1 },
  { id: 3, cin: 'EF345678', nom: 'Tazi', prenom: 'Mohamed', dateNaissance: new Date('1978-11-08'), sexe: 'MASCULIN', numTel: '+212 6 34 56 78 90', typeMutuelle: 'AMO', cabinetId: 1 },
  { id: 4, cin: 'GH901234', nom: 'Rami', prenom: 'Khadija', dateNaissance: new Date('1995-01-30'), sexe: 'FEMININ', numTel: '+212 6 45 67 89 01', typeMutuelle: 'MUTUELLE_PRIVEE', cabinetId: 1 },
  { id: 5, cin: 'IJ567890', nom: 'Kadiri', prenom: 'Youssef', dateNaissance: new Date('1982-09-12'), sexe: 'MASCULIN', numTel: '+212 6 56 78 90 12', typeMutuelle: 'AUCUNE', cabinetId: 1 },
  { id: 6, cin: 'KL234567', nom: 'Fassi', prenom: 'Nadia', dateNaissance: new Date('1988-05-25'), sexe: 'FEMININ', numTel: '+212 6 67 89 01 23', typeMutuelle: 'CNSS', cabinetId: 1 },
  { id: 7, cin: 'MN890123', nom: 'Chraibi', prenom: 'Omar', dateNaissance: new Date('1975-12-03'), sexe: 'MASCULIN', numTel: '+212 6 78 90 12 34', typeMutuelle: 'CNOPS', cabinetId: 1 },
  { id: 8, cin: 'OP456789', nom: 'Hajji', prenom: 'Amina', dateNaissance: new Date('1992-08-17'), sexe: 'FEMININ', numTel: '+212 6 89 01 23 45', typeMutuelle: 'AMO', cabinetId: 1 },
];

// Mock Rendez-vous
export const mockRendezVous: RendezVous[] = [
  { id: 1, dateRdv: new Date('2025-12-25T09:00:00'), motif: 'Contrôle tension', statut: 'PLANIFIE', notes: '', patientId: 1, medecinId: 1, patient: mockPatients[0] },
  { id: 2, dateRdv: new Date('2025-12-25T09:30:00'), motif: 'Consultation de suivi', statut: 'EN_COURS', notes: '', patientId: 2, medecinId: 1, patient: mockPatients[1] },
  { id: 3, dateRdv: new Date('2025-12-25T10:00:00'), motif: 'Douleurs thoraciques', statut: 'PLANIFIE', notes: 'Urgent', patientId: 3, medecinId: 1, patient: mockPatients[2] },
  { id: 4, dateRdv: new Date('2025-12-25T10:30:00'), motif: 'Première visite', statut: 'PLANIFIE', notes: '', patientId: 4, medecinId: 1, patient: mockPatients[3] },
  { id: 5, dateRdv: new Date('2025-12-25T11:00:00'), motif: 'Résultats analyses', statut: 'PLANIFIE', notes: '', patientId: 5, medecinId: 1, patient: mockPatients[4] },
  { id: 6, dateRdv: new Date('2025-12-26T09:00:00'), motif: 'Grippe', statut: 'PLANIFIE', notes: '', patientId: 6, medecinId: 1, patient: mockPatients[5] },
  { id: 7, dateRdv: new Date('2025-12-24T14:00:00'), motif: 'Diabète suivi', statut: 'TERMINE', notes: '', patientId: 7, medecinId: 1, patient: mockPatients[6] },
  { id: 8, dateRdv: new Date('2025-12-24T15:00:00'), motif: 'Contrôle annuel', statut: 'TERMINE', notes: '', patientId: 8, medecinId: 1, patient: mockPatients[7] },
];

// Mock Dossiers Médicaux
export const mockDossiersMedicaux: DossierMedical[] = [
  { id: 1, antMedicaux: 'Hypertension artérielle depuis 2015', antChirurg: 'Appendicectomie 2010', allergies: 'Pénicilline', dateCreation: new Date('2020-01-15'), patientId: 1 },
  { id: 2, antMedicaux: 'Diabète type 2', antChirurg: 'Aucun', allergies: 'Aucune', dateCreation: new Date('2021-03-22'), patientId: 2 },
  { id: 3, antMedicaux: 'Asthme', antChirurg: 'Fracture bras 2018', allergies: 'Aspirine, Iode', dateCreation: new Date('2019-06-10'), patientId: 3 },
  { id: 4, antMedicaux: 'Aucun', antChirurg: 'Aucun', allergies: 'Aucune', dateCreation: new Date('2023-01-05'), patientId: 4 },
  { id: 5, antMedicaux: 'Hypothyroïdie', antChirurg: 'Cholécystectomie 2020', allergies: 'Sulfamides', dateCreation: new Date('2022-08-18'), patientId: 5 },
];

// Mock Consultations
export const mockConsultations: Consultation[] = [
  { id: 1, typeConsultation: 'SUIVI', dateConsultation: new Date('2025-12-24'), examenClinique: 'TA: 14/9, Poids: 75kg', diagnostic: 'Hypertension contrôlée', observations: 'Continuer traitement actuel', rendezVousId: 7, dossierId: 1 },
  { id: 2, typeConsultation: 'CONTROLE', dateConsultation: new Date('2025-12-24'), examenClinique: 'Glycémie: 1.2g/L', diagnostic: 'Diabète équilibré', observations: 'Maintenir régime', rendezVousId: 8, dossierId: 2 },
  { id: 3, typeConsultation: 'PREMIERE_VISITE', dateConsultation: new Date('2025-12-23'), examenClinique: 'Examen normal', diagnostic: 'Grippe saisonnière', observations: 'Repos et hydratation', dossierId: 3 },
];

// Mock Factures
export const mockFactures: Facture[] = [
  { id: 1, montant: 300, modePaiement: 'ESPECES', statut: 'PAYEE', consultationId: 1, secretaireId: 1 },
  { id: 2, montant: 250, modePaiement: 'CARTE', statut: 'PAYEE', consultationId: 2, secretaireId: 1 },
  { id: 3, montant: 200, modePaiement: 'ESPECES', statut: 'EN_ATTENTE', consultationId: 3, secretaireId: 1 },
];

// Mock Médicaments
export const mockMedicaments: Medicament[] = [
  { id: 1, nomCommercial: 'Doliprane', dosage: '1000mg', forme: 'Comprimé' },
  { id: 2, nomCommercial: 'Amoxicilline', dosage: '500mg', forme: 'Gélule' },
  { id: 3, nomCommercial: 'Ventoline', dosage: '100µg', forme: 'Spray' },
  { id: 4, nomCommercial: 'Metformine', dosage: '850mg', forme: 'Comprimé' },
  { id: 5, nomCommercial: 'Amlodipine', dosage: '5mg', forme: 'Comprimé' },
  { id: 6, nomCommercial: 'Oméprazole', dosage: '20mg', forme: 'Gélule' },
  { id: 7, nomCommercial: 'Levothyrox', dosage: '50µg', forme: 'Comprimé' },
  { id: 8, nomCommercial: 'Aspegic', dosage: '100mg', forme: 'Sachet' },
  { id: 9, nomCommercial: 'Kardégic', dosage: '75mg', forme: 'Sachet' },
  { id: 10, nomCommercial: 'Crestor', dosage: '10mg', forme: 'Comprimé' },
  { id: 11, nomCommercial: 'Inexium', dosage: '40mg', forme: 'Comprimé' },
  { id: 12, nomCommercial: 'Tahor', dosage: '20mg', forme: 'Comprimé' },
  { id: 13, nomCommercial: 'Spasfon', dosage: '80mg', forme: 'Comprimé' },
  { id: 14, nomCommercial: 'Augmentin', dosage: '1g', forme: 'Sachet' },
  { id: 15, nomCommercial: 'Dafalgan', dosage: '500mg', forme: 'Comprimé' },
];

// Mock Cabinets
export const mockCabinets: Cabinet[] = [
  { id: 1, nom: 'Cabinet Cardiologie Centre' ,logo:'/public/7.png', specialite: 'CARDIOLOGUE', adresse: '123 Bd Mohammed V, Casablanca', tel: '+212 5 22 12 34 56', estActif: true, adminId: 1 },
  { id: 2, nom: 'Cabinet Pédiatrie Rabat', logo:'/public/7.png', specialite: 'PEDIATRE', adresse: '45 Av Hassan II, Rabat', tel: '+212 5 37 23 45 67', estActif: true, adminId: 1 },
  { id: 3, nom: 'Cabinet Dermatologie Marrakech', logo:'/public/7.png', specialite: 'DERMATOLOGUE', adresse: '78 Rue Moulay Rachid, Marrakech', tel: '+212 5 24 34 56 78', estActif: false, adminId: 1 },
  { id: 4, nom: 'Cabinet Ophtalmologie Fès', logo:'/public/7.png', specialite: 'OPHTALMOLOGUE', adresse: '12 Av Mohammed VI, Fès', tel: '+212 5 35 45 67 89', estActif: true, adminId: 1 },
  { id: 5, nom: 'Cabinet Médecine Générale', logo:'/public/7.png', specialite: 'GENERALISTE', adresse: '56 Rue Atlas, Tanger', tel: '+212 5 39 56 78 90', estActif: true, adminId: 1 },
];

// Mock Utilisateurs
export const mockUtilisateurs: Utilisateur[] = [
  { id: 1, login: 'admin@medicabinet.ma', nom: 'Admin', prenom: 'Principal', numTel: '+212 6 00 00 00 00', role: 'ADMIN' },
  { id: 2, login: 'dr.amrani@medicabinet.ma', nom: 'Amrani', prenom: 'Hassan', numTel: '+212 6 11 11 11 11', role: 'MEDECIN' },
  { id: 3, login: 'sarah.martin@medicabinet.ma', nom: 'Martin', prenom: 'Sarah', numTel: '+212 6 22 22 22 22', role: 'SECRETAIRE' },
  { id: 4, login: 'dr.bennani@medicabinet.ma', nom: 'Bennani', prenom: 'Salma', numTel: '+212 6 33 33 33 33', role: 'MEDECIN' },
  { id: 5, login: 'fatima.zohra@medicabinet.ma', nom: 'Zohra', prenom: 'Fatima', numTel: '+212 6 44 44 44 44', role: 'SECRETAIRE' },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  { id: 1, message: 'Nouveau patient enregistré: Ahmed Alami', dateTimeEnvoi: new Date('2025-12-25T08:30:00'), lu: false, secretaireId: 3 },
  { id: 2, message: 'RDV annulé: Fatima Benali à 14:00', dateTimeEnvoi: new Date('2025-12-25T08:15:00'), lu: false, secretaireId: 3 },
  { id: 3, message: 'Facture en attente de validation', dateTimeEnvoi: new Date('2025-12-25T07:45:00'), lu: true, secretaireId: 3 },
];

// Helper functions
export const getPatientById = (id: number) => mockPatients.find(p => p.id === id);
export const getPatientByCin = (cin: string) => mockPatients.find(p => p.cin.toLowerCase() === cin.toLowerCase());
export const searchPatients = (query: string) => mockPatients.filter(p => 
  p.nom.toLowerCase().includes(query.toLowerCase()) || 
  p.prenom.toLowerCase().includes(query.toLowerCase()) ||
  p.cin.toLowerCase().includes(query.toLowerCase())
);
export const getDossierByPatientId = (patientId: number) => mockDossiersMedicaux.find(d => d.patientId === patientId);
export const getConsultationsByDossierId = (dossierId: number) => mockConsultations.filter(c => c.dossierId === dossierId);
export const getRdvByPatientId = (patientId: number) => mockRendezVous.filter(r => r.patientId === patientId);
