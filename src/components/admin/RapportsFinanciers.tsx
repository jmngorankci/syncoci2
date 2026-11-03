'use client';

import React from 'react';
import {
  Secteur,
  Proprietaire,
  Activite,
  Paiement,
  Depense,
  RubriqueDepense,
} from '@/types/database';
import { PieChart, BarChart3, FolderKanban } from 'lucide-react';

interface RapportsFinanciersProps {
  secteurs: Secteur[];
  proprietaires: Proprietaire[];
  activites: Activite[];
  paiements: Paiement[];
  depenses?: Depense[];
  rubriques?: RubriqueDepense[];
}

export const RapportsFinanciers: React.FC<RapportsFinanciersProps> = ({
  secteurs,
  proprietaires,
  activites,
  paiements,
  depenses = [],
  rubriques = [],
}) => {
  const totalValide = paiements
    .filter((p) => p.statut === 'valide')
    .reduce((sum, p) => sum + Number(p.montant), 0);

  const totalSortiesValide = depenses
    .filter((d) => d.statut === 'valide')
    .reduce((sum, d) => sum + Number(d.montant), 0);

  const soldeNet = totalValide - totalSortiesValide;

  const totalEnAttente = paiements
    .filter((p) => p.statut === 'en_attente')
    .reduce((sum, p) => sum + Number(p.montant), 0);

  const totalDepensesAttente = depenses
    .filter((d) => d.statut === 'en_attente')
    .reduce((sum, d) => sum + Number(d.montant), 0);

  const totalCount = paiements.length;
  const validCount = paiements.filter((p) => p.statut === 'valide').length;
  const tauxRecouvrement = totalCount > 0 ? Math.round((validCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">
            Rapports & Synthèse Financière
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Analyse globale des encaissements, des dépenses par rubrique et du solde de trésorerie
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Total Encaissé (Entrées)
          </div>
          <div className="mt-2 font-serif text-2xl font-bold text-forest-800">
            {totalValide.toLocaleString('fr-FR')}{' '}
            <span className="text-xs font-sans font-normal text-gray-500">FCFA</span>
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            ✓ Taux de recouvrement : {tauxRecouvrement}%
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Total Dépensé (Sorties)
          </div>
          <div className="mt-2 font-serif text-2xl font-bold text-rose-700">
            {totalSortiesValide.toLocaleString('fr-FR')}{' '}
            <span className="text-xs font-sans font-normal text-gray-500">FCFA</span>
          </div>
          <div className="text-xs text-rose-600 font-medium mt-1">
            {depenses.filter((d) => d.statut === 'valide').length} sortie(s) de caisse validée(s)
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0d2b1a] to-[#1e4b32] text-white rounded-2xl p-5 border border-forest-800 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-200">
            Solde Net en Caisse
          </div>
          <div className="mt-2 font-serif text-2xl font-bold text-white">
            {soldeNet.toLocaleString('fr-FR')}{' '}
            <span className="text-xs font-sans font-normal text-emerald-200">FCFA</span>
          </div>
          <div className="text-xs text-emerald-300 font-medium mt-1">
            Entrées validées − Sorties validées
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Opérations en Attente
          </div>
          <div className="mt-2 font-serif text-lg font-bold text-amber-600">
            +{totalEnAttente.toLocaleString('fr-FR')} F{' '}
            <span className="text-xs font-sans font-normal text-gray-400">entrées</span>
          </div>
          <div className="text-xs text-rose-600 font-semibold mt-1">
            -{totalDepensesAttente.toLocaleString('fr-FR')} F sorties à valider
          </div>
        </div>
      </div>

      {/* Three Analytical Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sorties par Rubrique */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="font-serif text-base font-bold text-gray-900 flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-rose-600" />
              Répartition des Dépenses par Rubrique
            </h2>
            <span className="text-xs text-gray-400 font-medium">{rubriques.length} rubriques</span>
          </div>

          <div className="space-y-4">
            {rubriques.map((r) => {
              const rubDeps = depenses.filter(
                (d) => d.rubrique_id === r.id && d.statut === 'valide'
              );
              const rubTotal = rubDeps.reduce((sum, d) => sum + Number(d.montant), 0);
              const percentage =
                totalSortiesValide > 0 ? Math.round((rubTotal / totalSortiesValide) * 100) : 0;

              return (
                <div key={r.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{r.icone}</span>
                      <span className="font-semibold text-gray-900">{r.nom}</span>
                      <span className="text-gray-400">({rubDeps.length} op.)</span>
                    </div>
                    <div className="font-bold text-rose-700">
                      {rubTotal.toLocaleString('fr-FR')} FCFA{' '}
                      <span className="text-gray-400 font-normal">({percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Par Secteur & Par Activité */}
        <div className="space-y-6">
          {/* Par Activité */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="font-serif text-base font-bold text-gray-900 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-forest-700" />
                Encaissements par Activité
              </h2>
              <span className="text-xs text-gray-400 font-medium">{activites.length} service(s)</span>
            </div>

            <div className="space-y-4">
              {activites.map((a) => {
                const actPays = paiements.filter(
                  (p) => p.activite_id === a.id && p.statut === 'valide'
                );
                const actTotal = actPays.reduce((sum, p) => sum + Number(p.montant), 0);
                const percentage =
                  totalValide > 0 ? Math.round((actTotal / totalValide) * 100) : 0;

                return (
                  <div key={a.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{a.icone}</span>
                        <span className="font-semibold text-gray-900">{a.nom}</span>
                        <span className="text-gray-400">({actPays.length} paiements)</span>
                      </div>
                      <div className="font-bold text-forest-800">
                        {actTotal.toLocaleString('fr-FR')} FCFA{' '}
                        <span className="text-gray-400 font-normal">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-forest-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Par Secteur */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="font-serif text-base font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-forest-700" />
                Encaissements par Secteur
              </h2>
              <span className="text-xs text-gray-400 font-medium">{secteurs.length} secteurs</span>
            </div>

            <div className="space-y-4">
              {secteurs.map((s) => {
                const sectPropsIds = proprietaires
                  .filter((p) => p.secteur_id === s.id)
                  .map((p) => p.id);
                const sectPays = paiements.filter(
                  (p) => sectPropsIds.includes(p.proprietaire_id) && p.statut === 'valide'
                );
                const sectTotal = sectPays.reduce((sum, p) => sum + Number(p.montant), 0);
                const percentage =
                  totalValide > 0 ? Math.round((sectTotal / totalValide) * 100) : 0;

                return (
                  <div key={s.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-gray-900">{s.nom}</span>
                        <span className="text-gray-400 ml-1">· Resp: {s.responsable}</span>
                      </div>
                      <div className="font-bold text-forest-800">
                        {sectTotal.toLocaleString('fr-FR')} FCFA{' '}
                        <span className="text-gray-400 font-normal">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>{sectPropsIds.length} résidents</span>
                      <span>{sectPays.length} paiements validés</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
