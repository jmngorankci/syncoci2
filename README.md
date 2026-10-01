# SyndicCité — Application Next.js & Supabase de Gestion de Copropriété

Application moderne pour la gestion d'un syndic de copropriétaires, réécrite avec **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Lucide Icons** et connectée à **Supabase** (PostgreSQL, RLS et Temps Réel).

---

## 🌟 Fonctionnalités Principales

### 1. Profil Administrateur (Syndic)
- **Tableau de bord 360°** : Total encaissé, paiements en attente, taux de recouvrement, copropriétaires actifs, progression par secteur.
- **Gestion des Copropriétaires** : Recherche multi-critères (nom, lot, îlot, téléphone), filtre par secteur, ajout de copropriétaire, fiches détaillées.
- **Gestion des Secteurs** : Visualisation des secteurs (Nord, Sud, Est, Ouest), responsables désignés, lots rattachés, création de secteur.
- **Activités & Cotisations** : Paramétrage des montants, périodicités (mensuel, trimestriel, etc.), icônes, modification et création.
- **Paiements** : Filtrage par statut (*Tous, En attente, Validés, Rejetés*), validation et rejet direct en 1 clic.
- **Rapports Financiers** : Répartition analytique par activité et par secteur avec graphiques de progression.

### 2. Profil Responsable de Secteur
- **Tableau de bord sectoriel** : Statistiques et encaissements de son secteur assigné.
- **Validation des paiements** : File de validation prioritaire avec détails des justificatifs (mode de paiement, référence transaction, notes).
- **Mon Secteur** : Liste complète des copropriétaires du secteur avec suivi des statuts de cotisation.

### 3. Profil Copropriétaire
- **Espace résident personnalisé** : Synthèse de ses versements, alertes sur cotisations dues.
- **Paiement de cotisations** : Formulaire interactif avec sélection d'activité, modes de règlement (*Mobile Money Orange/MTN, Wave, Virement, Espèces, Chèque*), référence et remarques.
- **Historique complet** : Consultation des quittances certifiées et statuts en temps réel.
- **Fiche profil** : Coordonnées, lot, îlot, et responsable de secteur rattaché.

---

## 🚀 Démarrage Rapide

### 1. Installation des dépendances
```bash
npm install
```

### 2. Lancement en mode développement
```bash
npm run dev
```
Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 🗄️ Configuration de la Base de Données Supabase

Le projet inclut un mode double :
1. **Mode Démo Réactif** (par défaut) : fonctionne immédiatement sans configuration avec persistance locale et données d'exemple.
2. **Mode Supabase Live** : synchronisation directe avec votre base de données PostgreSQL dans le cloud.

### Pour connecter votre projet Supabase :

1. Créez un projet sur [Supabase](https://supabase.com).
2. Rendez-vous dans le **SQL Editor** de Supabase et exécutez le script complet situé dans :
   [`supabase/schema.sql`](file:///c:/Antigravity/synco2/supabase/schema.sql)
3. Créez ou modifiez le fichier `.env.local` à la racine :
```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-publique-anon
```
4. Relancez l'application (`npm run dev`). L'indicateur passera automatiquement au vert (**Supabase Live Connected**).
5. Vous pouvez également cliquer sur le bouton **"Peupler la base Supabase"** dans l'interface pour insérer les données d'initialisation en 1 clic.

---

## 🔑 Comptes de Démonstration (1-Clic)

L'écran de connexion propose des raccourcis instantanés pour tester chaque rôle :

| Rôle | Utilisateur test | Identifiant rapide |
|------|------------------|---------------------|
| **Administrateur** | Syndic Admin | `admin` |
| **Responsable A** | Kofi Asante (Secteur Nord) | `Kofi` |
| **Responsable B** | Fatou Diallo (Secteur Sud) | `Fatou` |
| **Copropriétaire** | Kouamé Brou (Lot A01) | `A01` |
| **Copropriétaire** | Marie-Claire Yao (Lot A02) | `A02` |

---

## 📁 Architecture du Code Source

```
synco2/
├── src/
│   ├── app/
│   │   ├── globals.css          # Thème Tailwind et styles typographiques
│   │   ├── layout.tsx           # Layout racine avec polices et AuthProvider
│   │   └── page.tsx             # Page principale avec routage par onglets
│   ├── components/
│   │   ├── Navbar.tsx           # Header avec sélecteur de rôle et statut Supabase
│   │   ├── LoginScreen.tsx      # Page d'authentification avec accès démo 1-clic
│   │   ├── admin/               # Vues Administrateur (Dashboard, Lots, Secteurs, etc.)
│   │   ├── responsable/         # Vues Responsable (Dashboard, Validations, Secteur)
│   │   ├── proprietaire/        # Vues Copropriétaire (Dashboard, Formulaire, Historique)
│   │   └── modals/              # Fenêtres modales de création, modification et config Supabase
│   ├── context/
│   │   └── AuthContext.tsx      # Gestion de session et permutation de rôle
│   ├── lib/
│   │   ├── initialData.ts       # Données de démonstration initiales
│   │   └── supabase/client.ts   # Client Supabase avec détection d'environnement
│   ├── services/
│   │   └── dataService.ts       # Couche d'accès aux données unifiée (Supabase / Local)
│   └── types/
│       └── database.ts          # Typages TypeScript (Secteur, Proprietaire, Activite, etc.)
├── supabase/
│   └── schema.sql               # Script SQL PostgreSQL complet (Tables, RLS, Triggers, Seed)
├── .env.example                 # Modèle de variables d'environnement
└── package.json                 # Dépendances Next.js 14, Supabase, Tailwind, Lucide
```
