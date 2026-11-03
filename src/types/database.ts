export type UserRole = 'admin' | 'responsable' | 'proprietaire';

export type PaiementStatut = 'en_attente' | 'valide' | 'rejete';

export type Periodicite = 'mensuel' | 'trimestriel' | 'semestriel' | 'annuel' | 'ponctuel';

export type FamilleRubrique =
  | 'exploitation'
  | 'maintenance'
  | 'administration'
  | 'social'
  | 'investissement';

export type DepenseStatut = 'en_attente' | 'valide' | 'rejete';

export interface Secteur {
  id: string;
  nom: string;
  responsable: string;
  created_at?: string;
}

export interface Proprietaire {
  id: string;
  nom: string;
  tel: string;
  email: string;
  lot: string;
  ilot: string;
  secteur_id: string;
  statut: 'actif' | 'inactif' | 'archive';
  auth_user_id?: string | null;
  created_at?: string;
}

export interface Activite {
  id: string;
  nom: string;
  icone: string;
  montant: number;
  periodicite: Periodicite;
  description: string;
  created_at?: string;
}

export interface Paiement {
  id: string;
  proprietaire_id: string;
  activite_id: string;
  montant: number;
  date: string;
  statut: PaiementStatut;
  valide_par?: string | null;
  mode_paiement?: string;
  reference?: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RubriqueDepense {
  id: string;
  nom: string;
  icone: string;
  famille: FamilleRubrique;
  budget_mensuel: number;
  statut: 'actif' | 'inactif';
  description: string;
  created_at?: string;
}

export interface Depense {
  id: string;
  rubrique_id: string;
  activite_id?: string | null;
  secteur_id?: string | null;
  libelle: string;
  montant: number;
  date: string;
  beneficiaire?: string;
  mode_paiement?: string;
  reference_piece?: string;
  statut: DepenseStatut;
  enregistre_par?: string | null;
  valide_par?: string | null;
  note?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  nom: string;
  email: string;
  role: UserRole;
  secteur_id?: string | null;
  proprietaire_id?: string | null;
  created_at?: string;
}

export interface CurrentUser {
  id: string;
  nom: string;
  email?: string;
  role: UserRole;
  secteur_id?: string | null;
  proprietaire_id?: string | null;
  initiales: string;
  lot?: string;
}
