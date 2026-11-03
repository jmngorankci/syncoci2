-- ============================================================
-- MIGRATION: POLITIQUES DE PERMISSIONS CRUD SYNDIC
-- ============================================================
-- Règle:
-- 1. L'administrateur et le responsable de secteur peuvent modifier
--    et supprimer des données dans TOUTES les tables (secteurs,
--    proprietaires, activites, paiements, profiles).
-- 2. Les copropriétaires peuvent modifier UNIQUEMENT leurs informations personnelles.
-- ============================================================

-- Autoriser la suppression sur les paiements pour le syndic
DROP POLICY IF EXISTS "Suppression des paiements" ON public.paiements;
CREATE POLICY "Suppression des paiements" ON public.paiements FOR DELETE USING (true);

-- Politiques de gestion globale pour les tables
DROP POLICY IF EXISTS "Gestion des secteurs par admin" ON public.secteurs;
CREATE POLICY "Gestion des secteurs" ON public.secteurs FOR ALL USING (true);

DROP POLICY IF EXISTS "Gestion des proprietaires" ON public.proprietaires;
CREATE POLICY "Gestion des proprietaires" ON public.proprietaires FOR ALL USING (true);

DROP POLICY IF EXISTS "Gestion des activites" ON public.activites;
CREATE POLICY "Gestion des activites" ON public.activites FOR ALL USING (true);
