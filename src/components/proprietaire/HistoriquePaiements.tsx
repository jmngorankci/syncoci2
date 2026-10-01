'use client';

import React from 'react';
import { Paiement, Activite, CurrentUser, Proprietaire } from '@/types/database';
import { CheckCircle2, Clock, AlertTriangle, FileText, Download } from 'lucide-react';

interface HistoriquePaiementsProps {
  currentUser: CurrentUser;
  proprietaires: Proprietaire[];
  activites: Activite[];
  paiements: Paiement[];
}

export const HistoriquePaiements: React.FC<HistoriquePaiementsProps> = ({
  currentUser,
  proprietaires,
  activites,
  paiements,
}) => {
  const currentProp = proprietaires.find((p) => p.id === currentUser.proprietaire_id) || proprietaires[0];
  const myPaiements = paiements
    .filter((p) => p.proprietaire_id === currentProp?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-gray-900">
          Historique de Mes Règlements
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Toutes les quittances et statuts de cotisations pour le Lot {currentProp?.lot}
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {myPaiements.length === 0 ? (
          <div className="p-12 text-center text-gray-400 space-y-2">
            <FileText className="w-10 h-10 mx-auto text-gray-300" />
            <div className="text-sm font-medium">Aucun paiement enregistré pour l'instant.</div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {myPaiements.map((p) => {
              const act = activites.find((a) => a.id === p.activite_id);

              return (
                <div key={p.id} className="p-5 hover:bg-gray-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                      p.statut === 'valide' ? 'bg-emerald-50 text-emerald-800' : p.statut === 'en_attente' ? 'bg-amber-50 text-amber-800' : 'bg-red-50 text-red-800'
                    }`}>
                      {act?.icone || '💳'}
                    </div>

                    <div>
                      <div className="font-bold text-sm text-gray-900 flex items-center gap-2">
                        <span>{act?.nom}</span>
                        <span className="font-mono text-xs text-gray-400 font-normal">#{p.id}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Date de versement : {new Date(p.date).toLocaleDateString('fr-FR')} {p.mode_paiement ? `· ${p.mode_paiement}` : ''}
                      </div>
                      {p.reference && (
                        <div className="text-[11px] font-mono text-gray-500 mt-0.5">
                          Réf. : {p.reference}
                        </div>
                      )}
                      {p.valide_par && (
                        <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
                          ✓ Quittance certifiée par {p.valide_par}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
                    <div className="text-left sm:text-right">
                      <div className="font-serif text-lg font-bold text-forest-800">
                        {Number(p.montant).toLocaleString('fr-FR')} FCFA
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mt-0.5 ${
                        p.statut === 'valide'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.statut === 'en_attente'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {p.statut === 'valide' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {p.statut === 'en_attente' && <Clock className="w-3.5 h-3.5" />}
                        {p.statut === 'rejete' && <AlertTriangle className="w-3.5 h-3.5" />}
                        <span>{p.statut === 'valide' ? 'Validé' : p.statut === 'en_attente' ? 'En attente' : 'Rejeté'}</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
