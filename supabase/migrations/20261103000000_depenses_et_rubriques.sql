-- ============================================================
-- MIGRATION: GESTION DES DEPENSES (SORTIES DE CAISSE) & RUBRIQUES
-- ============================================================
-- Règles métier:
-- 1. Les rubriques de dépenses sont paramétrables (8 rubriques par défaut).
-- 2. Une dépense saisie par un Responsable est 'en_attente' jusqu'à validation par l'Admin.
-- 3. Visibilité réservée au Bureau du Syndic (Admin + Responsables).
-- ============================================================

-- 1. TABLE DES RUBRIQUES DE DÉPENSES
CREATE TABLE IF NOT EXISTS public.rubriques_depenses (
    id TEXT PRIMARY KEY,
    nom TEXT NOT NULL,
    icone TEXT DEFAULT '📋',
    famille TEXT NOT NULL DEFAULT 'exploitation' CHECK (famille IN ('exploitation', 'maintenance', 'administration', 'social', 'investissement')),
    budget_mensuel NUMERIC(12, 2) NOT NULL DEFAULT 0,
    statut TEXT NOT NULL DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABLE DES DÉPENSES (SORTIES DE CAISSE)
CREATE TABLE IF NOT EXISTS public.depenses (
    id TEXT PRIMARY KEY,
    rubrique_id TEXT NOT NULL REFERENCES public.rubriques_depenses(id) ON DELETE RESTRICT,
    activite_id TEXT REFERENCES public.activites(id) ON DELETE SET NULL,
    secteur_id TEXT REFERENCES public.secteurs(id) ON DELETE SET NULL,
    libelle TEXT NOT NULL,
    montant NUMERIC(12, 2) NOT NULL CHECK (montant > 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    beneficiaire TEXT,
    mode_paiement TEXT DEFAULT 'Espèces (Caisse)',
    reference_piece TEXT,
    statut TEXT NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'valide', 'rejete')),
    enregistre_par TEXT,
    valide_par TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TRIGGER DE MISE À JOUR AUTOMATIQUE DU TIMESTAMP
DROP TRIGGER IF EXISTS on_depenses_updated ON public.depenses;
CREATE TRIGGER on_depenses_updated
    BEFORE UPDATE ON public.depenses
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.rubriques_depenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.depenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lecture des rubriques_depenses" ON public.rubriques_depenses;
CREATE POLICY "Lecture des rubriques_depenses" ON public.rubriques_depenses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Gestion des rubriques_depenses" ON public.rubriques_depenses;
CREATE POLICY "Gestion des rubriques_depenses" ON public.rubriques_depenses FOR ALL USING (true);

DROP POLICY IF EXISTS "Lecture des depenses" ON public.depenses;
CREATE POLICY "Lecture des depenses" ON public.depenses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Gestion des depenses" ON public.depenses;
CREATE POLICY "Gestion des depenses" ON public.depenses FOR ALL USING (true);

-- 5. RUBRIQUES PRÉ-CONFIGURÉES PAR DÉFAUT
INSERT INTO public.rubriques_depenses (id, nom, icone, famille, budget_mensuel, statut, description) VALUES
('RUB_SEC', 'Sécurité & Gardiennage', '🛡️', 'exploitation', 0, 'actif', 'Salaires et prestations des vigiles, équipements de sécurité (torches, tenues, talkies), guérite et vidéosurveillance'),
('RUB_SALUB', 'Salubrité & Espaces Verts', '🌿', 'exploitation', 0, 'actif', 'Ramassage des ordures, balayage des voies, débroussaillage, tonte, curage des caniveaux et désinsectisation'),
('RUB_ELEC', 'Éclairage Public, Eau & Énergie', '💡', 'exploitation', 0, 'actif', 'Factures CIE / SODECI des parties communes, achat d''ampoules, projecteurs solaires et interventions électricien'),
('RUB_VOIRIE', 'Voirie, Portail & Infrastructures', '🛣️', 'maintenance', 0, 'actif', 'Réparation des voies (pavés, nids-de-poule, dos d''âne), portail principal, clôture, peinture bordures et plomberie'),
('RUB_ADMIN', 'Fonctionnement & Administration', '📁', 'administration', 0, 'actif', 'Impressions (reçus, notes, convocations), fournitures de bureau, communication syndic, frais Mobile Money et banque'),
('RUB_AG_JUR', 'Assemblées Générales & Juridique', '⚖️', 'administration', 0, 'actif', 'Organisation des AG (location bâches/chaises, logistique), frais d''huissier et démarches administratives (mairie, ministère)'),
('RUB_SOCIAL', 'Vie Sociale & Solidarité Cité', '🤝', 'social', 0, 'actif', 'Journées citoyennes, fêtes de la cité, arbre de Noël et actions de solidarité prévues par le règlement intérieur'),
('RUB_INVEST', 'Grands Travaux & Imprévus', '🚨', 'investissement', 0, 'actif', 'Interventions d''urgence sur sinistre et grands travaux d''investissement votés en Assemblée Générale')
ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    icone = EXCLUDED.icone,
    famille = EXCLUDED.famille,
    description = EXCLUDED.description;

