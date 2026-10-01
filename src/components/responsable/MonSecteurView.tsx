'use client';

import React from 'react';
import { Secteur, Proprietaire, Paiement, CurrentUser } from '@/types/database';
import { MapPin, Phone, Mail, CheckCircle2, Clock } from 'lucide-react';

interface MonSecteurViewProps {
  currentUser: CurrentUser;
  secteurs: Secteur[];
  proprietaires: Proprietaire[];
  paiements: Paiement[];
}

export const MonSecteurView: React.FC<MonSecteurViewProps> = ({
  currentUser,
  secteurs,
  proprietaires,
  paiements,
}) => {
  const currentSecteur = secteurs.find((s) => s.id === currentUser.secteur_id) || secteurs[0];
  const sectProps = proprietaires.filter((p) => p.secteur_id === currentSecteur?.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-gray-900">
          Copropriétaires de Mon Secteur
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          {currentSecteur?.nom} — Supervision de {sectProps.length} résidents
        </p>
      </div>

      {/* Grid of Resident Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sectProps.map((p) => {
          const propPaiements = paiements.filter((pay) => pay.proprietaire_id === p.id);
          const validPays = propPaiements.filter((pay) => pay.statut === 'valide');
          const pendingPays = propPaiements.filter((pay) => pay.statut === 'en_attente');
          const totalPaid = validPays.reduce((sum, pay) => sum + Number(pay.montant), 0);

          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-forest-100 text-forest-900 font-bold text-sm flex items-center justify-center">
                    {p.nom.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{p.nom}</div>
                    <div className="text-xs text-gray-400 font-mono">Îlot {p.ilot}</div>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-mono font-bold text-xs border border-emerald-200">
                  LOT {p.lot}
                </span>
              </div>

              <div className="text-xs space-y-1 text-gray-600 border-y border-gray-50 py-3">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{p.tel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span className="truncate">{p.email}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <div className="text-gray-400 text-[10px] uppercase font-bold">Total réglé</div>
                  <div className="font-bold text-forest-800 text-sm">{totalPaid.toLocaleString('fr-FR')} F</div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3 h-3" />
                    {validPays.length} validés
                  </span>
                  {pendingPays.length > 0 && (
                    <div className="text-[10px] text-amber-600 font-medium mt-0.5">
                      ⏳ {pendingPays.length} en attente
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
