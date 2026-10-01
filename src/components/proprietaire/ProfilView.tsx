'use client';

import React from 'react';
import { Secteur, Proprietaire, Paiement, CurrentUser } from '@/types/database';
import { useAuth } from '@/context/AuthContext';
import { User, Phone, Mail, Home, MapPin, ShieldCheck, LogOut, CheckCircle2 } from 'lucide-react';

interface ProfilViewProps {
  currentUser: CurrentUser;
  secteurs: Secteur[];
  proprietaires: Proprietaire[];
  paiements: Paiement[];
}

export const ProfilView: React.FC<ProfilViewProps> = ({
  currentUser,
  secteurs,
  proprietaires,
  paiements,
}) => {
  const { logout } = useAuth();
  const currentProp = proprietaires.find((p) => p.id === currentUser.proprietaire_id) || proprietaires[0];
  const currentSecteur = secteurs.find((s) => s.id === currentProp?.secteur_id);

  const myPaiements = paiements.filter((p) => p.proprietaire_id === currentProp?.id);
  const myValides = myPaiements.filter((p) => p.statut === 'valide');
  const totalPaid = myValides.reduce((sum, p) => sum + Number(p.montant), 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-gray-900">
          Mon Profil Copropriétaire
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Fiche d'identification et récapitulatif de votre lot
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        {/* Header Avatar */}
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-forest-600 to-forest-800 text-white font-serif text-2xl font-bold flex items-center justify-center shadow-lg shadow-forest-900/20">
            {currentProp?.nom.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-gray-900">{currentProp?.nom}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-mono font-bold text-xs border border-emerald-200">
                LOT {currentProp?.lot}
              </span>
              <span className="text-xs text-gray-500">Îlot {currentProp?.ilot}</span>
            </div>
          </div>
        </div>

        {/* Detailed Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3">
            <MapPin className="w-4 h-4 text-forest-700 shrink-0" />
            <div>
              <span className="text-gray-400 font-medium">Secteur géographique</span>
              <div className="font-semibold text-gray-900 text-sm mt-0.5">{currentSecteur?.nom || '—'}</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-forest-700 shrink-0" />
            <div>
              <span className="text-gray-400 font-medium">Responsable de secteur</span>
              <div className="font-semibold text-gray-900 text-sm mt-0.5">{currentSecteur?.responsable || '—'}</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3">
            <Phone className="w-4 h-4 text-forest-700 shrink-0" />
            <div>
              <span className="text-gray-400 font-medium">Téléphone portable</span>
              <div className="font-semibold text-gray-900 text-sm mt-0.5">{currentProp?.tel}</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3">
            <Mail className="w-4 h-4 text-forest-700 shrink-0" />
            <div className="truncate">
              <span className="text-gray-400 font-medium">Adresse email</span>
              <div className="font-semibold text-gray-900 text-sm mt-0.5 truncate">{currentProp?.email}</div>
            </div>
          </div>
        </div>

        {/* Financial stats */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <div className="text-[10px] uppercase font-bold text-forest-700">Total cotisations versées</div>
            <div className="font-serif text-xl font-bold text-forest-900 mt-1">
              {totalPaid.toLocaleString('fr-FR')} <span className="text-xs font-sans font-normal text-gray-600">FCFA</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
            <div className="text-[10px] uppercase font-bold text-gray-500">Nombre de règlements</div>
            <div className="font-serif text-xl font-bold text-gray-900 mt-1">
              {myPaiements.length} <span className="text-xs font-sans font-normal text-gray-500">opérations</span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full py-3 px-4 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold flex items-center justify-center gap-2 transition-colors mt-4"
        >
          <LogOut className="w-4 h-4" />
          <span>Se déconnecter de l'espace</span>
        </button>
      </div>
    </div>
  );
};
