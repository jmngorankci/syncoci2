'use client';

import React, { useState } from 'react';
import { Proprietaire, Secteur, Paiement } from '@/types/database';
import { Search, Plus, UserPlus, Phone, Mail, Eye, Home } from 'lucide-react';

interface ProprietairesListProps {
  proprietaires: Proprietaire[];
  secteurs: Secteur[];
  paiements: Paiement[];
  onOpenAddModal: () => void;
  onViewProprietaire: (prop: Proprietaire) => void;
}

export const ProprietairesList: React.FC<ProprietairesListProps> = ({
  proprietaires,
  secteurs,
  paiements,
  onOpenAddModal,
  onViewProprietaire,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSecteur, setSelectedSecteur] = useState<string>('all');

  const filtered = proprietaires.filter((p) => {
    const matchesSearch =
      p.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.lot.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ilot.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tel.includes(searchQuery);

    const matchesSecteur = selectedSecteur === 'all' || p.secteur_id === selectedSecteur;

    return matchesSearch && matchesSecteur;
  });

  return (
    <div className="space-y-6">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">
            Gestion des Copropriétaires
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {proprietaires.length} lots enregistrés dans la résidence
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs sm:text-sm font-semibold shadow-md transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Ajouter un propriétaire</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, lot (ex: A01), îlot, téléphone..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
          />
        </div>

        <div className="sm:w-60">
          <select
            value={selectedSecteur}
            onChange={(e) => setSelectedSecteur(e.target.value)}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50 text-gray-700"
          >
            <option value="all">Tous les secteurs</option>
            {secteurs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Copropriétaire</th>
                <th className="py-3.5 px-4">Lot & Îlot</th>
                <th className="py-3.5 px-4">Secteur</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Statut cotisations</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    Aucun propriétaire ne correspond à votre recherche.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const sect = secteurs.find((s) => s.id === p.secteur_id);
                  const propPaiements = paiements.filter((pay) => pay.proprietaire_id === p.id);
                  const totalPaid = propPaiements
                    .filter((pay) => pay.statut === 'valide')
                    .reduce((sum, pay) => sum + Number(pay.montant), 0);
                  const pendingCount = propPaiements.filter((pay) => pay.statut === 'en_attente').length;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-forest-100 text-forest-800 text-xs font-bold flex items-center justify-center shrink-0">
                            {p.nom.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{p.nom}</div>
                            <div className="text-xs text-gray-400 font-mono">{p.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-mono font-bold text-xs border border-emerald-200">
                            LOT {p.lot}
                          </span>
                          <span className="text-xs text-gray-500">Îlot {p.ilot}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-xs text-gray-700 font-medium">
                          {sect?.nom || 'Non assigné'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-xs space-y-0.5 text-gray-600">
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{p.tel}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-400">
                            <Mail className="w-3 h-3" />
                            <span className="truncate max-w-[140px]">{p.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-xs">
                          <div className="font-bold text-forest-800">
                            {totalPaid.toLocaleString('fr-FR')} FCFA
                          </div>
                          {pendingCount > 0 && (
                            <span className="inline-block mt-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                              ⏳ {pendingCount} en attente
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onViewProprietaire(p)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-forest-50 hover:border-forest-300 text-forest-800 text-xs font-medium transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Fiche</span>
                        </button>
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
