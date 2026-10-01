'use client';

import React from 'react';
import { Activite, Paiement } from '@/types/database';
import { Plus, Edit2, Layers, Calendar, CheckCircle2 } from 'lucide-react';

interface ActivitesListProps {
  activites: Activite[];
  paiements: Paiement[];
  onOpenAddModal: () => void;
  onOpenEditModal: (act: Activite) => void;
}

export const ActivitesList: React.FC<ActivitesListProps> = ({
  activites,
  paiements,
  onOpenAddModal,
  onOpenEditModal,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">
            Activités & Cotisations
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Paramétrage des montants de charges, fréquences et services de la copropriété
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs sm:text-sm font-semibold shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle activité</span>
        </button>
      </div>

      {/* Visual Chips Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {activites.map((a) => (
          <div
            key={a.id}
            onClick={() => onOpenEditModal(a)}
            className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform origin-left">{a.icone}</div>
              <div className="font-semibold text-xs text-gray-900 line-clamp-1">{a.nom}</div>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-50">
              <div className="text-sm font-bold text-forest-800">
                {Number(a.montant).toLocaleString('fr-FR')} F
              </div>
              <div className="text-[10px] text-gray-400 capitalize">{a.periodicite}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-serif text-base font-bold text-gray-900">
            Détails des Prestations & Recouvrements
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Activité</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Montant unitaire</th>
                <th className="py-3.5 px-4">Périodicité</th>
                <th className="py-3.5 px-4">Total Encaissé</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {activites.map((a) => {
                const totalEnc = paiements
                  .filter((p) => p.activite_id === a.id && p.statut === 'valide')
                  .reduce((sum, p) => sum + Number(p.montant), 0);
                const countValid = paiements.filter((p) => p.activite_id === a.id && p.statut === 'valide').length;

                return (
                  <tr key={a.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl shrink-0">{a.icone}</span>
                        <div>
                          <div className="font-semibold text-gray-900">{a.nom}</div>
                          <div className="text-xs text-gray-400 font-mono">{a.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-xs text-gray-500 line-clamp-2">{a.description || 'Aucune description'}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-900">
                        {Number(a.montant).toLocaleString('fr-FR')} FCFA
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 font-semibold text-xs border border-blue-200 capitalize">
                        {a.periodicite}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-bold text-forest-800">
                          {totalEnc.toLocaleString('fr-FR')} FCFA
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {countValid} règlement(s)
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onOpenEditModal(a)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-forest-50 hover:border-forest-300 text-forest-800 text-xs font-medium transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Modifier</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
