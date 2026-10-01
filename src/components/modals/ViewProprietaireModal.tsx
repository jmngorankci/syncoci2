'use client';

import React from 'react';
import { Proprietaire, Secteur, Paiement, Activite } from '@/types/database';
import { X, User, Phone, Mail, MapPin, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface ViewProprietaireModalProps {
  isOpen: boolean;
  onClose: () => void;
  proprietaire: Proprietaire | null;
  secteurs: Secteur[];
  paiements: Paiement[];
  activites: Activite[];
}

export const ViewProprietaireModal: React.FC<ViewProprietaireModalProps> = ({
  isOpen,
  onClose,
  proprietaire,
  secteurs,
  paiements,
  activites,
}) => {
  if (!isOpen || !proprietaire) return null;

  const sect = secteurs.find((s) => s.id === proprietaire.secteur_id);
  const propPaiements = paiements.filter((p) => p.proprietaire_id === proprietaire.id);
  const totalValide = propPaiements
    .filter((p) => p.statut === 'valide')
    .reduce((sum, p) => sum + Number(p.montant), 0);
  const pendingCount = propPaiements.filter((p) => p.statut === 'en_attente').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-forest-900 to-forest-800 text-white flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-forest-700/80 border border-forest-500/40 text-emerald-300 font-serif text-xl font-bold flex items-center justify-center">
              {proprietaire.nom.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-white">{proprietaire.nom}</h2>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-forest-200">
                <span className="font-mono font-bold text-emerald-300">LOT {proprietaire.lot}</span>
                <span>·</span>
                <span>Îlot {proprietaire.ilot}</span>
                <span>·</span>
                <span>{sect?.nom || 'Secteur non assigné'}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-forest-300 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <div className="text-[10px] uppercase font-bold text-forest-700">Total payé validé</div>
              <div className="font-serif text-2xl font-bold text-forest-900 mt-1">
                {totalValide.toLocaleString('fr-FR')} <span className="text-xs font-sans font-normal text-gray-600">FCFA</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
              <div className="text-[10px] uppercase font-bold text-gray-500">Paiements enregistrés</div>
              <div className="font-serif text-2xl font-bold text-gray-900 mt-1">
                {propPaiements.length} <span className="text-xs font-sans font-normal text-gray-500">({pendingCount} en attente)</span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-gray-100">
              <span className="text-gray-400 font-medium">Téléphone :</span>
              <span className="font-semibold text-gray-900">{proprietaire.tel}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-gray-100">
              <span className="text-gray-400 font-medium">Email :</span>
              <span className="font-semibold text-gray-900">{proprietaire.email}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-gray-100">
              <span className="text-gray-400 font-medium">Secteur :</span>
              <span className="font-semibold text-gray-900">{sect?.nom}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-gray-400 font-medium">Responsable désigné :</span>
              <span className="font-semibold text-emerald-800">{sect?.responsable}</span>
            </div>
          </div>

          {/* Recent Payments of this owner */}
          <div className="space-y-3">
            <h3 className="font-serif text-sm font-bold text-gray-900">
              Historique des cotisations du lot
            </h3>

            {propPaiements.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Aucun règlement enregistré pour ce propriétaire.</p>
            ) : (
              <div className="border border-gray-100 rounded-2xl divide-y divide-gray-100 max-h-48 overflow-y-auto">
                {propPaiements.map((p) => {
                  const act = activites.find((a) => a.id === p.activite_id);
                  return (
                    <div key={p.id} className="p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{act?.icone || '💳'}</span>
                        <div>
                          <div className="font-semibold text-gray-900">{act?.nom}</div>
                          <div className="text-[10px] text-gray-400">{new Date(p.date).toLocaleDateString('fr-FR')}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-forest-800">{Number(p.montant).toLocaleString('fr-FR')} F</div>
                        <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                          p.statut === 'valide' ? 'bg-emerald-100 text-emerald-800' : p.statut === 'en_attente' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {p.statut === 'valide' ? 'Validé' : p.statut === 'en_attente' ? 'En attente' : 'Rejeté'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-white text-xs font-medium rounded-xl hover:bg-gray-900"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
