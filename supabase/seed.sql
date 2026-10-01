-- ============================================================
-- SYNDICCITE — DONNEES SEED INITIALES SUPABASE LOCAL
-- ============================================================

-- Secteurs
INSERT INTO public.secteurs (id, nom, responsable) VALUES
('S1', 'Secteur A — Nord', 'Kofi Asante'),
('S2', 'Secteur B — Sud', 'Fatou Diallo'),
('S3', 'Secteur C — Est', 'Jean-Pierre Bamba'),
('S4', 'Secteur D — Ouest', 'Aïcha Touré')
ON CONFLICT (id) DO UPDATE SET nom = EXCLUDED.nom, responsable = EXCLUDED.responsable;

-- Propriétaires
INSERT INTO public.proprietaires (id, nom, tel, email, lot, ilot, secteur_id, statut) VALUES
('P001', 'Kouamé Brou', '07 12 34 56', 'k.brou@mail.ci', 'A01', '1', 'S1', 'actif'),
('P002', 'Marie-Claire Yao', '05 98 76 54', 'mc.yao@mail.ci', 'A02', '1', 'S1', 'actif'),
('P003', 'Ibrahim Coulibaly', '07 65 43 21', 'i.coulibaly@mail.ci', 'A03', '2', 'S1', 'actif'),
('P004', 'Estelle Gnangoran', '05 11 22 33', 'e.gnangoran@mail.ci', 'B01', '3', 'S2', 'actif'),
('P005', 'Barthélemy Konan', '07 44 55 66', 'b.konan@mail.ci', 'B02', '3', 'S2', 'actif'),
('P006', 'Sylvie Ouattara', '07 77 88 99', 's.ouattara@mail.ci', 'C01', '4', 'S3', 'actif'),
('P007', 'Daouda Traoré', '05 33 44 55', 'd.traore@mail.ci', 'C02', '4', 'S3', 'actif'),
('P008', 'Nadège Akoto', '07 66 77 88', 'n.akoto@mail.ci', 'D01', '5', 'S4', 'actif'),
('P009', 'Roger Kassi', '05 22 33 44', 'r.kassi@mail.ci', 'D02', '5', 'S4', 'actif'),
('P010', 'Amina Sanogo', '07 55 66 77', 'a.sanogo@mail.ci', 'D03', '6', 'S4', 'actif'),
('P011', 'Yves N''Goran', '05 88 99 00', 'y.ngoran@mail.ci', 'A04', '2', 'S1', 'actif'),
('P012', 'Cécile Abouo', '07 23 45 67', 'c.abouo@mail.ci', 'B03', '3', 'S2', 'actif')
ON CONFLICT (id) DO UPDATE SET nom = EXCLUDED.nom, tel = EXCLUDED.tel, email = EXCLUDED.email, lot = EXCLUDED.lot, ilot = EXCLUDED.ilot, secteur_id = EXCLUDED.secteur_id;

-- Activités
INSERT INTO public.activites (id, nom, icone, montant, periodicite, description) VALUES
('ACT1', 'Gardiennage', '🛡️', 5000, 'mensuel', 'Service de sécurité et gardiennage 24h/24'),
('ACT2', 'Entretien espaces verts', '🌿', 3000, 'mensuel', 'Tonte, arrosage régulier, élagage et aménagement paysager'),
('ACT3', 'Ramassage ordures', '🗑️', 2000, 'mensuel', 'Collecte bi-hebdomadaire des déchets ménagers'),
('ACT4', 'Éclairage public', '💡', 1500, 'mensuel', 'Maintenance et consommation électrique voirie'),
('ACT5', 'Entretien voirie', '🛣️', 4000, 'trimestriel', 'Réfection et nettoyage des voies internes'),
('ACT6', 'Piscine commune', '🏊', 3500, 'mensuel', 'Entretien et traitement chimique de la piscine collective')
ON CONFLICT (id) DO UPDATE SET nom = EXCLUDED.nom, icone = EXCLUDED.icone, montant = EXCLUDED.montant, periodicite = EXCLUDED.periodicite, description = EXCLUDED.description;

-- Paiements
INSERT INTO public.paiements (id, proprietaire_id, activite_id, montant, date, statut, valide_par, mode_paiement, reference, note) VALUES
('PAY001', 'P001', 'ACT1', 5000, '2025-01-15', 'valide', 'Kofi Asante', 'Mobile Money (Orange)', 'OM-20250115-01', 'Règlement janvier'),
('PAY002', 'P001', 'ACT2', 3000, '2025-01-15', 'valide', 'Kofi Asante', 'Mobile Money (Orange)', 'OM-20250115-02', ''),
('PAY003', 'P002', 'ACT1', 5000, '2025-01-20', 'valide', 'Kofi Asante', 'Virement bancaire', 'VIR-00912', ''),
('PAY004', 'P003', 'ACT1', 5000, '2025-01-22', 'en_attente', NULL, 'Mobile Money (MTN)', 'MOMO-48190', 'Paiement effectué via kiosque'),
('PAY005', 'P004', 'ACT1', 5000, '2025-01-18', 'valide', 'Fatou Diallo', 'Espèces', 'REC-004', 'Reçu manuel délivré'),
('PAY006', 'P005', 'ACT3', 2000, '2025-01-25', 'en_attente', NULL, 'Wave', 'WV-7721-09', ''),
('PAY007', 'P006', 'ACT1', 5000, '2025-01-19', 'valide', 'Jean-Pierre Bamba', 'Mobile Money (Orange)', 'OM-99201', ''),
('PAY008', 'P001', 'ACT3', 2000, '2025-02-05', 'en_attente', NULL, 'Mobile Money (Orange)', 'OM-20250205-01', 'Cotisation ordures février'),
('PAY009', 'P008', 'ACT1', 5000, '2025-02-01', 'rejete', 'Aïcha Touré', 'Chèque', 'CHQ-5510', 'Chèque sans provision retourné'),
('PAY010', 'P009', 'ACT2', 3000, '2025-02-10', 'en_attente', NULL, 'Espèces', 'REC-019', 'Reçu provisoire remis au gardien')
ON CONFLICT (id) DO NOTHING;
