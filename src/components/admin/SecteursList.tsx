'use client';

import React from 'react';
import { Secteur, Proprietaire, Paiement, Activite } from '@/types/database';
import { MapPin, User, Plus, Home, Shield, CheckCircle2 } from 'lucide-react';

interface SecteursListProps {
  secteurs: Secteur[];
  proprietaires: Proprietaire[];
  paiements: Paiement[];
  activites: Activite[];
  onOpenAddModal: () => void;
}

export const SecteursList: React.FC<SecteursListProps> = ({
  secteurs,
  proprietaires,
  paiements,
  activites,
  onOpenAddModal,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">
            Secteurs de la Résidence
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Découpage géographique et assignation des responsables de secteur
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs sm:text-sm font-semibold shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau secteur</span>
        </button>
      </div>

      {/* Grid of Sector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {secteurs.map((s) => {
          const sectProps = proprietaires.filter((p) => p.secteur_id === s.id);
          const sectPropsIds = sectProps.map((p) => p.id);
          const sectPaiements = paiements.filter(
            (p) => sectPropsIds.includes(p.proprietaire_id) && p.statut === 'valide'
          );
          const totalEnc = sectPaiements.reduce((sum, p) => sum + Number(p.montant), 0);

          return (
            <div
              key={s.id}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-5"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-800 flex items-center justify-center font-bold text-lg shadow-inner">
                    <MapPin className="w-6 h-6 text-forest-700" />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-gray-900">{s.nom}</h2>
                    <div className="flex items-center gap-1.5 text-xs text-forest-700 font-medium mt-0.5">
                      <User className="w-3.5 h-3.5" />
                      <span>Responsable : {s.responsable}</span>
                    </div>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs">
                  {sectProps.length} lots
                </span>
              </div>

              {/* Financial Snapshot */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Encaissé</div>
                  <div className="text-base font-bold text-forest-800 mt-0.5">
                    {totalEnc.toLocaleString('fr-FR')} <span className="text-xs font-normal text-gray-500">FCFA</span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Cotisations Validées</div>
                  <div className="text-base font-bold text-gray-800 mt-0.5">
                    {sectPaiements.length} paiements
                  </div>
                </div>
              </div>

              {/* Resident Lots Chips */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Lots rattachés au secteur
                </div>
                {sectProps.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Aucun propriétaire assigné à ce secteur.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {sectProps.map((p) => (
                      <span
                        key={p.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:border-emerald-300 transition-colors"
                      >
                        <span className="font-bold text-emerald-800">Lot {p.lot}</span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-600 truncate max-w-[120px]">{p.nom}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
