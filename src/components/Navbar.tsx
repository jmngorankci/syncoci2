'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/database';
import { 
  Building2, 
  LogOut, 
  ShieldCheck, 
  UserCheck, 
  Home, 
  Database,
  Layers,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSupabaseConfig: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onOpenSupabaseConfig }) => {
  const { user, role, switchRole, logout, isSupabaseLive } = useAuth();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const tabsByRole: Record<UserRole, { id: string; label: string; icon: string }[]> = {
    admin: [
      { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
      { id: 'proprietaires', label: 'Propriétaires', icon: '🏠' },
      { id: 'secteurs', label: 'Secteurs', icon: '🗺️' },
      { id: 'activites', label: 'Activités', icon: '⚙️' },
      { id: 'paiements', label: 'Paiements', icon: '💳' },
      { id: 'rapports', label: 'Rapports', icon: '📈' },
    ],
    responsable: [
      { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
      { id: 'validations', label: 'Validations', icon: '✅' },
      { id: 'mon-secteur', label: 'Mon secteur', icon: '🏘️' },
      { id: 'rapports', label: 'Rapports', icon: '📈' },
    ],
    proprietaire: [
      { id: 'dashboard', label: 'Accueil', icon: '🏠' },
      { id: 'payer', label: 'Payer cotisation', icon: '💳' },
      { id: 'historique', label: 'Historique', icon: '📋' },
      { id: 'profil', label: 'Mon profil', icon: '👤' },
    ],
  };

  const currentTabs = tabsByRole[role] || [];

  return (
    <header className="sticky top-0 z-40 bg-[#163826] text-white shadow-lg border-b border-forest-700/50">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forest-500 to-forest-300 flex items-center justify-center text-forest-950 font-bold shadow-md shadow-forest-950/20">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-serif text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Syndic<span className="text-emerald-300 font-normal">Cité</span>
                <span className="text-[10px] uppercase font-sans tracking-widest px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-700/40">
                  Next.js + Supabase
                </span>
              </div>
              <p className="text-xs text-forest-200/80 hidden sm:block">Résidence Les Palmiers</p>
            </div>
          </div>

          {/* Center/Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Supabase Status Indicator */}
            <button
              onClick={onOpenSupabaseConfig}
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all ${
                isSupabaseLive
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-amber-950/60 border-amber-500/50 text-amber-300 hover:bg-amber-900/60'
              }`}
              title="État de la connexion Supabase"
            >
              <Database className={`w-3.5 h-3.5 ${isSupabaseLive ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
              <span className="hidden md:inline">
                {isSupabaseLive ? 'Supabase Connecté' : 'Mode Démo / Local'}
              </span>
              <span className="md:hidden font-mono text-[10px]">
                {isSupabaseLive ? 'LIVE' : 'DEMO'}
              </span>
            </button>

            {/* Quick Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-forest-800/80 hover:bg-forest-700 border border-forest-600/50 text-xs font-medium text-forest-100 transition-colors"
              >
                {role === 'admin' && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                {role === 'responsable' && <UserCheck className="w-4 h-4 text-amber-400" />}
                {role === 'proprietaire' && <Home className="w-4 h-4 text-blue-400" />}
                <span className="capitalize hidden sm:inline">{role}</span>
                <ChevronDown className="w-3.5 h-3.5 text-forest-300" />
              </button>

              {showRoleDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-52 rounded-xl bg-white text-gray-800 shadow-2xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setShowRoleDropdown(false)}
                >
                  <div className="px-3 py-2 border-b border-gray-100 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Changer de profil
                  </div>
                  <button
                    onClick={() => switchRole('admin')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left hover:bg-forest-50 transition-colors ${role === 'admin' ? 'bg-forest-50/80 text-forest-800 font-semibold' : 'text-gray-700'}`}
                  >
                    <ShieldCheck className="w-4 h-4 text-forest-600" />
                    <div>
                      <div>Administrateur</div>
                      <div className="text-[10px] text-gray-400 font-normal">Gestion globale</div>
                    </div>
                  </button>
                  <button
                    onClick={() => switchRole('responsable')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left hover:bg-forest-50 transition-colors ${role === 'responsable' ? 'bg-forest-50/80 text-forest-800 font-semibold' : 'text-gray-700'}`}
                  >
                    <UserCheck className="w-4 h-4 text-amber-600" />
                    <div>
                      <div>Responsable de secteur</div>
                      <div className="text-[10px] text-gray-400 font-normal">Kofi Asante (Secteur A)</div>
                    </div>
                  </button>
                  <button
                    onClick={() => switchRole('proprietaire')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left hover:bg-forest-50 transition-colors ${role === 'proprietaire' ? 'bg-forest-50/80 text-forest-800 font-semibold' : 'text-gray-700'}`}
                  >
                    <Home className="w-4 h-4 text-blue-600" />
                    <div>
                      <div>Propriétaire</div>
                      <div className="text-[10px] text-gray-400 font-normal">Kouamé Brou (Lot A01)</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-forest-700/60">
              <div className="w-8 h-8 rounded-full bg-forest-600 text-white text-xs font-semibold flex items-center justify-center shadow-inner">
                {user?.initiales || 'AD'}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-medium leading-none text-white">{user?.nom}</div>
                <div className="text-[10px] text-forest-300 mt-0.5">{user?.email}</div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-forest-300 hover:text-white hover:bg-forest-800 rounded-lg transition-colors"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-t border-forest-700/40 bg-forest-900/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar">
            {currentTabs.map((tab) => {
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                      : 'text-forest-200 hover:text-white hover:bg-forest-800/60'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
