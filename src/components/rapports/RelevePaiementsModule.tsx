'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Secteur, Proprietaire, Activite, Paiement, CurrentUser, UserRole } from '@/types/database';
import { 
  Printer, 
  Download, 
  Calendar, 
  User, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Building2, 
  Filter, 
  ArrowRight,
  ShieldCheck,
  Search,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface RelevePaiementsModuleProps {
  currentUser?: CurrentUser | null;
  role?: UserRole;
  secteurs: Secteur[];
  proprietaires: Proprietaire[];
  activites: Activite[];
  paiements: Paiement[];
  preselectedPropId?: string | null;
}

export const RelevePaiementsModule: React.FC<RelevePaiementsModuleProps> = ({
  currentUser,
  role = 'admin',
  secteurs,
  proprietaires,
  activites,
  paiements,
  preselectedPropId,
}) => {
  const isOwner = role === 'proprietaire';
  const myPropId = currentUser?.proprietaire_id;

  // Date period state (defaults: start of current year to today)
  const todayStr = new Date().toISOString().split('T')[0];
  const currentYear = new Date().getFullYear();
  const startOfYearStr = `${currentYear}-01-01`;

  const [startDate, setStartDate] = useState<string>(startOfYearStr);
  const [endDate, setEndDate] = useState<string>(todayStr);
  const [statusFilter, setStatusFilter] = useState<'all' | 'valide' | 'en_attente'>('all');
  const [secteurFilter, setSecteurFilter] = useState<string>('all');
  const [searchOwnerQuery, setSearchOwnerQuery] = useState('');

  // Default selected owner
  const defaultPropId = useMemo(() => {
    if (preselectedPropId) return preselectedPropId;
    if (isOwner && myPropId) return myPropId;
    if (role === 'responsable' && currentUser?.secteur_id) {
      const sectProps = proprietaires.filter((p) => p.secteur_id === currentUser.secteur_id);
      if (sectProps.length > 0) return sectProps[0].id;
    }
    return proprietaires[0]?.id || '';
  }, [preselectedPropId, isOwner, myPropId, role, currentUser, proprietaires]);

  const [selectedPropId, setSelectedPropId] = useState<string>(defaultPropId);

  // Sync when preselectedPropId or defaultPropId changes
  useEffect(() => {
    if (preselectedPropId) {
      setSelectedPropId(preselectedPropId);
    } else if (defaultPropId && !selectedPropId) {
      setSelectedPropId(defaultPropId);
    }
  }, [preselectedPropId, defaultPropId, selectedPropId]);

  // Set sector filter if user is responsable
  useEffect(() => {
    if (role === 'responsable' && currentUser?.secteur_id) {
      setSecteurFilter(currentUser.secteur_id);
    }
  }, [role, currentUser]);

  // The active copropriétaire
  const currentProp = useMemo(() => {
    if (isOwner) {
      if (myPropId) {
        return proprietaires.find((p) => p.id === myPropId) || proprietaires[0];
      }
      return proprietaires[0];
    }
    return proprietaires.find((p) => p.id === selectedPropId) || proprietaires[0];
  }, [isOwner, myPropId, selectedPropId, proprietaires]);

  const currentSecteur = useMemo(() => {
    return secteurs.find((s) => s.id === currentProp?.secteur_id);
  }, [secteurs, currentProp]);

  // Selectable owners for Admin and Responsable
  const selectableOwners = useMemo(() => {
    return proprietaires.filter((p) => {
      if (secteurFilter !== 'all' && p.secteur_id !== secteurFilter) return false;
      if (searchOwnerQuery) {
        const q = searchOwnerQuery.toLowerCase();
        return (
          p.nom.toLowerCase().includes(q) ||
          p.lot.toLowerCase().includes(q) ||
          p.ilot.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          (p.email || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [proprietaires, secteurFilter, searchOwnerQuery]);

  // If filtered list changes and current selection is not inside, select the first match
  useEffect(() => {
    if (!isOwner && selectableOwners.length > 0) {
      const exists = selectableOwners.some((p) => p.id === selectedPropId);
      if (!exists) {
        setSelectedPropId(selectableOwners[0].id);
      }
    }
  }, [selectableOwners, selectedPropId, isOwner]);

  // Filtered payments for this owner and date period
  const filteredPayments = useMemo(() => {
    if (!currentProp) return [];

    return paiements
      .filter((p) => {
        if (p.proprietaire_id !== currentProp.id) return false;

        const pDate = (p.date || '').slice(0, 10);
        // Date range filtering
        if (startDate && pDate < startDate) return false;
        if (endDate && pDate > endDate) return false;

        // Status filter
        if (statusFilter !== 'all' && p.statut !== statusFilter) return false;

        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [paiements, currentProp, startDate, endDate, statusFilter]);

  // Statistics
  const totalValide = useMemo(() => {
    return filteredPayments
      .filter((p) => p.statut === 'valide')
      .reduce((sum, p) => sum + Number(p.montant), 0);
  }, [filteredPayments]);

  const totalEnAttente = useMemo(() => {
    return filteredPayments
      .filter((p) => p.statut === 'en_attente')
      .reduce((sum, p) => sum + Number(p.montant), 0);
  }, [filteredPayments]);

  const totalGlobal = useMemo(() => {
    return filteredPayments.reduce((sum, p) => sum + Number(p.montant), 0);
  }, [filteredPayments]);

  // Quick period buttons
  const setPeriodQuick = (type: 'this_month' | 'this_quarter' | 'this_year' | 'last_year' | 'all') => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');

    if (type === 'this_month') {
      setStartDate(`${y}-${m}-01`);
      setEndDate(todayStr);
    } else if (type === 'this_quarter') {
      const qMonth = Math.floor(now.getMonth() / 3) * 3 + 1;
      const qMonthStr = String(qMonth).padStart(2, '0');
      setStartDate(`${y}-${qMonthStr}-01`);
      setEndDate(todayStr);
    } else if (type === 'this_year') {
      setStartDate(`${y}-01-01`);
      setEndDate(todayStr);
    } else if (type === 'last_year') {
      setStartDate(`${y - 1}-01-01`);
      setEndDate(`${y - 1}-12-31`);
    } else if (type === 'all') {
      setStartDate('2020-01-01');
      setEndDate(todayStr);
    }
  };

  // Trigger Print to PDF
  const handlePrintPDF = () => {
    window.print();
  };

  // Export CSV function
  const handleExportCSV = () => {
    if (!currentProp || filteredPayments.length === 0) return;
    const headers = ['Date', 'Activité', 'Mode', 'Référence', 'Statut', 'Montant (FCFA)'];
    const rows = filteredPayments.map((p) => {
      const act = activites.find((a) => a.id === p.activite_id);
      return [
        p.date,
        `"${act?.nom || 'Cotisation'}"`,
        `"${p.mode_paiement || ''}"`,
        `"${p.reference || ''}"`,
        p.statut,
        p.montant,
      ].join(';');
    });
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Releve_Paiements_${(currentProp.lot || 'Lot').replace(/\s+/g, '_')}_${startDate}_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const documentRef = useMemo(() => {
    const propCode = currentProp ? (currentProp.lot || currentProp.id).replace(/\s+/g, '') : 'GEN';
    return `REL-${propCode}-${startDate.replace(/-/g, '')}-${endDate.replace(/-/g, '')}`;
  }, [currentProp, startDate, endDate]);

  return (
    <div className="space-y-6">
      {/* Module Title & Introduction (Screen Only) */}
      <div className="no-print bg-gradient-to-r from-forest-900 via-forest-800 to-forest-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Générateur d'État Comptable & Relevé Officiel</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {isOwner ? 'Mon Relevé de Situation & Cotisations' : 'Relevé des Paiements par Propriétaire (PDF)'}
            </h1>
            <p className="text-xs sm:text-sm text-forest-200 max-w-2xl leading-relaxed">
              {isOwner
                ? 'Consultez et imprimez au format PDF le relevé officiel de toutes vos cotisations acquittées et en cours sur la période de votre choix.'
                : 'Sélectionnez un copropriétaire et une période pour prévisualiser et imprimer l\'état financier officiel certifié en format PDF.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handlePrintPDF}
              className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer en format PDF</span>
            </button>

            {filteredPayments.length > 0 && (
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm border border-white/20 flex items-center gap-2 transition-all"
                title="Exporter les lignes de paiements au format CSV"
              >
                <Download className="w-4 h-4 text-emerald-300" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* Decorative blur */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Control Filters Panel (Screen Only) */}
      <div className="no-print bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 font-serif text-base font-bold text-gray-900">
            <Filter className="w-4 h-4 text-forest-700" />
            <span>Paramètres de l'État Financier</span>
          </div>
          <span className="text-xs text-gray-500">
            {isOwner ? 'Compte copropriétaire connecté' : `${selectableOwners.length} copropriétaire(s) correspondant(s)`}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* 1. Propriétaire Selector */}
          <div className="space-y-2">
            <label className="block font-bold uppercase tracking-wider text-gray-700">
              1. Copropriétaire ciblé
            </label>
            {isOwner ? (
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-forest-800 text-white font-bold flex items-center justify-center shrink-0">
                  {currentProp?.nom ? currentProp.nom.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'CP'}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-gray-900 truncate">{currentProp?.nom}</div>
                  <div className="text-[11px] text-emerald-800 font-mono font-semibold">
                    Lot {currentProp?.lot} · Îlot {currentProp?.ilot}
                  </div>
                  <div className="text-[10px] text-gray-500">{currentSecteur?.nom}</div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Sector filter for admin */}
                {role === 'admin' && (
                  <select
                    value={secteurFilter}
                    onChange={(e) => setSecteurFilter(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-gray-50/50 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">Tous les secteurs ({proprietaires.length} résidents)</option>
                    {secteurs.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nom}
                      </option>
                    ))}
                  </select>
                )}

                {/* Search query */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchOwnerQuery}
                    onChange={(e) => setSearchOwnerQuery(e.target.value)}
                    placeholder="Filtrer par nom, lot..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-gray-50/50"
                  />
                </div>

                {/* Owner dropdown */}
                <select
                  value={selectedPropId}
                  onChange={(e) => setSelectedPropId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-gray-50 font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {selectableOwners.map((p) => {
                    const s = secteurs.find((sec) => sec.id === p.secteur_id);
                    return (
                      <option key={p.id} value={p.id}>
                        Lot {p.lot} — {p.nom} ({s?.nom || 'Sans secteur'})
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>

          {/* 2. Date Range Picker */}
          <div className="space-y-2">
            <label className="block font-bold uppercase tracking-wider text-gray-700">
              2. Période auditée
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] text-gray-400 block mb-1">Du :</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 font-medium"
                />
              </div>
              <div>
                <span className="text-[11px] text-gray-400 block mb-1">Au :</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 font-medium"
                />
              </div>
            </div>

            {/* Quick shortcuts */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setPeriodQuick('this_month')}
                className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-forest-100 hover:text-forest-900 text-gray-600 text-[11px] font-medium transition-colors"
              >
                Ce mois
              </button>
              <button
                type="button"
                onClick={() => setPeriodQuick('this_quarter')}
                className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-forest-100 hover:text-forest-900 text-gray-600 text-[11px] font-medium transition-colors"
              >
                Ce trimestre
              </button>
              <button
                type="button"
                onClick={() => setPeriodQuick('this_year')}
                className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-forest-100 hover:text-forest-900 text-gray-600 text-[11px] font-medium transition-colors"
              >
                Année {currentYear}
              </button>
              <button
                type="button"
                onClick={() => setPeriodQuick('last_year')}
                className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-forest-100 hover:text-forest-900 text-gray-600 text-[11px] font-medium transition-colors"
              >
                Année {currentYear - 1}
              </button>
              <button
                type="button"
                onClick={() => setPeriodQuick('all')}
                className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-forest-100 hover:text-forest-900 text-gray-600 text-[11px] font-medium transition-colors"
              >
                Tout l'historique
              </button>
            </div>
          </div>

          {/* 3. Statut Filter & Actions */}
          <div className="space-y-2 flex flex-col justify-between">
            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">
                3. Statut des opérations
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-gray-50 font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Toutes les opérations ({filteredPayments.length})</option>
                <option value="valide">Uniquement les paiements validés</option>
                <option value="en_attente">Paiements en attente de validation</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handlePrintPDF}
              className="w-full py-2.5 px-4 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Imprimer / Enregistrer en PDF</span>
            </button>
          </div>
        </div>

        {/* Tip banner */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Astuce Impression PDF :</strong> Dans la fenêtre d'impression de votre navigateur, sélectionnez la destination <strong>« Enregistrer au format PDF »</strong> pour générer un document PDF certifié A4 prêt à être archivé ou partagé.
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DOCUMENT OFFICIEL IMPRIMABLE A4 (VISIBLE SUR ÉCRAN & CAPTURÉ EN PDF)       */}
      {/* ========================================================================= */}
      <div className="print-document bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-xl max-w-4xl mx-auto space-y-8 text-gray-900">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-6 border-b-2 border-forest-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-forest-900 text-white flex items-center justify-center shadow-md">
              <Building2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <div className="font-serif text-2xl font-bold tracking-tight text-forest-950">
                SYNDIC<span className="text-emerald-700 font-normal">CITÉ</span>
              </div>
              <div className="text-xs uppercase tracking-widest text-forest-800 font-bold">
                Résidence Les Palmiers
              </div>
              <div className="text-[11px] text-gray-500">
                Syndic de Copropriété · Abidjan, Côte d'Ivoire
              </div>
            </div>
          </div>

          <div className="sm:text-right space-y-1">
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-mono font-bold">
              RÉF: {documentRef}
            </div>
            <div className="text-xs text-gray-500">
              Émis le : {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
            <div className="text-[11px] text-gray-400">
              Système certifié SyndicCité Cloud
            </div>
          </div>
        </div>

        {/* Title of Document */}
        <div className="text-center py-4 bg-gray-50 rounded-2xl border border-gray-200">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-forest-950 uppercase tracking-wide">
            État Individuel des Cotisations & Règlements
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            Relevé de situation comptable pour la période du{' '}
            <strong className="text-gray-900 font-mono">
              {startDate ? new Date(startDate).toLocaleDateString('fr-FR') : 'Origine'}
            </strong>{' '}
            au{' '}
            <strong className="text-gray-900 font-mono">
              {endDate ? new Date(endDate).toLocaleDateString('fr-FR') : 'Aujourd\'hui'}
            </strong>
          </p>
        </div>

        {/* Identification Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Owner details */}
          <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200 space-y-2">
            <div className="text-[10px] uppercase font-bold text-forest-700 tracking-wider">
              Bénéficiaire / Copropriétaire
            </div>
            <div className="font-serif text-lg font-bold text-gray-900">{currentProp?.nom || 'Copropriétaire'}</div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <span className="text-gray-400 block text-[10px]">LOT :</span>
                <span className="font-mono font-bold text-forest-900">{currentProp?.lot ? `LOT ${currentProp.lot}` : 'Non assigné'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">ÎLOT :</span>
                <span className="font-medium text-gray-800">{currentProp?.ilot ? `Îlot ${currentProp.ilot}` : '—'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">TÉLÉPHONE :</span>
                <span className="text-gray-800">{currentProp?.tel || 'Non renseigné'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">EMAIL :</span>
                <span className="text-gray-800 truncate block">{currentProp?.email || 'Non renseigné'}</span>
              </div>
            </div>
          </div>

          {/* Sector & Syndic details */}
          <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200 space-y-2">
            <div className="text-[10px] uppercase font-bold text-forest-700 tracking-wider">
              Localisation & Référent Syndic
            </div>
            <div className="font-serif text-lg font-bold text-gray-900">
              {currentSecteur?.nom || 'Secteur Résidence'}
            </div>
            <div className="space-y-1 text-xs pt-1">
              <div>
                <span className="text-gray-400 text-[10px] block">RESPONSABLE DU SECTEUR :</span>
                <span className="font-medium text-gray-900">{currentSecteur?.responsable || 'Bureau du Syndic'}</span>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] block">NATURE DES CHARGES :</span>
                <span className="text-gray-800">Charges communes, entretien, sécurité & prestations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-600">
            <span>Détail chronologique des opérations ({filteredPayments.length} règlement{filteredPayments.length > 1 ? 's' : ''})</span>
            <span>Montant en FCFA</span>
          </div>

          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-forest-900 text-white font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Prestation / Activité</th>
                  <th className="py-3 px-4">Mode / Réf.</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400 italic">
                      Aucun versement ou cotisation enregistré pour ce copropriétaire sur la période sélectionnée.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p, idx) => {
                    const act = activites.find((a) => a.id === p.activite_id);
                    return (
                      <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="py-3 px-4 font-mono font-medium text-gray-900 whitespace-nowrap">
                          {new Date(p.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                            <span>{act?.icone || '💳'}</span>
                            <span>{act?.nom || 'Cotisation'}</span>
                          </div>
                          {p.note && <div className="text-[10px] text-gray-400 italic mt-0.5">"{p.note}"</div>}
                        </td>
                        <td className="py-3 px-4">
                          <div>{p.mode_paiement || 'Mobile Money'}</div>
                          {p.reference && (
                            <div className="font-mono text-[10px] text-gray-500">Réf: {p.reference}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.statut === 'valide'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                : p.statut === 'en_attente'
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : 'bg-red-100 text-red-900 border border-red-200'
                            }`}
                          >
                            {p.statut === 'valide' ? 'Validé' : p.statut === 'en_attente' ? 'En attente' : 'Rejeté'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-forest-900 whitespace-nowrap">
                          {Number(p.montant).toLocaleString('fr-FR')} FCFA
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Recap Box */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 space-y-4">
          <div className="text-xs uppercase font-bold text-gray-500 tracking-wider border-b border-gray-200 pb-2">
            Synthèse Financière de la Période
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200">
              <span className="text-[11px] font-bold uppercase text-forest-800 block">Total Cotisations Validées</span>
              <div className="font-serif text-2xl font-bold text-forest-950 mt-1">
                {totalValide.toLocaleString('fr-FR')} <span className="text-xs font-sans font-normal text-gray-600">FCFA</span>
              </div>
              <span className="text-[10px] text-emerald-700 mt-0.5 block">Écritures comptables acquittées</span>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200">
              <span className="text-[11px] font-bold uppercase text-amber-800 block">En Attente de Validation</span>
              <div className="font-serif text-2xl font-bold text-amber-950 mt-1">
                {totalEnAttente.toLocaleString('fr-FR')} <span className="text-xs font-sans font-normal text-gray-600">FCFA</span>
              </div>
              <span className="text-[10px] text-amber-700 mt-0.5 block">En cours de contrôle par le syndic</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-gray-300">
              <span className="text-[11px] font-bold uppercase text-gray-600 block">Volume Total Déclaré</span>
              <div className="font-serif text-2xl font-bold text-gray-900 mt-1">
                {totalGlobal.toLocaleString('fr-FR')} <span className="text-xs font-sans font-normal text-gray-600">FCFA</span>
              </div>
              <span className="text-[10px] text-gray-500 mt-0.5 block">{filteredPayments.length} opérations au total</span>
            </div>
          </div>
        </div>

        {/* Official Certification and Signature Area */}
        <div className="pt-6 border-t-2 border-gray-200 grid grid-cols-2 gap-8 text-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-forest-800 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Authenticité & Rapprochement</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Le présent relevé de situation est délivré par le Syndic de la Résidence Les Palmiers
              pour servir et valoir ce que de droit. Toutes les sommes marquées "Validé" ont été dûment
              rapprochées avec les relevés bancaires ou comptes de collecte officiels.
            </p>
            <div className="text-[10px] font-mono text-gray-400">
              Code de certification : {documentRef.split('-').slice(0, 3).join('-')}
            </div>
          </div>

          <div className="text-right space-y-4">
            <div>
              <div className="font-bold text-gray-900">Le Bureau du Syndic</div>
              <div className="text-[11px] text-gray-500">Service Comptabilité & Recouvrement</div>
            </div>

            {/* Stamp & Signature simulation box */}
            <div className="inline-block p-4 rounded-2xl border-2 border-dashed border-forest-800/40 bg-forest-50/30 text-center min-w-[200px]">
              <div className="text-[10px] font-bold uppercase text-forest-800 tracking-widest mb-1">
                Cachet du Syndic
              </div>
              <div className="text-xs font-serif italic text-forest-950 font-bold py-2">
                SyndicCité Résidence Les Palmiers
              </div>
              <div className="text-[9px] text-forest-700 font-mono">
                SIGNÉ NUMÉRIQUEMENT
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
