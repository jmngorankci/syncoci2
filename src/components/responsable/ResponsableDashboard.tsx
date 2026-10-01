'use client';

import React from 'react';
import { Secteur, Proprietaire, Activite, Paiement, CurrentUser } from '@/types/database';
import { 
  CheckCircle2, 
  Clock, 
  Users, 
  Wallet, 
  MapPin, 
  Check, 
  X, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';

interface ResponsableDashboardProps {
  currentUser: CurrentUser;
  secteurs: Secteur[];
  proprietaires: Proprietaire[];
  activites: Activite[];
  paiements: Paiement[];
  onNavigate: (tab: string) => void;
  onValidatePayment: (id: string) => void;
  onRejectPayment: (id: string) => void;
}

export const ResponsableDashboard: React.FC<ResponsableDashboardProps> = ({
  currentUser,
  secteurs,
  proprietaires,
  activites,
  paiements,
  onNavigate,
  onValidatePayment,
  onRejectPayment,
}) => {
  const currentSecteur = secteurs.find((s) => s.id === currentUser.secteur_id) || secteurs[0];
  const sectProps = proprietaires.filter((p) => p.secteur_id === currentSecteur?.id);
  const sectPropsIds = sectProps.map((p) => p.id);

  const sectPaiements = paiements.filter((p) => sectPropsIds.includes(p.proprietaire_id));
  const pendingPaiements = sectPaiements.filter((p) => p.statut === 'en_attente');
  const validPaiements = sectPaiements.filter((p) => p.statut === 'valide');
  const totalEnc = validPaiements.reduce((sum, p) => sum + Number(p.montant), 0);

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#1a3a2a] to-[#2e7d50] p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-400/30 mb-3">
              <MapPin className="w-3.5 h-3.5" />
              <span>{currentSecteur?.nom}</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Bonjour, {currentUser.nom.split(' ')[0]} 👋
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1">
              Espace Responsable de secteur — {sectProps.length} copropriétaires assignés
            </p>
          </div>

          <div>
            {pendingPaiements.length > 0 ? (
              <button
                onClick={() => onNavigate('validations')}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                <span>⏳ {pendingPaiements.length} validation(s) à traiter</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-900/60 text-emerald-200 border border-emerald-500/30 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Tous les paiements sont à jour</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Mon Secteur</div>
          <div className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            {sectProps.length} <span className="text-xs font-sans font-normal text-gray-500">lots</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">Résidents actifs</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500">À Valider</div>
          <div className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-amber-600">
            {pendingPaiements.length}
          </div>
          <div className="text-xs text-amber-600 font-medium mt-1">Paiements soumis</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Validés</div>
          <div className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-emerald-700">
            {validPaiements.length}
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">Cotisations réglées</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Encaissé Secteur</div>
          <div className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-forest-800">
            {totalEnc.toLocaleString('fr-FR')} <span className="text-xs font-sans font-normal text-gray-500">F</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">Cumul secteur validé</div>
        </div>
      </div>

      {/* Urgent: Pending Validations List */}
      {pendingPaiements.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 bg-amber-50/60 border-b border-amber-100 flex items-center justify-between">
            <h2 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Paiements en attente de votre validation immédiate
            </h2>
            <button
              onClick={() => onNavigate('validations')}
              className="text-xs text-amber-800 font-bold hover:underline"
            >
              Voir l'écran dédié
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {pendingPaiements.map((p) => {
              const prop = proprietaires.find((pr) => pr.id === p.proprietaire_id);
              const act = activites.find((a) => a.id === p.activite_id);

              return (
                <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-lg shrink-0">
                      {act?.icone || '💳'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                        <span>{prop?.nom}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-amber-100/70 text-amber-900 font-mono font-bold">
                          Lot {prop?.lot}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {act?.nom} · Soumis le {new Date(p.date).toLocaleDateString('fr-FR')} {p.mode_paiement ? `via ${p.mode_paiement}` : ''}
                      </div>
                      {p.reference && (
                        <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                          Réf: {p.reference}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <div className="text-right">
                      <div className="font-bold text-forest-800 text-base">
                        {Number(p.montant).toLocaleString('fr-FR')} FCFA
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onValidatePayment(p.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Valider</span>
                      </button>
                      <button
                        onClick={() => onRejectPayment(p.id)}
                        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Rejeter</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
