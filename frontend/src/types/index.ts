export type UserRole = 'MEDECIN' | 'SECRETAIRE' | 'ADMIN';

export type Specialite = 'GENERALISTE' | 'CARDIOLOGUE' | 'DERMATOLOGUE' | 'PEDIATRE' | 'OPHTALMOLOGUE' | 'NEUROLOGUE' | 'PSYCHIATRE' | 'GYNECOLOGUE' | 'UROLOGUE' | 'ORTHOPEDISTE';

export type Sexe = 'FEMME' | 'HOMME';

export type TypeMutuelle = 'CNSS' | 'CNOPS' | 'AMO' | 'PRIVEE' | 'AUCUNE';

export type StatutRdv = 'CONFIRME' | 'EN_ATTENTE' | 'TERMINE' | 'ANNULE';

export type TypeConsultation = 'SPECIALISEE' | 'SUIVI' | 'NORMALE';

export type ModePaiement = 'ESPECES' | 'CARTE' | 'CHEQUE' | 'VIREMENT';

export type StatutFacture = 'EN_ATTENTE' | 'PAYEE' | 'ANNULEE';

export interface Utilisateur {
  id: number;
  login: string;
  nom: string;
  prenom: string;
  numTel: string;
  role: UserRole;
}

export interface Cabinet {
  id: number;
  nom: string;
  logo?: string;
  specialite: Specialite;
  adresse: string;
  tel: string;
  estActif: boolean;
  adminId: number;
}

export interface Patient {
  id: number;
  cin: string;
  nom: string;
  prenom: string;
  dateNaissance: Date;
  sexe: Sexe;
  numTel: string;
  typeMutuelle: TypeMutuelle;
  cabinetId: number;
}

export interface DossierMedical {
  id: number;
  antMedicaux: string;
  antChirurg: string;
  allergies: string;
  dateCreation: Date;
  patientId: number;
}

export interface RendezVous {
  id: number;
  dateRdv: Date;
  motif: string;
  statut: StatutRdv;
  notes: string;
  patientId: number;
  medecinId: number;
  patient?: Patient;
}

export interface Consultation {
  id: number;
  typeConsultation: TypeConsultation;
  dateConsultation: Date;
  examenClinique: string;
  diagnostic: string;
  observations: string;
  rendezVousId?: number;
  dossierId: number;
}

export interface Facture {
  id: number;
  montant: number;
  modePaiement: ModePaiement;
  statut: StatutFacture;
  consultationId: number;
  secretaireId: number;
}

export interface Medicament {
  id: number;
  nomCommercial: string;
  dosage: string;
  forme: string;
}

export interface Notification {
  id: number;
  message: string;
  dateTimeEnvoi: Date;
  lu: boolean;
  secretaireId: number;
}

