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
  ChevronDown,
  LayoutGrid,
  X,
  KeyRound,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSupabaseConfig?: () => void;
  onOpenChangePassword?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenChangePassword,
}) => {
  const { user, role, switchRole, logout } = useAuth();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  const tabsByRole: Record<
    UserRole,
    { id: string; label: string; shortLabel: string; icon: string }[]
  > = {
    admin: [
      { id: 'dashboard', label: 'Tableau de bord', shortLabel: 'Accueil', icon: '📊' },
      { id: 'proprietaires', label: 'Propriétaires', shortLabel: 'Lots', icon: '🏠' },
      { id: 'secteurs', label: 'Secteurs', shortLabel: 'Secteurs', icon: '🗺️' },
      { id: 'activites', label: 'Activités', shortLabel: 'Activités', icon: '⚙️' },
      { id: 'paiements', label: 'Paiements', shortLabel: 'Entrées', icon: '💳' },
      { id: 'depenses', label: 'Dépenses & Caisse', shortLabel: 'Dépenses', icon: '📤' },
      { id: 'rapports', label: 'Rapports & Relevés', shortLabel: 'Rapports', icon: '📄' },
    ],
    responsable: [
      { id: 'dashboard', label: 'Tableau de bord', shortLabel: 'Accueil', icon: '📊' },
      { id: 'validations', label: 'Validations', shortLabel: 'Valider', icon: '✅' },
      { id: 'mon-secteur', label: 'Mon secteur', shortLabel: 'Secteur', icon: '🏘️' },
      { id: 'proprietaires', label: 'Propriétaires', shortLabel: 'Lots', icon: '🏠' },
      { id: 'secteurs', label: 'Secteurs', shortLabel: 'Secteurs', icon: '🗺️' },
      { id: 'activites', label: 'Activités', shortLabel: 'Activités', icon: '⚙️' },
      { id: 'paiements', label: 'Paiements', shortLabel: 'Entrées', icon: '💳' },
      { id: 'depenses', label: 'Dépenses & Caisse', shortLabel: 'Dépenses', icon: '📤' },
      { id: 'rapports', label: 'Rapports & Relevés', shortLabel: 'Rapports', icon: '📄' },
    ],
    proprietaire: [
      { id: 'dashboard', label: 'Accueil', shortLabel: 'Accueil', icon: '🏠' },
      { id: 'payer', label: 'Payer cotisation', shortLabel: 'Payer', icon: '💳' },
      { id: 'historique', label: 'Historique', shortLabel: 'Quittances', icon: '📋' },
      { id: 'rapports', label: 'Rapports & Relevés', shortLabel: 'Relevé', icon: '📄' },
      { id: 'profil', label: 'Mon profil', shortLabel: 'Profil', icon: '👤' },
    ],
  };

  const currentTabs = tabsByRole[role] || [];

  // Primary tabs shown directly in the mobile bottom bar (max 4 + Menu if > 5 tabs)
  const mobilePrimaryIds: Record<UserRole, string[]> = {
    admin: ['dashboard', 'paiements', 'depenses', 'rapports'],
    responsable: ['dashboard', 'validations', 'depenses', 'mon-secteur'],
    proprietaire: ['dashboard', 'payer', 'historique', 'rapports', 'profil'],
  };

  const primaryMobileTabs = mobilePrimaryIds[role]
    .map((id) => currentTabs.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const hasOverflowTabs = currentTabs.length > primaryMobileTabs.length;
  const isOverflowTabActive =
    hasOverflowTabs && !primaryMobileTabs.some((t) => t.id === currentTab);

  return (
    <>
      <header className="no-print sticky top-0 z-40 bg-[#163826] text-white shadow-lg border-b border-forest-700/50 pt-safe">
        {/* Top Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            {/* Logo & Brand */}
            <div
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 border border-emerald-400/40 flex items-center justify-center text-white font-bold shadow-md shadow-orange-950/30 shrink-0">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <div className="font-serif text-lg sm:text-xl font-extrabold tracking-tight flex items-center gap-1.5 truncate">
                  <span>
                    <span className="text-orange-400">SYNCOCI</span>{' '}
                    <span className="text-emerald-400">2</span>
                  </span>
                  <span className="hidden lg:inline-block text-[10px] uppercase font-sans tracking-widest px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-400/30">
                    PWA
                  </span>
                </div>
                <p className="text-[11px] font-medium text-emerald-300 hidden sm:block truncate">
                  Gestion des Copropriétaires de la Cité Ivoire 2
                </p>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* Quick Role Switcher */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-forest-800/80 hover:bg-forest-700 border border-forest-600/50 text-xs font-medium text-forest-100 transition-colors"
                >
                  {role === 'admin' && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                  {role === 'responsable' && <UserCheck className="w-4 h-4 text-amber-400" />}
                  {role === 'proprietaire' && <Home className="w-4 h-4 text-blue-400" />}
                  <span className="capitalize hidden xs:inline sm:inline">{role}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-forest-300" />
                </button>

                {showRoleDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowRoleDropdown(false)}
                    />
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-white text-gray-800 shadow-2xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                      onClick={() => setShowRoleDropdown(false)}
                    >
                      <div className="px-3 py-2 border-b border-gray-100 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        Changer de profil
                      </div>
                      <button
                        type="button"
                        onClick={() => switchRole('admin')}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-left hover:bg-forest-50 transition-colors ${
                          role === 'admin'
                            ? 'bg-forest-50/80 text-forest-800 font-semibold'
                            : 'text-gray-700'
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4 text-forest-600 shrink-0" />
                        <div>
                          <div>Administrateur</div>
                          <div className="text-[10px] text-gray-400 font-normal">
                            Gestion globale & validation dépenses
                          </div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => switchRole('responsable')}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-left hover:bg-forest-50 transition-colors ${
                          role === 'responsable'
                            ? 'bg-forest-50/80 text-forest-800 font-semibold'
                            : 'text-gray-700'
                        }`}
                      >
                        <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
                        <div>
                          <div>Responsable de secteur</div>
                          <div className="text-[10px] text-gray-400 font-normal">
                            Supervision secteur & saisie caisse
                          </div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => switchRole('proprietaire')}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-left hover:bg-forest-50 transition-colors ${
                          role === 'proprietaire'
                            ? 'bg-forest-50/80 text-forest-800 font-semibold'
                            : 'text-gray-700'
                        }`}
                      >
                        <Home className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <div>Copropriétaire</div>
                          <div className="text-[10px] text-gray-400 font-normal">
                            Espace résident & quittances
                          </div>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* User Info, Change Password & Logout */}
              <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-forest-700/60">
                <div className="w-8 h-8 rounded-full bg-forest-600 text-white text-xs font-semibold flex items-center justify-center shadow-inner">
                  {user?.initiales || 'AD'}
                </div>
                <div className="hidden lg:block text-left max-w-[140px]">
                  <div className="text-xs font-medium leading-none text-white truncate">
                    {user?.nom}
                  </div>
                  <div className="text-[10px] text-forest-300 mt-0.5 truncate">{user?.email}</div>
                </div>
                {onOpenChangePassword && (
                  <button
                    type="button"
                    onClick={onOpenChangePassword}
                    className="p-1.5 text-orange-300 hover:text-white hover:bg-forest-800 rounded-lg transition-colors"
                    title="Modifier mon mot de passe"
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
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

        {/* Tablet & Desktop Navigation Tabs */}
        <div className="hidden md:block border-t border-forest-700/40 bg-forest-900/70 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-1.5 overflow-x-auto py-2 no-scrollbar">
              {currentTabs.map((tab) => {
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onSelectTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium whitespace-nowrap transition-all ${
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

      {/* ===================================================================== */}
      {/* NATIVE PWA MOBILE BOTTOM NAVIGATION BAR (< 768px)                     */}
      {/* ===================================================================== */}
      <nav
        aria-label="Navigation mobile"
        className="no-print md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe"
      >
        <div
          className={`grid ${
            hasOverflowTabs ? 'grid-cols-5' : `grid-cols-${primaryMobileTabs.length}`
          } h-16 px-1`}
          style={{
            gridTemplateColumns: `repeat(${
              primaryMobileTabs.length + (hasOverflowTabs ? 1 : 0)
            }, minmax(0, 1fr))`,
          }}
        >
          {primaryMobileTabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setShowMobileDrawer(false);
                  onSelectTab(tab.id);
                }}
                className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition-colors ${
                  isActive ? 'text-forest-800 font-bold' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <span
                  className={`text-base px-2.5 py-0.5 rounded-full transition-all ${
                    isActive ? 'bg-emerald-100 scale-105' : ''
                  }`}
                >
                  {tab.icon}
                </span>
                <span className="text-[10px] leading-tight truncate max-w-full px-1">
                  {tab.shortLabel}
                </span>
              </button>
            );
          })}

          {hasOverflowTabs && (
            <button
              type="button"
              onClick={() => setShowMobileDrawer(!showMobileDrawer)}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition-colors ${
                isOverflowTabActive || showMobileDrawer
                  ? 'text-forest-800 font-bold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <span
                className={`p-1 rounded-full transition-all ${
                  isOverflowTabActive || showMobileDrawer ? 'bg-emerald-100 text-forest-800' : ''
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </span>
              <span className="text-[10px] leading-tight">Menu</span>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Full Menu Sheet (when tapping "Menu" on Admin / Responsable) */}
      {showMobileDrawer && (
        <div
          className="no-print md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end"
          onClick={() => setShowMobileDrawer(false)}
        >
          <div
            className="bg-white w-full rounded-t-3xl p-5 pb-8 space-y-4 shadow-2xl animate-in slide-in-from-bottom-5 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="font-serif text-base font-bold">
                  <span className="text-orange-500">SYNCOCI</span>{' '}
                  <span className="text-emerald-500">2</span>
                </h3>
                <p className="text-[11px] text-gray-500">
                  Connecté en tant que {user?.nom} ({role})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileDrawer(false)}
                className="p-1.5 rounded-full bg-gray-100 text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {currentTabs.map((tab) => {
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      onSelectTab(tab.id);
                      setShowMobileDrawer(false);
                    }}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-center transition-all ${
                      isActive
                        ? 'bg-forest-800 text-white border-forest-800 shadow-md font-bold'
                        : 'bg-gray-50 text-gray-700 border-gray-100 hover:bg-emerald-50/50'
                    }`}
                  >
                    <span className="text-xl">{tab.icon}</span>
                    <span className="text-[11px] leading-tight line-clamp-2">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
