'use client';

import React from 'react';
import { Secteur, Proprietaire, Activite, Paiement } from '@/types/database';
import { TrendingUp, Wallet, Clock, Users, PieChart, BarChart3, Download } from 'lucide-react';

interface RapportsFinanciersProps {
  secteurs: Secteur[];
  proprietaires: Proprietaire[];
  activites: Activite[];
  paiements: Paiement[];
}

export const RapportsFinanciers: React.FC<RapportsFinanciersProps> = ({
  secteurs,
  proprietaires,
  activites,
  paiements,
}) => {
  const totalValide = paiements
    .filter((p) => p.statut === 'valide')
    .reduce((sum, p) => sum + Number(p.montant), 0);

  const totalEnAttente = paiements
    .filter((p) => p.statut === 'en_attente')
    .reduce((sum, p) => sum + Number(p.montant), 0);

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
            Analyse détaillée des encaissements par prestation et par secteur
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Encaissé Total</div>
          <div className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-forest-800">
            {totalValide.toLocaleString('fr-FR')} <span className="text-xs font-sans font-normal text-gray-500">FCFA</span>
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">✓ Fonds reçus & validés</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500">En Attente de Validation</div>
          <div className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-amber-600">
            {totalEnAttente.toLocaleString('fr-FR')} <span className="text-xs font-sans font-normal text-gray-500">FCFA</span>
          </div>
          <div className="text-xs text-amber-600 font-medium mt-1">⏳ À vérifier par les responsables</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Lots Déclarés</div>
          <div className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            {proprietaires.length} <span className="text-xs font-sans font-normal text-gray-500">copropriétaires</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">Sur 4 secteurs géographiques</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Taux de Recouvrement</div>
          <div className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-emerald-700">
            {tauxRecouvrement}%
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            {validCount} paiements confirmés sur {totalCount}
          </div>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Par Activité */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="font-serif text-base font-bold text-gray-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-forest-700" />
              Répartition par Activité
            </h2>
            <span className="text-xs text-gray-400 font-medium">{activites.length} services</span>
          </div>

          <div className="space-y-4">
            {activites.map((a) => {
              const actPays = paiements.filter((p) => p.activite_id === a.id && p.statut === 'valide');
              const actTotal = actPays.reduce((sum, p) => sum + Number(p.montant), 0);
              const percentage = totalValide > 0 ? Math.round((actTotal / totalValide) * 100) : 0;

              return (
                <div key={a.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{a.icone}</span>
                      <span className="font-semibold text-gray-900">{a.nom}</span>
                      <span className="text-gray-400">({actPays.length} paiements)</span>
                    </div>
                    <div className="font-bold text-forest-800">
                      {actTotal.toLocaleString('fr-FR')} FCFA <span className="text-gray-400 font-normal">({percentage}%)</span>
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
              Répartition par Secteur
            </h2>
            <span className="text-xs text-gray-400 font-medium">{secteurs.length} secteurs</span>
          </div>

          <div className="space-y-4">
            {secteurs.map((s) => {
              const sectPropsIds = proprietaires.filter((p) => p.secteur_id === s.id).map((p) => p.id);
              const sectPays = paiements.filter(
                (p) => sectPropsIds.includes(p.proprietaire_id) && p.statut === 'valide'
              );
              const sectTotal = sectPays.reduce((sum, p) => sum + Number(p.montant), 0);
              const percentage = totalValide > 0 ? Math.round((sectTotal / totalValide) * 100) : 0;

              return (
                <div key={s.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-gray-900">{s.nom}</span>
                      <span className="text-gray-400 ml-1">· Resp: {s.responsable}</span>
                    </div>
                    <div className="font-bold text-forest-800">
                      {sectTotal.toLocaleString('fr-FR')} FCFA <span className="text-gray-400 font-normal">({percentage}%)</span>
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
  );
};
