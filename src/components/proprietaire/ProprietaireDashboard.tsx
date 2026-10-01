'use client';

import React from 'react';
import { Secteur, Proprietaire, Activite, Paiement, CurrentUser } from '@/types/database';
import { 
  Home, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';

interface ProprietaireDashboardProps {
  currentUser: CurrentUser;
  secteurs: Secteur[];
  proprietaires: Proprietaire[];
  activites: Activite[];
  paiements: Paiement[];
  onNavigate: (tab: string) => void;
  onSelectActiviteForPayment: (actId: string) => void;
}

export const ProprietaireDashboard: React.FC<ProprietaireDashboardProps> = ({
  currentUser,
  secteurs,
  proprietaires,
  activites,
  paiements,
  onNavigate,
  onSelectActiviteForPayment,
}) => {
  const currentProp = proprietaires.find((p) => p.id === currentUser.proprietaire_id) || proprietaires[0];
  const currentSecteur = secteurs.find((s) => s.id === currentProp?.secteur_id);

  const myPaiements = paiements.filter((p) => p.proprietaire_id === currentProp?.id);
  const myValides = myPaiements.filter((p) => p.statut === 'valide');
  const myPending = myPaiements.filter((p) => p.statut === 'en_attente');
  const totalPaid = myValides.reduce((sum, p) => sum + Number(p.montant), 0);

  const recentPaiements = [...myPaiements]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0d2b1a] via-[#1a3a2a] to-[#2e7d50] p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-400/30 mb-3">
              <Home className="w-3.5 h-3.5" />
              <span>Lot {currentProp?.lot} · Îlot {currentProp?.ilot} · {currentSecteur?.nom}</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Bonjour, {currentProp?.nom.split(' ')[0]} 👋
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1">
              Bienvenue dans votre espace copropriétaire — Résidence Les Palmiers
            </p>
          </div>

          <div>
            <button
              onClick={() => onNavigate('payer')}
              className="px-5 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-forest-950 font-bold text-xs sm:text-sm transition-all shadow-lg flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Payer une cotisation</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Réglé</div>
          <div className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-forest-800">
            {totalPaid.toLocaleString('fr-FR')} <span className="text-xs font-sans font-normal text-gray-500">FCFA</span>
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">✓ Cotisations validées</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Paiements Confirmés</div>
          <div className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            {myValides.length} <span className="text-xs font-sans font-normal text-gray-500">quittances</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">Sur l'année en cours</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm col-span-2 sm:col-span-1">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500">En Traitement</div>
          <div className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-amber-600">
            {myPending.length}
          </div>
          <div className="text-xs text-amber-600 font-medium mt-1">
            {myPending.length > 0 ? 'En cours de validation' : 'Aucun paiement en attente'}
          </div>
        </div>
      </div>

      {/* Mes Services & Activités */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-gray-900">
            Services & Cotisations Résidentielles
          </h2>
          <span className="text-xs text-gray-400">Cliquez pour effectuer un règlement</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {activites.map((a) => {
            const latestPay = myPaiements
              .filter((p) => p.activite_id === a.id)
              .sort((x, y) => new Date(y.date).getTime() - new Date(x.date).getTime())[0];

            return (
              <div
                key={a.id}
                onClick={() => onSelectActiviteForPayment(a.id)}
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform origin-left">{a.icone}</div>
                  <div className="font-semibold text-xs text-gray-900 line-clamp-1">{a.nom}</div>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-50">
                  <div className="text-xs font-bold text-forest-800">
                    {Number(a.montant).toLocaleString('fr-FR')} F
                  </div>

                  <div className="mt-1">
                    {latestPay ? (
                      <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        latestPay.statut === 'valide'
                          ? 'bg-emerald-100 text-emerald-800'
                          : latestPay.statut === 'en_attente'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {latestPay.statut === 'valide' ? '✓ À jour' : latestPay.statut === 'en_attente' ? '⏳ En cours' : '✗ Rejeté'}
                      </span>
                    ) : (
                      <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-gray-100 text-gray-600">
                        Payer
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-serif text-base font-bold text-gray-900">
            Derniers Règlements Soumis
          </h2>
          <button
            onClick={() => onNavigate('historique')}
            className="text-xs text-emerald-700 hover:underline font-semibold"
          >
            Historique complet ({myPaiements.length})
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {recentPaiements.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-400">
              Vous n'avez pas encore enregistré de paiement.
            </div>
          ) : (
            recentPaiements.map((p) => {
              const act = activites.find((a) => a.id === p.activite_id);

              return (
                <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                      p.statut === 'valide' ? 'bg-emerald-50 text-emerald-700' : p.statut === 'en_attente' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {act?.icone || '💳'}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-900">{act?.nom}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(p.date).toLocaleDateString('fr-FR')} {p.valide_par ? `· Validé par ${p.valide_par}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-forest-800 text-sm">
                      {Number(p.montant).toLocaleString('fr-FR')} FCFA
                    </div>
                    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-0.5 ${
                      p.statut === 'valide' ? 'bg-emerald-100 text-emerald-800' : p.statut === 'en_attente' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {p.statut === 'valide' ? 'Validé' : p.statut === 'en_attente' ? 'En attente' : 'Rejeté'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
