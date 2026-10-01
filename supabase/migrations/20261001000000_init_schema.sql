-- ============================================================
-- SYNDICCITE — MIGRATION INITIALE SUPABASE LOCAL
-- ============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLE DES SECTEURS
CREATE TABLE IF NOT EXISTS public.secteurs (
    id TEXT PRIMARY KEY,
    nom TEXT NOT NULL,
    responsable TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLE DES PROPRIÉTAIRES
CREATE TABLE IF NOT EXISTS public.proprietaires (
    id TEXT PRIMARY KEY,
    nom TEXT NOT NULL,
    tel TEXT,
    email TEXT,
    lot TEXT NOT NULL,
    ilot TEXT,
    secteur_id TEXT REFERENCES public.secteurs(id) ON DELETE SET NULL,
    statut TEXT DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif', 'archive')),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLE DES ACTIVITÉS & COTISATIONS
CREATE TABLE IF NOT EXISTS public.activites (
    id TEXT PRIMARY KEY,
    nom TEXT NOT NULL,
    icone TEXT DEFAULT '💼',
    montant NUMERIC(12, 2) NOT NULL DEFAULT 0,
    periodicite TEXT DEFAULT 'mensuel' CHECK (periodicite IN ('mensuel', 'trimestriel', 'semestriel', 'annuel', 'ponctuel')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABLE DES PAIEMENTS
CREATE TABLE IF NOT EXISTS public.paiements (
    id TEXT PRIMARY KEY,
    proprietaire_id TEXT NOT NULL REFERENCES public.proprietaires(id) ON DELETE CASCADE,
    activite_id TEXT NOT NULL REFERENCES public.activites(id) ON DELETE RESTRICT,
    montant NUMERIC(12, 2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    statut TEXT NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'valide', 'rejete')),
    valide_par TEXT,
    mode_paiement TEXT DEFAULT 'Mobile Money',
    reference TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABLE DES PROFILS UTILISATEURS
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nom TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'proprietaire' CHECK (role IN ('admin', 'responsable', 'proprietaire')),
    secteur_id TEXT REFERENCES public.secteurs(id) ON DELETE SET NULL,
    proprietaire_id TEXT REFERENCES public.proprietaires(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TRIGGER UPDATED_AT
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_paiements_updated ON public.paiements;
CREATE TRIGGER on_paiements_updated
    BEFORE UPDATE ON public.paiements
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 8. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.secteurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proprietaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paiements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique des secteurs" ON public.secteurs FOR SELECT USING (true);
CREATE POLICY "Gestion des secteurs par admin" ON public.secteurs FOR ALL USING (true);

CREATE POLICY "Lecture publique des proprietaires" ON public.proprietaires FOR SELECT USING (true);
CREATE POLICY "Gestion des proprietaires" ON public.proprietaires FOR ALL USING (true);

CREATE POLICY "Lecture des activites" ON public.activites FOR SELECT USING (true);
CREATE POLICY "Gestion des activites" ON public.activites FOR ALL USING (true);

CREATE POLICY "Lecture des paiements" ON public.paiements FOR SELECT USING (true);
CREATE POLICY "Creation de paiements" ON public.paiements FOR INSERT WITH CHECK (true);
CREATE POLICY "Modification et validation de paiements" ON public.paiements FOR UPDATE USING (true);

CREATE POLICY "Lecture des profils" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Gestion des profils" ON public.profiles FOR ALL USING (true);
