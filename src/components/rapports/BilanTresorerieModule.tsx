'use client';

import React, { useState, useMemo } from 'react';
import {
  Secteur,
  Proprietaire,
  Activite,
  Paiement,
  Depense,
  RubriqueDepense,
} from '@/types/database';
import { FAMILLES_RUBRIQUES_LABELS } from '@/lib/defaultRubriques';
import {
  Printer,
  Calendar,
  Building2,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  Scale,
  ShieldCheck,
} from 'lucide-react';

interface BilanTresorerieModuleProps {
  secteurs: Secteur[];
  proprietaires: Proprietaire[];
  activites: Activite[];
  paiements: Paiement[];
  depenses: Depense[];
  rubriques: RubriqueDepense[];
}

export const BilanTresorerieModule: React.FC<BilanTresorerieModuleProps> = ({
  secteurs,
  proprietaires,
  activites,
  paiements,
  depenses,
  rubriques,
}) => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const currentYear = today.getFullYear();
  const currentMonthStart = `${today.toISOString().slice(0, 7)}-01`;

  const [startDate, setStartDate] = useState<string>(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState<string>(todayStr);
  const [secteurScope, setSecteurScope] = useState<string>('all');

  const setPresetPeriod = (preset: 'month' | 'year' | 'all') => {
    if (preset === 'month') {
      setStartDate(currentMonthStart);
      setEndDate(todayStr);
    } else if (preset === 'year') {
      setStartDate(`${currentYear}-01-01`);
      setEndDate(todayStr);
    } else {
      setStartDate('2020-01-01');
      setEndDate(todayStr);
    }
  };

  // Helper: filter by sector if selected
  const sectorPropIds = useMemo(() => {
    if (secteurScope === 'all') return null;
    return new Set(proprietaires.filter((p) => p.secteur_id === secteurScope).map((p) => p.id));
  }, [secteurScope, proprietaires]);

  // Validated payments & expenses
  const validPaiements = useMemo(() => {
    return paiements.filter((p) => {
      if (p.statut !== 'valide') return false;
      if (sectorPropIds && !sectorPropIds.has(p.proprietaire_id)) return false;
      return true;
    });
  }, [paiements, sectorPropIds]);

  const validDepenses = useMemo(() => {
    return depenses.filter((d) => {
      if (d.statut !== 'valide') return false;
      if (secteurScope !== 'all' && d.secteur_id !== secteurScope) return false;
      return true;
    });
  }, [depenses, secteurScope]);

  // Opening balance BEFORE startDate
  const soldeAnterieur = useMemo(() => {
    if (!startDate) return 0;
    const prevIn = validPaiements
      .filter((p) => p.date < startDate)
      .reduce((s, p) => s + Number(p.montant), 0);
    const prevOut = validDepenses
      .filter((d) => d.date < startDate)
      .reduce((s, d) => s + Number(d.montant), 0);
    return prevIn - prevOut;
  }, [validPaiements, validDepenses, startDate]);

  // Period operations
  const periodPaiements = useMemo(() => {
    return validPaiements.filter((p) => {
      if (startDate && p.date < startDate) return false;
      if (endDate && p.date > endDate) return false;
      return true;
    });
  }, [validPaiements, startDate, endDate]);

  const periodDepenses = useMemo(() => {
    return validDepenses
      .filter((d) => {
        if (startDate && d.date < startDate) return false;
        if (endDate && d.date > endDate) return false;
        return true;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [validDepenses, startDate, endDate]);

  const totalEntreesPeriode = useMemo(
    () => periodPaiements.reduce((s, p) => s + Number(p.montant), 0),
    [periodPaiements]
  );

  const totalSortiesPeriode = useMemo(
    () => periodDepenses.reduce((s, d) => s + Number(d.montant), 0),
    [periodDepenses]
  );

  const resultatPeriode = totalEntreesPeriode - totalSortiesPeriode;
  const soldeCloture = soldeAnterieur + resultatPeriode;

  // Breakdown of Entrées by Activite
  const entreesParActivite = useMemo(() => {
    return activites.map((a) => {
      const items = periodPaiements.filter((p) => p.activite_id === a.id);
      const montant = items.reduce((s, p) => s + Number(p.montant), 0);
      const pct = totalEntreesPeriode > 0 ? Math.round((montant / totalEntreesPeriode) * 100) : 0;
      return { activite: a, count: items.length, montant, pct };
    });
  }, [activites, periodPaiements, totalEntreesPeriode]);

  // Breakdown of Sorties by Rubrique
  const sortiesParRubrique = useMemo(() => {
    return rubriques.map((r) => {
      const items = periodDepenses.filter((d) => d.rubrique_id === r.id);
      const montant = items.reduce((s, d) => s + Number(d.montant), 0);
      const pct = totalSortiesPeriode > 0 ? Math.round((montant / totalSortiesPeriode) * 100) : 0;
      return { rubrique: r, count: items.length, montant, pct };
    });
  }, [rubriques, periodDepenses, totalSortiesPeriode]);

  const handlePrint = () => {
    window.print();
  };

  const selectedSecteurLabel =
    secteurScope === 'all'
      ? 'Ensemble de la Copropriété (Tous secteurs + Charges communes)'
      : secteurs.find((s) => s.id === secteurScope)?.nom || secteurScope;

  return (
    <div className="space-y-6">
      {/* Control Toolbar (Hidden on Print) */}
      <div className="no-print bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-gray-900">
              Bilan de Trésorerie Entrées / Sorties (Imprimable PDF)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Document comptable réservé au Bureau du Syndic — synthèse des recettes, dépenses par
              rubrique et solde de caisse
            </p>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs sm:text-sm font-bold shadow-md transition-all self-start sm:self-auto"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Imprimer / Exporter en PDF</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-gray-100">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              Date de début
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              Date de fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              Périmètre
            </label>
            <select
              value={secteurScope}
              onChange={(e) => setSecteurScope(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Toute la Cité (Global)</option>
              {secteurs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              Raccourcis période
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPresetPeriod('month')}
                className="flex-1 py-2 px-2 rounded-xl border border-gray-200 hover:bg-forest-50 text-xs font-semibold text-gray-700"
              >
                Ce mois
              </button>
              <button
                type="button"
                onClick={() => setPresetPeriod('year')}
                className="flex-1 py-2 px-2 rounded-xl border border-gray-200 hover:bg-forest-50 text-xs font-semibold text-gray-700"
              >
                {currentYear}
              </button>
              <button
                type="button"
                onClick={() => setPresetPeriod('all')}
                className="flex-1 py-2 px-2 rounded-xl border border-gray-200 hover:bg-forest-50 text-xs font-semibold text-gray-700"
              >
                Global
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* PRINTABLE A4 DOCUMENT                                               */}
      {/* =================================================================== */}
      <div className="print-document bg-white rounded-3xl border border-gray-200 shadow-lg p-4 sm:p-10 max-w-5xl mx-auto space-y-6 text-gray-900">
        {/* Official Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-forest-900">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-forest-900 text-white flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-forest-700">
                Bureau Exécutif du Syndic · Document Financier Interne
              </div>
              <h1 className="font-serif text-2xl font-bold text-gray-900 mt-0.5">
                ÉTAT DE TRÉSORERIE — ENTRÉES & SORTIES DE CAISSE
              </h1>
              <p className="text-xs text-gray-600 mt-1">
                Périmètre : <strong>{selectedSecteurLabel}</strong>
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs space-y-1 bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
            <div className="font-bold text-gray-900 flex sm:justify-end items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-forest-700" />
              <span>
                Période du {new Date(startDate).toLocaleDateString('fr-FR')} au{' '}
                {new Date(endDate).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <div className="text-gray-500">
              Édité le {today.toLocaleDateString('fr-FR')} à{' '}
              {today.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-forest-800 bg-emerald-100/80 px-2 py-0.5 rounded">
              <ShieldCheck className="w-3 h-3" />
              Opérations validées uniquement
            </div>
          </div>
        </div>

        {/* 1. Synthèse Générale de Caisse */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
              1. Solde Antérieur
            </div>
            <div className="font-serif text-lg sm:text-xl font-bold text-gray-900 mt-1">
              {soldeAnterieur.toLocaleString('fr-FR')} F
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              Avant le {new Date(startDate).toLocaleDateString('fr-FR')}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
              <ArrowUpCircle className="w-3.5 h-3.5" />
              <span>2. Entrées Période (+)</span>
            </div>
            <div className="font-serif text-lg sm:text-xl font-bold text-forest-800 mt-1">
              +{totalEntreesPeriode.toLocaleString('fr-FR')} F
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5">
              {periodPaiements.length} règlement(s) validé(s)
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1">
              <ArrowDownCircle className="w-3.5 h-3.5" />
              <span>3. Sorties Période (-)</span>
            </div>
            <div className="font-serif text-lg sm:text-xl font-bold text-rose-700 mt-1">
              -{totalSortiesPeriode.toLocaleString('fr-FR')} F
            </div>
            <div className="text-[11px] text-rose-700 mt-0.5">
              {periodDepenses.length} dépense(s) validée(s)
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-forest-900 text-white border border-forest-950">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5" />
              <span>4. Solde Final en Caisse</span>
            </div>
            <div className="font-serif text-lg sm:text-xl font-bold text-white mt-1">
              {soldeCloture.toLocaleString('fr-FR')} F
            </div>
            <div className="text-[11px] text-emerald-200 mt-0.5">
              Variation période : {resultatPeriode >= 0 ? '+' : ''}
              {resultatPeriode.toLocaleString('fr-FR')} F
            </div>
          </div>
        </div>

        {/* 2. Ventilation Comparée : Entrées par Activité & Sorties par Rubrique */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Entrées */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <div className="bg-emerald-50/80 px-4 py-3 border-b border-emerald-200 flex items-center justify-between">
              <h3 className="font-serif font-bold text-sm text-forest-900">
                Ventilation des Entrées (Recettes)
              </h3>
              <span className="text-xs font-bold text-forest-800">
                {totalEntreesPeriode.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] border-b border-gray-200">
                <tr>
                  <th className="py-2 px-3 text-left">Prestation / Cotisation</th>
                  <th className="py-2 px-2 text-center">Nb.</th>
                  <th className="py-2 px-3 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {entreesParActivite.map(({ activite, count, montant, pct }) => (
                  <tr key={activite.id}>
                    <td className="py-2 px-3 font-medium text-gray-900">
                      {activite.icone} {activite.nom}
                    </td>
                    <td className="py-2 px-2 text-center text-gray-500">{count}</td>
                    <td className="py-2 px-3 text-right font-bold text-forest-800">
                      {montant.toLocaleString('fr-FR')} F{' '}
                      <span className="text-gray-400 font-normal">({pct}%)</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sorties */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <div className="bg-rose-50/80 px-4 py-3 border-b border-rose-200 flex items-center justify-between">
              <h3 className="font-serif font-bold text-sm text-rose-950">
                Ventilation des Sorties par Rubrique
              </h3>
              <span className="text-xs font-bold text-rose-800">
                {totalSortiesPeriode.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] border-b border-gray-200">
                <tr>
                  <th className="py-2 px-3 text-left">Rubrique budgétaire</th>
                  <th className="py-2 px-2 text-center">Op.</th>
                  <th className="py-2 px-3 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortiesParRubrique.map(({ rubrique, count, montant, pct }) => (
                  <tr key={rubrique.id}>
                    <td className="py-2 px-3 font-medium text-gray-900">
                      <span>
                        {rubrique.icone} {rubrique.nom}
                      </span>
                      <span className="block text-[10px] text-gray-400">
                        {FAMILLES_RUBRIQUES_LABELS[rubrique.famille]?.label}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center text-gray-500">{count}</td>
                    <td className="py-2 px-3 text-right font-bold text-rose-700">
                      {montant.toLocaleString('fr-FR')} F{' '}
                      <span className="text-gray-400 font-normal">({pct}%)</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Grand Livre Détaillé des Sorties de Caisse sur la Période */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-gray-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-forest-700" />
              <span>Journal Détaillé des Dépenses Validées ({periodDepenses.length})</span>
            </h3>
          </div>

          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-xs text-left min-w-[560px] print:min-w-0">
              <thead className="bg-gray-100 text-gray-600 uppercase text-[10px] font-bold border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Réf. / Pièce</th>
                  <th className="py-2.5 px-3">Rubrique</th>
                  <th className="py-2.5 px-3">Motif & Bénéficiaire</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3 text-right">Montant (FCFA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {periodDepenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-400">
                      Aucune sortie de caisse validée sur cette période.
                    </td>
                  </tr>
                ) : (
                  periodDepenses.map((d) => {
                    const rub = rubriques.find((r) => r.id === d.rubrique_id);
                    return (
                      <tr key={d.id}>
                        <td className="py-2 px-3 whitespace-nowrap font-medium">
                          {new Date(d.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-gray-600">
                          {d.reference_piece || d.id}
                        </td>
                        <td className="py-2 px-3">
                          {rub ? `${rub.icone} ${rub.nom}` : d.rubrique_id}
                        </td>
                        <td className="py-2 px-3">
                          <span className="font-semibold text-gray-900">{d.libelle}</span>
                          {d.beneficiaire && (
                            <span className="text-gray-500"> — {d.beneficiaire}</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-gray-600">{d.mode_paiement || 'Caisse'}</td>
                        <td className="py-2 px-3 text-right font-bold text-rose-700 whitespace-nowrap">
                          {Number(d.montant).toLocaleString('fr-FR')}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {periodDepenses.length > 0 && (
                <tfoot className="bg-gray-50 border-t-2 border-gray-300 font-bold text-gray-900">
                  <tr>
                    <td colSpan={5} className="py-2.5 px-3 text-right uppercase text-[11px]">
                      Total des Sorties de la période :
                    </td>
                    <td className="py-2.5 px-3 text-right text-rose-700">
                      {totalSortiesPeriode.toLocaleString('fr-FR')} FCFA
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
            </div>
          </div>
        </div>

        {/* 4. Signatures Box for Bureau & AG */}
        <div className="pt-6 sm:pt-8 grid grid-cols-1 sm:grid-cols-3 print:grid-cols-3 gap-3 sm:gap-6 text-center text-xs">
          <div className="p-4 rounded-2xl border border-dashed border-gray-300 h-20 sm:h-28 print:h-28 flex flex-col justify-between">
            <span className="font-bold uppercase text-[10px] tracking-wider text-gray-600">
              Le Trésorier Général
            </span>
            <span className="text-[10px] text-gray-400">Date, signature & cachet</span>
          </div>
          <div className="p-4 rounded-2xl border border-dashed border-gray-300 h-20 sm:h-28 print:h-28 flex flex-col justify-between">
            <span className="font-bold uppercase text-[10px] tracking-wider text-gray-600">
              Commissaire aux Comptes
            </span>
            <span className="text-[10px] text-gray-400">Visa de contrôle</span>
          </div>
          <div className="p-4 rounded-2xl border border-dashed border-gray-300 h-20 sm:h-28 print:h-28 flex flex-col justify-between">
            <span className="font-bold uppercase text-[10px] tracking-wider text-gray-600">
              Le Président du Syndic
            </span>
            <span className="text-[10px] text-gray-400">Approbation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

