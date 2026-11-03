'use client';

import React, { useState, useEffect } from 'react';
import {
  CurrentUser,
  UserRole,
  Secteur,
  Proprietaire,
  Activite,
  Paiement,
  Depense,
  RubriqueDepense,
} from '@/types/database';
import { RelevePaiementsModule } from './RelevePaiementsModule';
import { BilanTresorerieModule } from './BilanTresorerieModule';
import { RapportsFinanciers } from '../admin/RapportsFinanciers';
import { FileText, TrendingUp, Scale } from 'lucide-react';

interface RapportsViewProps {
  currentUser?: CurrentUser | null;
  role: UserRole;
  secteurs: Secteur[];
  proprietaires: Proprietaire[];
  activites: Activite[];
  paiements: Paiement[];
  depenses?: Depense[];
  rubriques?: RubriqueDepense[];
  preselectedPropId?: string | null;
  initialSubTab?: 'releve' | 'bilan' | 'synthese';
}

export const RapportsView: React.FC<RapportsViewProps> = ({
  currentUser,
  role,
  secteurs,
  proprietaires,
  activites,
  paiements,
  depenses = [],
  rubriques = [],
  preselectedPropId,
  initialSubTab = 'releve',
}) => {
  const [activeTab, setActiveTab] = useState<'releve' | 'bilan' | 'synthese'>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Règle de confidentialité : Les copropriétaires accèdent uniquement à leur relevé personnel
  if (role === 'proprietaire') {
    return (
      <RelevePaiementsModule
        currentUser={currentUser}
        role={role}
        secteurs={secteurs}
        proprietaires={proprietaires}
        activites={activites}
        paiements={paiements}
        preselectedPropId={preselectedPropId}
      />
    );
  }

  // Bureau du Syndic (Admin + Responsables)
  return (
    <div className="space-y-6">
      <div className="no-print bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm inline-flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setActiveTab('releve')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'releve'
              ? 'bg-forest-800 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <FileText
            className={`w-4 h-4 ${activeTab === 'releve' ? 'text-emerald-400' : 'text-gray-500'}`}
          />
          <span>État des Paiements par Propriétaire (PDF)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bilan')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'bilan'
              ? 'bg-forest-800 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Scale
            className={`w-4 h-4 ${activeTab === 'bilan' ? 'text-emerald-400' : 'text-gray-500'}`}
          />
          <span>Bilan Entrées / Sorties (PDF)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('synthese')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'synthese'
              ? 'bg-forest-800 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <TrendingUp
            className={`w-4 h-4 ${activeTab === 'synthese' ? 'text-emerald-400' : 'text-gray-500'}`}
          />
          <span>Synthèse Financière Globale</span>
        </button>
      </div>

      {activeTab === 'releve' && (
        <RelevePaiementsModule
          currentUser={currentUser}
          role={role}
          secteurs={secteurs}
          proprietaires={proprietaires}
          activites={activites}
          paiements={paiements}
          preselectedPropId={preselectedPropId}
        />
      )}

      {activeTab === 'bilan' && (
        <BilanTresorerieModule
          secteurs={secteurs}
          proprietaires={proprietaires}
          activites={activites}
          paiements={paiements}
          depenses={depenses}
          rubriques={rubriques}
        />
      )}

      {activeTab === 'synthese' && (
        <RapportsFinanciers
          secteurs={secteurs}
          proprietaires={proprietaires}
          activites={activites}
          paiements={paiements}
          depenses={depenses}
          rubriques={rubriques}
        />
      )}
    </div>
  );
};
