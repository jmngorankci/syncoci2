'use client';

import React from 'react';
import { Secteur, Proprietaire, Activite, Paiement } from '@/types/database';
import { 
  Users, 
  Wallet, 
  Clock, 
  Layers, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle,
  TrendingUp,
  MapPin,
  Calendar
} from 'lucide-react';

interface AdminDashboardProps {
  secteurs: Secteur[];
  proprietaires: Proprietaire[];
  activites: Activite[];
  paiements: Paiement[];
  onNavigate: (tab: string) => void;
  onValidatePayment: (id: string) => void;
  onRejectPayment: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  secteurs,
  proprietaires,
  activites,
  paiements,
  onNavigate,
  onValidatePayment,
  onRejectPayment,
}) => {
  const totalEncaissed = paiements
    .filter((p) => p.statut === 'valide')
    .reduce((sum, p) => sum + Number(p.montant), 0);

  const pendingPaiements = paiements.filter((p) => p.statut === 'en_attente');
  const pendingAmount = pendingPaiements.reduce((sum, p) => sum + Number(p.montant), 0);

  const recentPaiements = [...paiements]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  const recoveryRate = paiements.length > 0 
    ? Math.round((paiements.filter(p => p.statut === 'valide').length / paiements.length) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d2b1a] via-[#1a3a2a] to-[#256040] p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-400/30 mb-3">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Tableau de Bord Syndic
              </h1>
              <p className="text-sm text-forest-200 mt-1 max-w-xl">
                Supervision globale de la Résidence Les Palmiers — 4 Secteurs, {proprietaires.length} Copropriétaires actifs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('paiements')}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-forest-950 text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <span>Gérer les paiements</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Encaissé */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Encaissé</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 font-serif text-2xl sm:text-3xl font-bold text-forest-800">
            {totalEncaissed.toLocaleString('fr-FR')} <span className="text-sm font-sans font-normal text-gray-500">FCFA</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Taux de recouvrement: {recoveryRate}%</span>
          </div>
        </div>

        {/* En Attente */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">En attente</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 font-serif text-2xl sm:text-3xl font-bold text-amber-600">
            {pendingPaiements.length} <span className="text-sm font-sans font-normal text-gray-500">paiements</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Montant : {pendingAmount.toLocaleString('fr-FR')} FCFA
          </div>
        </div>

        {/* Copropriétaires */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Propriétaires</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            {proprietaires.length} <span className="text-sm font-sans font-normal text-gray-500">lots</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Répartis sur {secteurs.length} secteurs
          </div>
        </div>

        {/* Activités */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Services & Cotisations</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            {activites.length} <span className="text-sm font-sans font-normal text-gray-500">activités</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Gardiennage, Voirie, Déchets...
          </div>
        </div>
      </div>

      {/* Grid: Secteurs & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Secteurs overview */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-forest-700" />
              Progression par Secteur
            </h2>
            <button
              onClick={() => onNavigate('secteurs')}
              className="text-xs text-emerald-700 hover:underline font-semibold"
            >
              Voir tout
            </button>
          </div>

          <div className="space-y-3">
            {secteurs.map((s) => {
              const sectProps = proprietaires.filter((p) => p.secteur_id === s.id);
              const sectPropsIds = sectProps.map((p) => p.id);
              const sectPaiements = paiements.filter(
                (p) => sectPropsIds.includes(p.proprietaire_id) && p.statut === 'valide'
              );
              const maxExpected = Math.max(sectProps.length * activites.length, 1);
              const percent = Math.min(Math.round((sectPaiements.length / maxExpected) * 100), 100);

              return (
                <div key={s.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{s.nom}</div>
                      <div className="text-xs text-gray-400">Resp. : {s.responsable} · {sectProps.length} lots</div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      percent > 70 ? 'bg-emerald-100 text-emerald-800' : percent > 40 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {percent}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-500">
                    <span>{sectPaiements.length} cotisations réglées</span>
                    <span>{sectProps.length} propriétaires</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Derniers paiements */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-forest-700" />
              Dernières Transactions
            </h2>
            <button
              onClick={() => onNavigate('paiements')}
              className="text-xs text-emerald-700 hover:underline font-semibold"
            >
              Tous les paiements ({paiements.length})
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {recentPaiements.map((p) => {
                const prop = proprietaires.find((pr) => pr.id === p.proprietaire_id);
                const act = activites.find((a) => a.id === p.activite_id);

                return (
                  <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50/60 transition-colors">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                        p.statut === 'valide' ? 'bg-emerald-50 text-emerald-700' : p.statut === 'en_attente' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {act?.icone || '💳'}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <span>{prop?.nom || 'Copropriétaire'}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">Lot {prop?.lot}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {act?.nom} · {new Date(p.date).toLocaleDateString('fr-FR')} {p.mode_paiement ? `· ${p.mode_paiement}` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-bold text-forest-800">
                          {Number(p.montant).toLocaleString('fr-FR')} FCFA
                        </div>
                        <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          p.statut === 'valide' ? 'bg-emerald-100 text-emerald-800' : p.statut === 'en_attente' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {p.statut === 'valide' ? 'Validé' : p.statut === 'en_attente' ? 'En attente' : 'Rejeté'}
                        </span>
                      </div>

                      {p.statut === 'en_attente' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onValidatePayment(p.id)}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                            title="Valider"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onRejectPayment(p.id)}
                            className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                            title="Rejeter"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
