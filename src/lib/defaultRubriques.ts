import { RubriqueDepense, Depense, FamilleRubrique } from '@/types/database';

export const FAMILLES_RUBRIQUES_LABELS: Record<
  FamilleRubrique,
  { label: string; badgeClass: string }
> = {
  exploitation: {
    label: 'Exploitation courante',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  maintenance: {
    label: 'Travaux & Maintenance',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  administration: {
    label: 'Gestion & Frais',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  social: {
    label: 'Vie communautaire',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
  },
  investissement: {
    label: 'Investissement / Urgence',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
  },
};

export const INITIAL_RUBRIQUES_DEPENSES: RubriqueDepense[] = [
  {
    id: 'RUB_SEC',
    nom: 'Sécurité & Gardiennage',
    icone: '🛡️',
    famille: 'exploitation',
    budget_mensuel: 0,
    statut: 'actif',
    description:
      'Salaires et prestations des vigiles, équipements de sécurité (torches, tenues, talkies), guérite et vidéosurveillance',
  },
  {
    id: 'RUB_SALUB',
    nom: 'Salubrité & Espaces Verts',
    icone: '🌿',
    famille: 'exploitation',
    budget_mensuel: 0,
    statut: 'actif',
    description:
      'Ramassage des ordures, balayage des voies, débroussaillage, tonte, curage des caniveaux et désinsectisation',
  },
  {
    id: 'RUB_ELEC',
    nom: 'Éclairage Public, Eau & Énergie',
    icone: '💡',
    famille: 'exploitation',
    budget_mensuel: 0,
    statut: 'actif',
    description:
      'Factures CIE / SODECI des parties communes, achat d’ampoules, projecteurs solaires et interventions électricien',
  },
  {
    id: 'RUB_VOIRIE',
    nom: 'Voirie, Portail & Infrastructures',
    icone: '🛣️',
    famille: 'maintenance',
    budget_mensuel: 0,
    statut: 'actif',
    description:
      'Réparation des voies (pavés, nids-de-poule, dos d’âne), portail principal, clôture, peinture bordures et plomberie',
  },
  {
    id: 'RUB_ADMIN',
    nom: 'Fonctionnement & Administration',
    icone: '📁',
    famille: 'administration',
    budget_mensuel: 0,
    statut: 'actif',
    description:
      'Impressions (reçus, notes, convocations), fournitures de bureau, communication syndic, frais Mobile Money et banque',
  },
  {
    id: 'RUB_AG_JUR',
    nom: 'Assemblées Générales & Juridique',
    icone: '⚖️',
    famille: 'administration',
    budget_mensuel: 0,
    statut: 'actif',
    description:
      'Organisation des AG (location bâches/chaises, logistique), frais d’huissier et démarches administratives (mairie, ministère)',
  },
  {
    id: 'RUB_SOCIAL',
    nom: 'Vie Sociale & Solidarité Cité',
    icone: '🤝',
    famille: 'social',
    budget_mensuel: 0,
    statut: 'actif',
    description:
      'Journées citoyennes, fêtes de la cité, arbre de Noël et actions de solidarité prévues par le règlement intérieur',
  },
  {
    id: 'RUB_INVEST',
    nom: 'Grands Travaux & Imprévus',
    icone: '🚨',
    famille: 'investissement',
    budget_mensuel: 0,
    statut: 'actif',
    description:
      'Interventions d’urgence sur sinistre et grands travaux d’investissement votés en Assemblée Générale',
  },
];

export const INITIAL_DEPENSES: Depense[] = [];

