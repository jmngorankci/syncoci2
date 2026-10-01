'use client';

import React from 'react';
import { Secteur, Proprietaire, Activite, Paiement, CurrentUser } from '@/types/database';
import { CheckCircle2, Check, X, Clock, FileText, AlertCircle } from 'lucide-react';

interface ValidationsViewProps {
  currentUser: CurrentUser;
  secteurs: Secteur[];
  proprietaires: Proprietaire[];
  activites: Activite[];
  paiements: Paiement[];
  onValidatePayment: (id: string) => void;
  onRejectPayment: (id: string) => void;
}

export const ValidationsView: React.FC<ValidationsViewProps> = ({
  currentUser,
  secteurs,
  proprietaires,
  activites,
  paiements,
  onValidatePayment,
  onRejectPayment,
}) => {
  const currentSecteur = secteurs.find((s) => s.id === currentUser.secteur_id) || secteurs[0];
  const sectPropsIds = proprietaires
    .filter((p) => p.secteur_id === currentSecteur?.id)
    .map((p) => p.id);

  const pendingPaiements = paiements.filter(
    (p) => sectPropsIds.includes(p.proprietaire_id) && p.statut === 'en_attente'
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-gray-900">
          Paiements à Valider
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Vérifiez les pièces justificatives ou reçus pour le secteur {currentSecteur?.nom}
        </p>
      </div>

      {pendingPaiements.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-3">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-lg font-bold text-gray-900">
            Aucun paiement en attente !
          </h2>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Tous les règlements soumis par les copropriétaires de votre secteur ont été traités.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
          {pendingPaiements.map((p) => {
            const prop = proprietaires.find((pr) => pr.id === p.proprietaire_id);
            const act = activites.find((a) => a.id === p.activite_id);

            return (
              <div key={p.id} className="p-5 hover:bg-gray-50/70 transition-colors space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center text-xl shrink-0">
                      {act?.icone || '💳'}
                    </div>
                    <div>
                      <div className="font-semibold text-base text-gray-900 flex items-center gap-2">
                        <span>{prop?.nom}</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-md bg-forest-100 text-forest-900 font-mono font-bold">
                          Lot {prop?.lot}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {act?.nom} · Date : {new Date(p.date).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-xs uppercase font-bold text-gray-400">Montant à encaisser</div>
                    <div className="text-xl font-bold text-forest-800">
                      {Number(p.montant).toLocaleString('fr-FR')} FCFA
                    </div>
                  </div>
                </div>

                {/* Details box */}
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-gray-400 font-medium">Mode de paiement :</span>
                    <div className="font-semibold text-gray-800 mt-0.5">{p.mode_paiement || 'Non spécifié'}</div>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium">Référence transaction :</span>
                    <div className="font-mono font-semibold text-gray-800 mt-0.5">{p.reference || 'Aucune'}</div>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium">Note du résident :</span>
                    <div className="italic text-gray-600 mt-0.5">{p.note ? `"${p.note}"` : 'Aucune remarque'}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => onRejectPayment(p.id)}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Rejeter le paiement</span>
                  </button>
                  <button
                    onClick={() => onValidatePayment(p.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Valider l'encaissement</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
