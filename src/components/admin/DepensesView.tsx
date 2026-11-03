'use client';

import React, { useState, useMemo } from 'react';
import {
  Depense,
  RubriqueDepense,
  Paiement,
  Activite,
  Secteur,
  UserRole,
  CurrentUser,
} from '@/types/database';
import { FAMILLES_RUBRIQUES_LABELS } from '@/lib/defaultRubriques';
import {
  Plus,
  Search,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  Check,
  X,
  Edit2,
  Trash2,
  FolderKanban,
  Receipt,
  CheckCircle2,
  XCircle,
  Lock,
  Power,
  FilterX,
} from 'lucide-react';

interface DepensesViewProps {
  currentUser: CurrentUser;
  role: UserRole;
  depenses: Depense[];
  rubriques: RubriqueDepense[];
  paiements: Paiement[];
  activites: Activite[];
  secteurs: Secteur[];
  onOpenAddDepense: () => void;
  onOpenEditDepense: (dep: Depense) => void;
  onDeleteDepense: (dep: Depense) => void;
  onValidateDepense: (id: string) => void;
  onRejectDepense: (id: string) => void;
  onOpenAddRubrique: () => void;
  onOpenEditRubrique: (rub: RubriqueDepense) => void;
  onToggleRubriqueStatut: (rub: RubriqueDepense) => void;
  onDeleteRubrique: (rub: RubriqueDepense) => void;
  onNavigateToBilan?: () => void;
}

