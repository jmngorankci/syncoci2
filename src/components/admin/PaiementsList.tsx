'use client';

import React, { useState } from 'react';
import { Paiement, Proprietaire, Activite, PaiementStatut } from '@/types/database';
import { Search, CheckCircle2, AlertTriangle, Filter, Check, X, Clock, FileText } from 'lucide-react';

interface PaiementsListProps {
  paiements: Paiement[];
  proprietaires: Proprietaire[];
  activites: Activite[];
  onValidatePayment: (id: string) => void;
  onRejectPayment: (id: string) => void;
}

export const PaiementsList: React.FC<PaiementsListProps> = ({
  paiements,
  proprietaires,
  activites,
  onValidatePayment,
  onRejectPayment,
}) => {
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const countPending = paiements.filter((p) => p.statut === 'en_attente').length;
  const countValide = paiements.filter((p) => p.statut === 'valide').length;
  const countRejete = paiements.filter((p) => p.statut === 'rejete').length;

  const filtered = paiements.filter((p) => {
    const prop = proprietaires.find((pr) => pr.id === p.proprietaire_id);
    const act = activites.find((a) => a.id === p.activite_id);

    const matchesSearch =
      (prop?.nom || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prop?.lot || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (act?.nom || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.reference || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.note || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterStatut === 'all' || p.statut === filterStatut;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-gray-900">
          Gestion & Validation des Paiements
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Suivi de tous les règlements des cotisations par les copropriétaires
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
          <button
            onClick={() => setFilterStatut('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatut === 'all'
                ? 'bg-white text-forest-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tous ({paiements.length})
          </button>
          <button
            onClick={() => setFilterStatut('en_attente')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterStatut === 'en_attente'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>En attente</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/30 text-[10px]">
              {countPending}
            </span>
          </button>
          <button
            onClick={() => setFilterStatut('valide')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatut === 'valide'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Validés ({countValide})
          </button>
          <button
            onClick={() => setFilterStatut('rejete')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatut === 'rejete'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Rejetés ({countRejete})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, lot, réf..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Propriétaire</th>
                <th className="py-3.5 px-4">Activité</th>
                <th className="py-3.5 px-4">Montant</th>
                <th className="py-3.5 px-4">Date & Mode</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4">Validation / Note</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    Aucun paiement trouvé dans cette catégorie.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const prop = proprietaires.find((pr) => pr.id === p.proprietaire_id);
                  const act = activites.find((a) => a.id === p.activite_id);

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Owner */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div>
                          <div className="font-semibold text-gray-900">{prop?.nom || 'Inconnu'}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 font-mono font-bold">
                              Lot {prop?.lot}
                            </span>
                            <span className="text-xs text-gray-400">Îlot {prop?.ilot}</span>
                          </div>
                        </div>
                      </td>

                      {/* Activity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{act?.icone}</span>
                          <span className="font-medium text-gray-900 text-xs sm:text-sm">{act?.nom}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-forest-800">
                          {Number(p.montant).toLocaleString('fr-FR')} FCFA
                        </span>
                      </td>

                      {/* Date & Method */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs">
                          <div className="text-gray-900 font-medium">
                            {new Date(p.date).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="text-gray-500">
                            {p.mode_paiement || 'Paiement direct'}
                            {p.reference && <span className="font-mono text-[10px] ml-1">({p.reference})</span>}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                          p.statut === 'valide'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.statut === 'en_attente'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {p.statut === 'valide' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {p.statut === 'en_attente' && <Clock className="w-3.5 h-3.5" />}
                          {p.statut === 'rejete' && <AlertTriangle className="w-3.5 h-3.5" />}
                          <span className="capitalize">
                            {p.statut === 'valide' ? 'Validé' : p.statut === 'en_attente' ? 'En attente' : 'Rejeté'}
                          </span>
                        </span>
                      </td>

                      {/* Validator & Note */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="text-xs text-gray-600">
                          {p.valide_par && (
                            <div className="font-medium text-gray-800">
                              Par : {p.valide_par}
                            </div>
                          )}
                          {p.note && (
                            <div className="italic text-gray-500 text-[11px] truncate">
                              "{p.note}"
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        {p.statut === 'en_attente' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onValidatePayment(p.id)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Valider</span>
                            </button>
                            <button
                              onClick={() => onRejectPayment(p.id)}
                              className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Rejeter</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 font-mono">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
