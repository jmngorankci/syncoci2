import { Secteur, Proprietaire, Activite, Paiement } from '@/types/database';

export const INITIAL_SECTEURS: Secteur[] = [
  { id: 'S1', nom: 'Secteur A — Nord', responsable: 'Kofi Asante' },
  { id: 'S2', nom: 'Secteur B — Sud', responsable: 'Fatou Diallo' },
  { id: 'S3', nom: 'Secteur C — Est', responsable: 'Jean-Pierre Bamba' },
  { id: 'S4', nom: 'Secteur D — Ouest', responsable: 'Aïcha Touré' },
];

export const INITIAL_PROPRIETAIRES: Proprietaire[] = [
  { id: 'P001', nom: 'Kouamé Brou', tel: '07 12 34 56', email: 'k.brou@mail.ci', lot: 'A01', ilot: '1', secteur_id: 'S1', statut: 'actif' },
  { id: 'P002', nom: 'Marie-Claire Yao', tel: '05 98 76 54', email: 'mc.yao@mail.ci', lot: 'A02', ilot: '1', secteur_id: 'S1', statut: 'actif' },
  { id: 'P003', nom: 'Ibrahim Coulibaly', tel: '07 65 43 21', email: 'i.coulibaly@mail.ci', lot: 'A03', ilot: '2', secteur_id: 'S1', statut: 'actif' },
  { id: 'P004', nom: 'Estelle Gnangoran', tel: '05 11 22 33', email: 'e.gnangoran@mail.ci', lot: 'B01', ilot: '3', secteur_id: 'S2', statut: 'actif' },
  { id: 'P005', nom: 'Barthélemy Konan', tel: '07 44 55 66', email: 'b.konan@mail.ci', lot: 'B02', ilot: '3', secteur_id: 'S2', statut: 'actif' },
  { id: 'P006', nom: 'Sylvie Ouattara', tel: '07 77 88 99', email: 's.ouattara@mail.ci', lot: 'C01', ilot: '4', secteur_id: 'S3', statut: 'actif' },
  { id: 'P007', nom: 'Daouda Traoré', tel: '05 33 44 55', email: 'd.traore@mail.ci', lot: 'C02', ilot: '4', secteur_id: 'S3', statut: 'actif' },
  { id: 'P008', nom: 'Nadège Akoto', tel: '07 66 77 88', email: 'n.akoto@mail.ci', lot: 'D01', ilot: '5', secteur_id: 'S4', statut: 'actif' },
  { id: 'P009', nom: 'Roger Kassi', tel: '05 22 33 44', email: 'r.kassi@mail.ci', lot: 'D02', ilot: '5', secteur_id: 'S4', statut: 'actif' },
  { id: 'P010', nom: 'Amina Sanogo', tel: '07 55 66 77', email: 'a.sanogo@mail.ci', lot: 'D03', ilot: '6', secteur_id: 'S4', statut: 'actif' },
  { id: 'P011', nom: 'Yves N\'Goran', tel: '05 88 99 00', email: 'y.ngoran@mail.ci', lot: 'A04', ilot: '2', secteur_id: 'S1', statut: 'actif' },
  { id: 'P012', nom: 'Cécile Abouo', tel: '07 23 45 67', email: 'c.abouo@mail.ci', lot: 'B03', ilot: '3', secteur_id: 'S2', statut: 'actif' },
];

export const INITIAL_ACTIVITES: Activite[] = [
  { id: 'ACT1', nom: 'Gardiennage', icone: '🛡️', montant: 5000, periodicite: 'mensuel', description: 'Service de sécurité 24h/24 et contrôle des accès' },
  { id: 'ACT2', nom: 'Entretien espaces verts', icone: '🌿', montant: 3000, periodicite: 'mensuel', description: 'Tonte, arrosage régulier, élagage et aménagement' },
  { id: 'ACT3', nom: 'Ramassage ordures', icone: '🗑️', montant: 2000, periodicite: 'mensuel', description: 'Collecte bi-hebdomadaire des déchets ménagers' },
  { id: 'ACT4', nom: 'Éclairage public', icone: '💡', montant: 1500, periodicite: 'mensuel', description: 'Maintenance et consommation électrique voirie' },
  { id: 'ACT5', nom: 'Entretien voirie', icone: '🛣️', montant: 4000, periodicite: 'trimestriel', description: 'Réfection et nettoyage des voies internes' },
  { id: 'ACT6', nom: 'Piscine commune', icone: '🏊', montant: 3500, periodicite: 'mensuel', description: 'Entretien et traitement chimique de la piscine' },
];

export const INITIAL_PAIEMENTS: Paiement[] = [
  { id: 'PAY001', proprietaire_id: 'P001', activite_id: 'ACT1', montant: 5000, date: '2025-01-15', statut: 'valide', valide_par: 'Kofi Asante', mode_paiement: 'Mobile Money (Orange)', reference: 'OM-20250115-01', note: 'Règlement janvier' },
  { id: 'PAY002', proprietaire_id: 'P001', activite_id: 'ACT2', montant: 3000, date: '2025-01-15', statut: 'valide', valide_par: 'Kofi Asante', mode_paiement: 'Mobile Money (Orange)', reference: 'OM-20250115-02', note: '' },
  { id: 'PAY003', proprietaire_id: 'P002', activite_id: 'ACT1', montant: 5000, date: '2025-01-20', statut: 'valide', valide_par: 'Kofi Asante', mode_paiement: 'Virement bancaire', reference: 'VIR-00912', note: '' },
  { id: 'PAY004', proprietaire_id: 'P003', activite_id: 'ACT1', montant: 5000, date: '2025-01-22', statut: 'en_attente', valide_par: undefined, mode_paiement: 'Mobile Money (MTN)', reference: 'MOMO-48190', note: 'Paiement effectué via kiosque' },
  { id: 'PAY005', proprietaire_id: 'P004', activite_id: 'ACT1', montant: 5000, date: '2025-01-18', statut: 'valide', valide_par: 'Fatou Diallo', mode_paiement: 'Espèces', reference: 'REC-004', note: 'Reçu manuel délivré' },
  { id: 'PAY006', proprietaire_id: 'P005', activite_id: 'ACT3', montant: 2000, date: '2025-01-25', statut: 'en_attente', valide_par: undefined, mode_paiement: 'Wave', reference: 'WV-7721-09', note: '' },
  { id: 'PAY007', proprietaire_id: 'P006', activite_id: 'ACT1', montant: 5000, date: '2025-01-19', statut: 'valide', valide_par: 'Jean-Pierre Bamba', mode_paiement: 'Mobile Money (Orange)', reference: 'OM-99201', note: '' },
  { id: 'PAY008', proprietaire_id: 'P001', activite_id: 'ACT3', montant: 2000, date: '2025-02-05', statut: 'en_attente', valide_par: undefined, mode_paiement: 'Mobile Money (Orange)', reference: 'OM-20250205-01', note: 'Cotisation ordures février' },
  { id: 'PAY009', proprietaire_id: 'P008', activite_id: 'ACT1', montant: 5000, date: '2025-02-01', statut: 'rejete', valide_par: 'Aïcha Touré', mode_paiement: 'Chèque', reference: 'CHQ-5510', note: 'Chèque sans provision retourné' },
  { id: 'PAY010', proprietaire_id: 'P009', activite_id: 'ACT2', montant: 3000, date: '2025-02-10', statut: 'en_attente', valide_par: undefined, mode_paiement: 'Espèces', reference: 'REC-019', note: 'Reçu provisoire remis au gardien' },
];