export const DepensesView: React.FC<DepensesViewProps> = ({
  role,
  depenses,
  rubriques,
  paiements,
  activites,
  secteurs,
  onOpenAddDepense,
  onOpenEditDepense,
  onDeleteDepense,
  onValidateDepense,
  onRejectDepense,
  onOpenAddRubrique,
  onOpenEditRubrique,
  onToggleRubriqueStatut,
  onDeleteRubrique,
  onNavigateToBilan,
}) => {
  const [subTab, setSubTab] = useState<'journal' | 'rubriques'>('journal');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [rubriqueFilter, setRubriqueFilter] = useState<string>('all');
  const [statutFilter, setStatutFilter] = useState<'all' | 'valide' | 'en_attente' | 'rejete'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const isAdmin = role === 'admin';

  // Global Cash Calculations
  const totalEntreesValidees = useMemo(() => {
    return paiements
      .filter((p) => p.statut === 'valide')
      .reduce((sum, p) => sum + Number(p.montant), 0);
  }, [paiements]);

  const totalSortiesValidees = useMemo(() => {
    return depenses
      .filter((d) => d.statut === 'valide')
      .reduce((sum, d) => sum + Number(d.montant), 0);
  }, [depenses]);

  const soldeNetCaisse = totalEntreesValidees - totalSortiesValidees;

  const pendingDepenses = useMemo(() => {
    return depenses.filter((d) => d.statut === 'en_attente');
  }, [depenses]);

  const totalPendingAmount = useMemo(() => {
    return pendingDepenses.reduce((sum, d) => sum + Number(d.montant), 0);
  }, [pendingDepenses]);

  // Current month key YYYY-MM for monthly budget tracking
  const currentMonthPrefix = new Date().toISOString().slice(0, 7);

  // Filtered expenses for the journal
  const filteredDepenses = useMemo(() => {
    return depenses
      .filter((d) => {
        if (rubriqueFilter !== 'all' && d.rubrique_id !== rubriqueFilter) return false;
        if (statutFilter !== 'all' && d.statut !== statutFilter) return false;
        if (startDate && d.date < startDate) return false;
        if (endDate && d.date > endDate) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const rub = rubriques.find((r) => r.id === d.rubrique_id);
          return (
            d.libelle.toLowerCase().includes(q) ||
            (d.beneficiaire || '').toLowerCase().includes(q) ||
            (d.reference_piece || '').toLowerCase().includes(q) ||
            d.id.toLowerCase().includes(q) ||
            (rub?.nom || '').toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [depenses, rubriqueFilter, statutFilter, startDate, endDate, searchQuery, rubriques]);

  const totalFilteredValid = useMemo(() => {
    return filteredDepenses
      .filter((d) => d.statut === 'valide')
      .reduce((sum, d) => sum + Number(d.montant), 0);
  }, [filteredDepenses]);

  const hasActiveFilters =
    searchQuery !== '' ||
    rubriqueFilter !== 'all' ||
    statutFilter !== 'all' ||
    startDate !== '' ||
    endDate !== '';

  const resetFilters = () => {
    setSearchQuery('');
    setRubriqueFilter('all');
    setStatutFilter('all');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">
            Dépenses & Sorties de Caisse
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Suivi des décaissements du syndic, contrôle budgétaire par rubrique et solde de trésorerie
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onNavigateToBilan && (
            <button
              type="button"
              onClick={onNavigateToBilan}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-forest-800 border border-gray-200 text-xs sm:text-sm font-semibold shadow-sm transition-all"
            >
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>Bilan Entrées / Sorties (PDF)</span>
            </button>
          )}

          {subTab === 'rubriques' && isAdmin ? (
            <button
              type="button"
              onClick={onOpenAddRubrique}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs sm:text-sm font-semibold shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle rubrique</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAddDepense}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Enregistrer une dépense</span>
            </button>
          )}
        </div>
      </div>

      {/* Treasury KPI Cards (Entrées - Sorties = Solde) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Entrées */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Total Entrées (Validées)
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ArrowUpCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 font-serif text-2xl font-bold text-forest-800">
            {totalEntreesValidees.toLocaleString('fr-FR')}{' '}
            <span className="text-xs font-sans font-normal text-gray-500">FCFA</span>
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            Cotisations copropriétaires encaissées
          </div>
        </div>

        {/* Total Sorties */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Total Sorties (Validées)
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 font-serif text-2xl font-bold text-rose-700">
            {totalSortiesValidees.toLocaleString('fr-FR')}{' '}
            <span className="text-xs font-sans font-normal text-gray-500">FCFA</span>
          </div>
          <div className="text-xs text-rose-600 font-medium mt-1">
            {depenses.filter((d) => d.statut === 'valide').length} opération(s) décaissée(s)
          </div>
        </div>

        {/* Solde Net en Caisse */}
        <div
          className={`rounded-2xl p-5 border shadow-sm ${
            soldeNetCaisse >= 0
              ? 'bg-gradient-to-br from-[#0d2b1a] to-[#1e4b32] text-white border-forest-800'
              : 'bg-rose-950 text-white border-rose-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              Solde Net en Caisse
            </span>
            <div className="w-9 h-9 rounded-xl bg-white/10 text-emerald-300 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 font-serif text-2xl font-bold text-white">
            {soldeNetCaisse.toLocaleString('fr-FR')}{' '}
            <span className="text-xs font-sans font-normal text-emerald-200">FCFA</span>
          </div>
          <div className="text-xs text-emerald-300 font-medium mt-1">
            {soldeNetCaisse >= 0 ? 'Trésorerie disponible' : 'Déficit de trésorerie'}
          </div>
        </div>

        {/* En attente validation Admin */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Sorties en Attente
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 font-serif text-2xl font-bold text-amber-600">
            {pendingDepenses.length}{' '}
            <span className="text-xs font-sans font-normal text-gray-500">écriture(s)</span>
          </div>
          <div className="text-xs text-amber-600 font-medium mt-1">
            Cumul : {totalPendingAmount.toLocaleString('fr-FR')} FCFA
          </div>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm flex sm:inline-flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full">
        <button
          type="button"
          onClick={() => setSubTab('journal')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            subTab === 'journal'
              ? 'bg-forest-800 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Receipt className={`w-4 h-4 ${subTab === 'journal' ? 'text-emerald-400' : 'text-gray-500'}`} />
          <span>Journal des Sorties ({depenses.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('rubriques')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            subTab === 'rubriques'
              ? 'bg-forest-800 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <FolderKanban
            className={`w-4 h-4 ${subTab === 'rubriques' ? 'text-emerald-400' : 'text-gray-500'}`}
          />
          <span>Rubriques ({rubriques.length})</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: JOURNAL DES SORTIES DE CAISSE                                  */}
      {/* ===================================================================== */}
      {subTab === 'journal' && (
        <div className="space-y-6">
          {/* Admin Urgent Approval Box for Responsable-submitted expenses */}
          {isAdmin && pendingDepenses.length > 0 && (
            <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 bg-amber-50/70 border-b border-amber-100 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>
                    Dépenses soumises en attente de votre validation ({pendingDepenses.length})
                  </span>
                </h2>
                <span className="text-xs font-semibold text-amber-800">
                  Total à approuver : {totalPendingAmount.toLocaleString('fr-FR')} FCFA
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {pendingDepenses.map((d) => {
                  const rub = rubriques.find((r) => r.id === d.rubrique_id);
                  return (
                    <div
                      key={d.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-amber-50/20"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-lg shrink-0">
                          {rub?.icone || '📤'}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm flex flex-wrap items-center gap-2">
                            <span>{d.libelle}</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">
                              {rub?.nom || d.rubrique_id}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Saisi par <strong>{d.enregistre_par || 'Responsable'}</strong> · Le{' '}
                            {new Date(d.date).toLocaleDateString('fr-FR')}
                            {d.beneficiaire ? ` · Bénéficiaire : ${d.beneficiaire}` : ''}
                            {d.reference_piece ? ` · Pièce : ${d.reference_piece}` : ''}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <div className="font-serif text-base font-bold text-rose-700">
                          -{Number(d.montant).toLocaleString('fr-FR')} FCFA
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onValidateDepense(d.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Valider</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onRejectDepense(d.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-colors"
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

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher motif, fournisseur, N° pièce..."
                  className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
                />
              </div>

              {/* Rubrique Filter */}
              <div>
                <select
                  value={rubriqueFilter}
                  onChange={(e) => setRubriqueFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
                >
                  <option value="all">Toutes les rubriques</option>
                  {rubriques.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.icone} {r.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Statut Filter */}
              <div>
                <select
                  value={statutFilter}
                  onChange={(e) =>
                    setStatutFilter(e.target.value as 'all' | 'valide' | 'en_attente' | 'rejete')
                  }
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="valide">✅ Validées</option>
                  <option value="en_attente">⏳ En attente</option>
                  <option value="rejete">❌ Rejetées</option>
                </select>
              </div>

              {/* Date Range */}
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  title="Date début"
                  className="w-full px-2 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  title="Date fin"
                  className="w-full px-2 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                <span className="text-gray-500">
                  <strong>{filteredDepenses.length}</strong> écriture(s) trouvée(s) · Cumul validé
                  filtré :{' '}
                  <strong className="text-rose-700">
                    {totalFilteredValid.toLocaleString('fr-FR')} FCFA
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 text-forest-700 hover:underline font-semibold"
                >
                  <FilterX className="w-3.5 h-3.5" />
                  <span>Réinitialiser les filtres</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Expenses Cards (< 768px) */}
          <div className="md:hidden space-y-3">
            {filteredDepenses.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-xs border border-gray-100">
                Aucune opération de dépense enregistrée pour ces critères.
              </div>
            ) : (
              filteredDepenses.map((d) => {
                const rub = rubriques.find((r) => r.id === d.rubrique_id);
                const sect = secteurs.find((s) => s.id === d.secteur_id);
                const canModify = isAdmin || d.statut === 'en_attente';

                return (
                  <div
                    key={d.id}
                    className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-gray-50 border border-gray-200 text-[11px] font-semibold text-gray-700 mb-1">
                          <span>{rub?.icone || '📋'}</span>
                          <span className="truncate">{rub?.nom || d.rubrique_id}</span>
                        </div>
                        <div className="font-semibold text-sm text-gray-900">{d.libelle}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-serif font-bold text-rose-700 text-base">
                          -{Number(d.montant).toLocaleString('fr-FR')} F
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {new Date(d.date).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs space-y-1">
                      <div className="flex items-center justify-between text-gray-600">
                        <span>{d.beneficiaire || 'Prestataire non précisé'}</span>
                        <span className="font-mono text-[11px] text-gray-400">
                          {d.reference_piece || d.id}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>
                          {d.mode_paiement || 'Caisse'} · {sect ? sect.nom : 'Charges communes'}
                        </span>
                        <span
                          className={`font-bold ${
                            d.statut === 'valide'
                              ? 'text-emerald-700'
                              : d.statut === 'en_attente'
                              ? 'text-amber-700'
                              : 'text-red-700'
                          }`}
                        >
                          {d.statut === 'valide'
                            ? '✓ Validée'
                            : d.statut === 'en_attente'
                            ? '⏳ En attente'
                            : '✕ Rejetée'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-0.5">
                      {isAdmin && d.statut === 'en_attente' && (
                        <>
                          <button
                            type="button"
                            onClick={() => onValidateDepense(d.id)}
                            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Valider</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onRejectDepense(d.id)}
                            className="py-2 px-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-bold flex items-center justify-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Rejeter</span>
                          </button>
                        </>
                      )}

                      {canModify ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onOpenEditDepense(d)}
                            className="p-2 rounded-xl border border-gray-200 text-forest-800"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteDepense(d)}
                            className="p-2 rounded-xl border border-red-200 bg-red-50/60 text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                          <Lock className="w-3 h-3" />
                          <span>Verrouillé</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Expenses Table (>= 768px) */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/80 text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="py-3.5 px-4">Date & N°</th>
                    <th className="py-3.5 px-4">Rubrique</th>
                    <th className="py-3.5 px-4">Motif & Bénéficiaire</th>
                    <th className="py-3.5 px-4">Règlement & Pièce</th>
                    <th className="py-3.5 px-4">Montant</th>
                    <th className="py-3.5 px-4">Statut</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {filteredDepenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400 text-xs">
                        Aucune opération de dépense enregistrée pour ces critères.
                      </td>
                    </tr>
                  ) : (
                    filteredDepenses.map((d) => {
                      const rub = rubriques.find((r) => r.id === d.rubrique_id);
                      const sect = secteurs.find((s) => s.id === d.secteur_id);
                      const act = activites.find((a) => a.id === d.activite_id);
                      const canModify = isAdmin || d.statut === 'en_attente';

                      return (
                        <tr key={d.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-semibold text-gray-900 text-xs">
                              {new Date(d.date).toLocaleDateString('fr-FR')}
                            </div>
                            <div className="text-[11px] text-gray-400 font-mono">{d.id}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-800">
                              <span>{rub?.icone || '📋'}</span>
                              <span>{rub?.nom || d.rubrique_id}</span>
                            </div>
                            <div className="text-[10px] text-gray-400 mt-1">
                              {sect ? sect.nom : 'Charges communes'}
                              {act ? ` · ${act.nom}` : ''}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-semibold text-gray-900 text-xs sm:text-sm">
                              {d.libelle}
                            </div>
                            {d.beneficiaire && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                Prestataire : <span className="font-medium">{d.beneficiaire}</span>
                              </div>
                            )}
                            {d.note && (
                              <div className="text-[11px] text-gray-400 italic line-clamp-1 mt-0.5">
                                {d.note}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-xs">
                            <div className="font-medium text-gray-700">
                              {d.mode_paiement || 'Espèces (Caisse)'}
                            </div>
                            {d.reference_piece ? (
                              <div className="text-[11px] font-mono text-gray-500 mt-0.5">
                                Pièce : {d.reference_piece}
                              </div>
                            ) : (
                              <div className="text-[11px] text-gray-400 mt-0.5">Sans réf. pièce</div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-serif font-bold text-rose-700 text-sm">
                              -{Number(d.montant).toLocaleString('fr-FR')} F
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {d.statut === 'valide' && (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Validée
                                </span>
                                {d.valide_par && (
                                  <div className="text-[10px] text-gray-400 mt-0.5">
                                    par {d.valide_par}
                                  </div>
                                )}
                              </div>
                            )}
                            {d.statut === 'en_attente' && (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  En attente Admin
                                </span>
                                {d.enregistre_par && (
                                  <div className="text-[10px] text-gray-400 mt-0.5">
                                    par {d.enregistre_par}
                                  </div>
                                )}
                              </div>
                            )}
                            {d.statut === 'rejete' && (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-800 border border-red-200 text-xs font-semibold">
                                  <XCircle className="w-3 h-3 text-red-600" />
                                  Rejetée
                                </span>
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {isAdmin && d.statut === 'en_attente' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => onValidateDepense(d.id)}
                                    title="Valider la sortie de caisse"
                                    className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onRejectDepense(d.id)}
                                    title="Rejeter la dépense"
                                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}

                              {canModify ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => onOpenEditDepense(d)}
                                    title="Modifier"
                                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-forest-50 text-forest-800 transition-colors"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onDeleteDepense(d)}
                                    title="Supprimer"
                                    className="p-1.5 rounded-lg border border-red-200 bg-red-50/60 hover:bg-red-100 text-red-700 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <span
                                  className="inline-flex items-center gap-1 text-[11px] text-gray-400 px-2 py-1"
                                  title="Dépense validée par l'Admin — modification réservée à l'Admin"
                                >
                                  <Lock className="w-3 h-3" />
                                  <span>Verrouillé</span>
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: PARAMÉTRAGE DES RUBRIQUES DE DÉPENSES                          */}
      {/* ===================================================================== */}
      {subTab === 'rubriques' && (
        <div className="space-y-6">
          {!isAdmin && (
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Consultation des rubriques budgétaires du syndic. La création et la modification du
                paramétrage des rubriques sont réservées à l’Administrateur.
              </span>
            </div>
          )}

          {/* Rubriques Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {rubriques.map((r) => {
              const famMeta =
                FAMILLES_RUBRIQUES_LABELS[r.famille] || FAMILLES_RUBRIQUES_LABELS.exploitation;

              const rubDepensesValides = depenses.filter(
                (d) => d.rubrique_id === r.id && d.statut === 'valide'
              );
              const totalCumul = rubDepensesValides.reduce((s, d) => s + Number(d.montant), 0);

              const moisDepenses = rubDepensesValides
                .filter((d) => d.date.startsWith(currentMonthPrefix))
                .reduce((s, d) => s + Number(d.montant), 0);

              const budget = Number(r.budget_mensuel) || 0;
              const budgetPct = budget > 0 ? Math.min(100, Math.round((moisDepenses / budget) * 100)) : 0;
              const isOverBudget = budget > 0 && moisDepenses > budget;

              return (
                <div
                  key={r.id}
                  className={`bg-white rounded-2xl border p-5 shadow-sm flex flex-col justify-between transition-all ${
                    r.statut === 'inactif'
                      ? 'opacity-60 border-gray-200 bg-gray-50'
                      : 'border-gray-100 hover:border-emerald-300 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-11 h-11 rounded-2xl bg-forest-50 border border-forest-100 flex items-center justify-center text-2xl">
                        {r.icone}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${famMeta.badgeClass}`}
                        >
                          {famMeta.label}
                        </span>
                        {r.statut === 'inactif' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                            Inactif
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-serif font-bold text-gray-900 text-base">{r.nom}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1 min-h-[2rem]">
                        {r.description || 'Aucune description renseignée'}
                      </p>
                    </div>

                    {/* Budget progress if defined */}
                    {budget > 0 ? (
                      <div className="pt-2 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-500">Ce mois :</span>
                          <span
                            className={`font-bold ${
                              isOverBudget ? 'text-rose-600' : 'text-forest-800'
                            }`}
                          >
                            {moisDepenses.toLocaleString('fr-FR')} / {budget.toLocaleString('fr-FR')} F
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isOverBudget
                                ? 'bg-rose-600'
                                : budgetPct >= 80
                                ? 'bg-amber-500'
                                : 'bg-emerald-600'
                            }`}
                            style={{ width: `${budgetPct}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2 text-[11px] text-gray-400">
                        Aucun plafond mensuel fixé
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        Cumul ({rubDepensesValides.length} op.)
                      </span>
                      <span className="font-bold text-rose-700">
                        {totalCumul.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center justify-between gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => onOpenEditRubrique(r)}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-forest-50 text-forest-800 text-xs font-medium transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Modifier</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleRubriqueStatut(r)}
                          title={r.statut === 'actif' ? 'Désactiver la rubrique' : 'Réactiver la rubrique'}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors"
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRubrique(r)}
                          title="Supprimer la rubrique"
                          className="p-1.5 rounded-lg border border-red-200 bg-red-50/50 hover:bg-red-100 text-red-700 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
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

