'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dataService } from '@/services/dataService';
import {
  Secteur,
  Proprietaire,
  Activite,
  Paiement,
  RubriqueDepense,
  Depense,
  DepenseStatut,
} from '@/types/database';

import { Navbar } from '@/components/Navbar';
import { LoginScreen } from '@/components/LoginScreen';
import { SupabaseConfigModal } from '@/components/modals/SupabaseConfigModal';

// Admin Views
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { ProprietairesList } from '@/components/admin/ProprietairesList';
import { SecteursList } from '@/components/admin/SecteursList';
import { ActivitesList } from '@/components/admin/ActivitesList';
import { PaiementsList } from '@/components/admin/PaiementsList';
import { DepensesView } from '@/components/admin/DepensesView';
import { RapportsView } from '@/components/rapports/RapportsView';

// Responsable Views
import { ResponsableDashboard } from '@/components/responsable/ResponsableDashboard';
import { ValidationsView } from '@/components/responsable/ValidationsView';
import { MonSecteurView } from '@/components/responsable/MonSecteurView';

// Propriétaire Views
import { ProprietaireDashboard } from '@/components/proprietaire/ProprietaireDashboard';
import { PaiementForm } from '@/components/proprietaire/PaiementForm';
import { HistoriquePaiements } from '@/components/proprietaire/HistoriquePaiements';
import { ProfilView } from '@/components/proprietaire/ProfilView';

// Modals
import { AddProprietaireModal } from '@/components/modals/AddProprietaireModal';
import { EditProprietaireModal } from '@/components/modals/EditProprietaireModal';
import { AddActiviteModal } from '@/components/modals/AddActiviteModal';
import { EditActiviteModal } from '@/components/modals/EditActiviteModal';
import { AddSecteurModal } from '@/components/modals/AddSecteurModal';
import { EditSecteurModal } from '@/components/modals/EditSecteurModal';
import { EditPaiementModal } from '@/components/modals/EditPaiementModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { EditPersonalProfileModal } from '@/components/modals/EditPersonalProfileModal';
import { ViewProprietaireModal } from '@/components/modals/ViewProprietaireModal';
import { DepenseModal } from '@/components/modals/DepenseModal';
import { RubriqueDepenseModal } from '@/components/modals/RubriqueDepenseModal';

import { CheckCircle2, AlertTriangle, Plus } from 'lucide-react';

export default function HomePage() {
  const { user, role, isLoading: authLoading, updateCurrentUser } = useAuth();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedPaymentActId, setSelectedPaymentActId] = useState<string | null>(null);
  const [preselectedPropIdForReleve, setPreselectedPropIdForReleve] = useState<string | null>(null);
  const [rapportsSubTab, setRapportsSubTab] = useState<'releve' | 'bilan' | 'synthese'>('releve');

  const handleOpenReleveForProp = (prop: Proprietaire) => {
    setPreselectedPropIdForReleve(prop.id);
    setRapportsSubTab('releve');
    setCurrentTab('rapports');
  };

  const handleOpenBilanTresorerie = () => {
    setRapportsSubTab('bilan');
    setCurrentTab('rapports');
  };

  // Data State
  const [secteurs, setSecteurs] = useState<Secteur[]>([]);
  const [proprietaires, setProprietaires] = useState<Proprietaire[]>([]);
  const [activites, setActivites] = useState<Activite[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [rubriquesDepenses, setRubriquesDepenses] = useState<RubriqueDepense[]>([]);
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);

  // Modals
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isAddPropModalOpen, setIsAddPropModalOpen] = useState(false);
  const [isEditPropModalOpen, setIsEditPropModalOpen] = useState(false);
  const [editingProprietaire, setEditingProprietaire] = useState<Proprietaire | null>(null);

  const [isAddActModalOpen, setIsAddActModalOpen] = useState(false);
  const [isEditActModalOpen, setIsEditActModalOpen] = useState(false);
  const [editingActivite, setEditingActivite] = useState<Activite | null>(null);

  const [isAddSecteurModalOpen, setIsAddSecteurModalOpen] = useState(false);
  const [isEditSecteurModalOpen, setIsEditSecteurModalOpen] = useState(false);
  const [editingSecteur, setEditingSecteur] = useState<Secteur | null>(null);

  const [isEditPaiementModalOpen, setIsEditPaiementModalOpen] = useState(false);
  const [editingPaiement, setEditingPaiement] = useState<Paiement | null>(null);

  const [isEditPersonalProfileModalOpen, setIsEditPersonalProfileModalOpen] = useState(false);
  const [editingPersonalProfile, setEditingPersonalProfile] = useState<Proprietaire | null>(null);

  const [viewingProprietaire, setViewingProprietaire] = useState<Proprietaire | null>(null);

  // Dépenses & Rubriques Modals
  const [isDepenseModalOpen, setIsDepenseModalOpen] = useState(false);
  const [editingDepense, setEditingDepense] = useState<Depense | null>(null);
  const [isRubriqueModalOpen, setIsRubriqueModalOpen] = useState(false);
  const [editingRubrique, setEditingRubrique] = useState<RubriqueDepense | null>(null);

  const [deletingItem, setDeletingItem] = useState<{
    type: 'proprietaire' | 'secteur' | 'activite' | 'paiement' | 'depense' | 'rubrique';
    id: string;
    title: string;
    description: string;
    warning?: string;
  } | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' } | null>(null);

  const showToast = (text: string, type: 'success' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Load all data
  const loadData = useCallback(async () => {
    try {
      const [s, pr, a, pa, rub, dep] = await Promise.all([
        dataService.getSecteurs(),
        dataService.getProprietaires(),
        dataService.getActivites(),
        dataService.getPaiements(),
        dataService.getRubriquesDepenses(),
        dataService.getDepenses(),
      ]);
      setSecteurs(s);
      setProprietaires(pr);
      setActivites(a);
      setPaiements(pa);
      setRubriquesDepenses(rub);
      setDepenses(dep);
    } catch (err) {
      console.error('Error loading data', err);
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset current tab when role switches (or apply PWA shortcut ?tab=...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam) {
        if (tabParam === 'depenses' && role === 'proprietaire') {
          setCurrentTab('dashboard');
          return;
        }
        if (tabParam === 'payer' && role !== 'proprietaire') {
          setCurrentTab('paiements');
          return;
        }
        setCurrentTab(tabParam);
        return;
      }
    }
    setCurrentTab('dashboard');
  }, [role]);

  // Actions
  const handleValidatePayment = async (id: string) => {
    const validatorName = user?.nom || 'Syndic Admin';
    await dataService.updatePaiementStatut(id, 'valide', validatorName);
    await loadData();
    showToast('Paiement validé avec succès ! Quittance émise.', 'success');
  };

  const handleRejectPayment = async (id: string) => {
    const validatorName = user?.nom || 'Syndic Admin';
    await dataService.updatePaiementStatut(id, 'rejete', validatorName);
    await loadData();
    showToast('Paiement marqué comme rejeté.', 'warning');
  };

  const handleAddProprietaire = async (data: Omit<Proprietaire, 'id'>) => {
    await dataService.addProprietaire(data);
    await loadData();
    showToast(`Copropriétaire "${data.nom}" (Lot ${data.lot}) ajouté avec succès !`);
  };

  const handleAddActivite = async (data: Omit<Activite, 'id'>) => {
    await dataService.addActivite(data);
    await loadData();
    showToast(`Activité "${data.nom}" créée avec succès !`);
  };

  const handleUpdateActivite = async (id: string, data: Partial<Activite>) => {
    await dataService.updateActivite(id, data);
    await loadData();
    showToast('Activité mise à jour avec succès !');
  };

  const handleAddSecteur = async (data: Omit<Secteur, 'id'>) => {
    await dataService.addSecteur(data);
    await loadData();
    showToast(`Secteur "${data.nom}" créé avec succès !`);
  };

  const handleSubmitPaiement = async (data: {
    activite_id: string;
    montant: number;
    mode_paiement: string;
    reference: string;
    note: string;
  }) => {
    if (!user?.proprietaire_id) return;
    await dataService.createPaiement({
      proprietaire_id: user.proprietaire_id,
      activite_id: data.activite_id,
      montant: data.montant,
      mode_paiement: data.mode_paiement,
      reference: data.reference,
      note: data.note,
    });
    await loadData();
    showToast('Votre paiement a été soumis et transmis à votre responsable de secteur.');
  };

  const handleSelectActiviteForPayment = (actId: string) => {
    setSelectedPaymentActId(actId);
    setCurrentTab('payer');
  };

  // Modifying & Deleting Handlers
  const handleUpdateProprietaire = async (id: string, data: Partial<Proprietaire>) => {
    await dataService.updateProprietaire(id, data);
    await loadData();
    showToast(`Copropriétaire "${data.nom || id}" mis à jour avec succès !`);
  };

  const handleUpdateSecteur = async (id: string, data: Partial<Secteur>) => {
    await dataService.updateSecteur(id, data);
    await loadData();
    showToast(`Secteur "${data.nom || id}" mis à jour avec succès !`);
  };

  const handleUpdatePaiement = async (id: string, data: Partial<Paiement>) => {
    await dataService.updatePaiement(id, data);
    await loadData();
    showToast(`Paiement #${id} mis à jour avec succès !`);
  };

  const handleUpdatePersonalProfile = async (id: string, data: { nom: string; tel: string; email: string }) => {
    await dataService.updateProprietaire(id, data);
    updateCurrentUser({ nom: data.nom, email: data.email });
    await loadData();
    showToast('Vos informations personnelles ont été mises à jour avec succès !');
  };

  const requestDeleteProprietaire = (prop: Proprietaire) => {
    setDeletingItem({
      type: 'proprietaire',
      id: prop.id,
      title: 'Supprimer un copropriétaire',
      description: `${prop.nom} (Lot ${prop.lot})`,
      warning: 'Cette action supprimera également les écritures de paiements rattachées à ce lot.',
    });
  };

  const requestDeleteSecteur = (sect: Secteur) => {
    setDeletingItem({
      type: 'secteur',
      id: sect.id,
      title: 'Supprimer un secteur',
      description: sect.nom,
      warning: 'Les copropriétaires de ce secteur deviendront non assignés.',
    });
  };

  const requestDeleteActivite = (act: Activite) => {
    setDeletingItem({
      type: 'activite',
      id: act.id,
      title: 'Supprimer une activité',
      description: act.nom,
      warning: 'Les cotisations pour cette prestation ne pourront plus être choisies.',
    });
  };

  const requestDeletePaiement = (pay: Paiement) => {
    setDeletingItem({
      type: 'paiement',
      id: pay.id,
      title: 'Supprimer un paiement',
      description: `Règlement de ${Number(pay.montant).toLocaleString('fr-FR')} FCFA (#${pay.id})`,
      warning: 'Cette transaction sera définitivement radiée des comptes.',
    });
  };

  // =========================================================================
  // HANDLERS DÉPENSES & RUBRIQUES
  // =========================================================================
  const soldeDisponibleCaisse =
    paiements
      .filter((p) => p.statut === 'valide')
      .reduce((sum, p) => sum + Number(p.montant), 0) -
    depenses
      .filter((d) => d.statut === 'valide')
      .reduce((sum, d) => sum + Number(d.montant), 0);

  const handleSaveDepense = async (
    data: {
      rubrique_id: string;
      activite_id?: string | null;
      secteur_id?: string | null;
      libelle: string;
      montant: number;
      date: string;
      beneficiaire?: string;
      mode_paiement?: string;
      reference_piece?: string;
      statut?: DepenseStatut;
      note?: string;
    },
    existingId?: string
  ) => {
    const authorName = user?.nom || 'Syndic';
    if (existingId) {
      const payload: Partial<Depense> = {
        ...data,
        // Règle #1 : un Responsable ne peut pas forcer le statut à 'valide'
        statut: role === 'admin' ? data.statut || 'valide' : 'en_attente',
        valide_par: role === 'admin' && data.statut === 'valide' ? authorName : undefined,
      };
      await dataService.updateDepense(existingId, payload);
      await loadData();
      showToast(`Dépense #${existingId} mise à jour avec succès.`);
    } else {
      const created = await dataService.createDepense(data, role, authorName);
      await loadData();
      if (created.statut === 'en_attente') {
        showToast(
          'Sortie de caisse enregistrée « En attente » — transmise à l’Administrateur pour validation.',
          'warning'
        );
      } else {
        showToast('Sortie de caisse enregistrée et validée dans la trésorerie !');
      }
    }
  };

  const handleValidateDepense = async (id: string) => {
    if (role !== 'admin') return;
    const validatorName = user?.nom || 'Administrateur';
    await dataService.updateDepenseStatut(id, 'valide', validatorName);
    await loadData();
    showToast(`Dépense #${id} approuvée et imputée sur la caisse !`);
  };

  const handleRejectDepense = async (id: string) => {
    if (role !== 'admin') return;
    const validatorName = user?.nom || 'Administrateur';
    await dataService.updateDepenseStatut(id, 'rejete', validatorName);
    await loadData();
    showToast(`Dépense #${id} marquée comme rejetée.`, 'warning');
  };

  const requestDeleteDepense = (dep: Depense) => {
    if (role !== 'admin' && dep.statut !== 'en_attente') {
      showToast('Seul l’Administrateur peut supprimer une dépense déjà traitée.', 'warning');
      return;
    }
    setDeletingItem({
      type: 'depense',
      id: dep.id,
      title: 'Supprimer une sortie de caisse',
      description: `${dep.libelle} (${Number(dep.montant).toLocaleString('fr-FR')} FCFA)`,
      warning: 'Cette écriture de dépense sera définitivement retirée du journal de caisse.',
    });
  };

  const handleSaveRubrique = async (
    data: Omit<RubriqueDepense, 'id'>,
    existingId?: string
  ) => {
    if (role !== 'admin') return;
    if (existingId) {
      await dataService.updateRubriqueDepense(existingId, data);
      await loadData();
      showToast(`Rubrique "${data.nom}" mise à jour !`);
    } else {
      await dataService.addRubriqueDepense(data);
      await loadData();
      showToast(`Nouvelle rubrique "${data.nom}" créée avec succès !`);
    }
  };

  const handleToggleRubriqueStatut = async (rub: RubriqueDepense) => {
    if (role !== 'admin') return;
    const nextStatut = rub.statut === 'actif' ? 'inactif' : 'actif';
    await dataService.updateRubriqueDepense(rub.id, { statut: nextStatut });
    await loadData();
    showToast(
      `Rubrique "${rub.nom}" passée à l’état ${nextStatut === 'actif' ? 'Actif' : 'Inactif'}.`
    );
  };

  const requestDeleteRubrique = (rub: RubriqueDepense) => {
    if (role !== 'admin') return;
    const linkedCount = depenses.filter((d) => d.rubrique_id === rub.id).length;
    if (linkedCount > 0) {
      showToast(
        `Impossible de supprimer "${rub.nom}" (${linkedCount} dépense(s) rattachée(s)). Désactivez-la plutôt.`,
        'warning'
      );
      return;
    }
    setDeletingItem({
      type: 'rubrique',
      id: rub.id,
      title: 'Supprimer une rubrique budgétaire',
      description: `${rub.icone} ${rub.nom}`,
      warning: 'Cette rubrique ne sera plus proposée lors de la saisie des dépenses.',
    });
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    const { type, id, description } = deletingItem;

    try {
      if (type === 'proprietaire') {
        await dataService.deleteProprietaire(id);
        showToast(`Copropriétaire "${description}" supprimé.`);
      } else if (type === 'secteur') {
        await dataService.deleteSecteur(id);
        showToast(`Secteur "${description}" supprimé.`);
      } else if (type === 'activite') {
        await dataService.deleteActivite(id);
        showToast(`Activité "${description}" supprimée.`);
      } else if (type === 'paiement') {
        await dataService.deletePaiement(id);
        showToast(`Paiement #${id} supprimé.`);
      } else if (type === 'depense') {
        await dataService.deleteDepense(id);
        showToast(`Dépense "${description}" supprimée.`);
      } else if (type === 'rubrique') {
        await dataService.deleteRubriqueDepense(id);
        showToast(`Rubrique "${description}" supprimée.`);
      }
    } catch (err) {
      console.error('Delete error', err);
      showToast('Une erreur est survenue lors de la suppression.', 'warning');
    }

    setDeletingItem(null);
    await loadData();
  };

  if (authLoading || isDataLoading) {
    return (
      <div className="min-h-screen bg-[#0d2b1a] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-400/20 border-t-emerald-400 rounded-full animate-spin mx-auto" />
          <div className="text-sm font-medium text-emerald-200">Chargement de SyndicCité...</div>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="no-print fixed top-16 sm:top-20 left-3 right-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-200 flex justify-center">
          <div className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-semibold max-w-md ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-600'
              : 'bg-amber-900 text-amber-100 border-amber-600'
          }`}>
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
      />

      {/* Main Container (pb-24 on mobile for fixed bottom PWA navigation bar) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-5 pb-24 md:py-8">
        {/* ADMIN VIEWS */}
        {role === 'admin' && (
          <>
            {currentTab === 'dashboard' && (
              <AdminDashboard
                secteurs={secteurs}
                proprietaires={proprietaires}
                activites={activites}
                paiements={paiements}
                depenses={depenses}
                onNavigate={(t) => setCurrentTab(t)}
                onValidatePayment={handleValidatePayment}
                onRejectPayment={handleRejectPayment}
              />
            )}
            {currentTab === 'proprietaires' && (
              <ProprietairesList
                proprietaires={proprietaires}
                secteurs={secteurs}
                paiements={paiements}
                onOpenAddModal={() => setIsAddPropModalOpen(true)}
                onViewProprietaire={(p) => setViewingProprietaire(p)}
                onEditProprietaire={(p) => {
                  setEditingProprietaire(p);
                  setIsEditPropModalOpen(true);
                }}
                onDeleteProprietaire={requestDeleteProprietaire}
                onGenerateReleve={handleOpenReleveForProp}
              />
            )}
            {currentTab === 'secteurs' && (
              <SecteursList
                secteurs={secteurs}
                proprietaires={proprietaires}
                paiements={paiements}
                activites={activites}
                onOpenAddModal={() => setIsAddSecteurModalOpen(true)}
                onEditSecteur={(s) => {
                  setEditingSecteur(s);
                  setIsEditSecteurModalOpen(true);
                }}
                onDeleteSecteur={requestDeleteSecteur}
              />
            )}
            {currentTab === 'activites' && (
              <ActivitesList
                activites={activites}
                paiements={paiements}
                onOpenAddModal={() => setIsAddActModalOpen(true)}
                onOpenEditModal={(a) => {
                  setEditingActivite(a);
                  setIsEditActModalOpen(true);
                }}
                onDeleteActivite={requestDeleteActivite}
              />
            )}
            {currentTab === 'paiements' && (
              <PaiementsList
                paiements={paiements}
                proprietaires={proprietaires}
                activites={activites}
                onValidatePayment={handleValidatePayment}
                onRejectPayment={handleRejectPayment}
                onEditPaiement={(pay) => {
                  setEditingPaiement(pay);
                  setIsEditPaiementModalOpen(true);
                }}
                onDeletePaiement={requestDeletePaiement}
              />
            )}
            {currentTab === 'depenses' && (
              <DepensesView
                currentUser={user}
                role={role}
                depenses={depenses}
                rubriques={rubriquesDepenses}
                paiements={paiements}
                activites={activites}
                secteurs={secteurs}
                onOpenAddDepense={() => {
                  setEditingDepense(null);
                  setIsDepenseModalOpen(true);
                }}
                onOpenEditDepense={(dep) => {
                  setEditingDepense(dep);
                  setIsDepenseModalOpen(true);
                }}
                onDeleteDepense={requestDeleteDepense}
                onValidateDepense={handleValidateDepense}
                onRejectDepense={handleRejectDepense}
                onOpenAddRubrique={() => {
                  setEditingRubrique(null);
                  setIsRubriqueModalOpen(true);
                }}
                onOpenEditRubrique={(rub) => {
                  setEditingRubrique(rub);
                  setIsRubriqueModalOpen(true);
                }}
                onToggleRubriqueStatut={handleToggleRubriqueStatut}
                onDeleteRubrique={requestDeleteRubrique}
                onNavigateToBilan={handleOpenBilanTresorerie}
              />
            )}
            {currentTab === 'rapports' && (
              <RapportsView
                currentUser={user}
                role={role}
                secteurs={secteurs}
                proprietaires={proprietaires}
                activites={activites}
                paiements={paiements}
                depenses={depenses}
                rubriques={rubriquesDepenses}
                preselectedPropId={preselectedPropIdForReleve}
                initialSubTab={rapportsSubTab}
              />
            )}
          </>
        )}

        {/* RESPONSABLE VIEWS (Full modify/delete powers on all tables) */}
        {role === 'responsable' && (
          <>
            {currentTab === 'dashboard' && (
              <ResponsableDashboard
                currentUser={user}
                secteurs={secteurs}
                proprietaires={proprietaires}
                activites={activites}
                paiements={paiements}
                onNavigate={(t) => setCurrentTab(t)}
                onValidatePayment={handleValidatePayment}
                onRejectPayment={handleRejectPayment}
              />
            )}
            {currentTab === 'validations' && (
              <ValidationsView
                currentUser={user}
                secteurs={secteurs}
                proprietaires={proprietaires}
                activites={activites}
                paiements={paiements}
                onValidatePayment={handleValidatePayment}
                onRejectPayment={handleRejectPayment}
                onEditPaiement={(pay) => {
                  setEditingPaiement(pay);
                  setIsEditPaiementModalOpen(true);
                }}
                onDeletePaiement={requestDeletePaiement}
              />
            )}
            {currentTab === 'mon-secteur' && (
              <MonSecteurView
                currentUser={user}
                secteurs={secteurs}
                proprietaires={proprietaires}
                paiements={paiements}
                onEditProprietaire={(p) => {
                  setEditingProprietaire(p);
                  setIsEditPropModalOpen(true);
                }}
                onDeleteProprietaire={requestDeleteProprietaire}
                onOpenAddProprietaire={() => setIsAddPropModalOpen(true)}
              />
            )}
            {currentTab === 'proprietaires' && (
              <ProprietairesList
                proprietaires={proprietaires}
                secteurs={secteurs}
                paiements={paiements}
                onOpenAddModal={() => setIsAddPropModalOpen(true)}
                onViewProprietaire={(p) => setViewingProprietaire(p)}
                onEditProprietaire={(p) => {
                  setEditingProprietaire(p);
                  setIsEditPropModalOpen(true);
                }}
                onDeleteProprietaire={requestDeleteProprietaire}
                onGenerateReleve={handleOpenReleveForProp}
              />
            )}
            {currentTab === 'secteurs' && (
              <SecteursList
                secteurs={secteurs}
                proprietaires={proprietaires}
                paiements={paiements}
                activites={activites}
                onOpenAddModal={() => setIsAddSecteurModalOpen(true)}
                onEditSecteur={(s) => {
                  setEditingSecteur(s);
                  setIsEditSecteurModalOpen(true);
                }}
                onDeleteSecteur={requestDeleteSecteur}
              />
            )}
            {currentTab === 'activites' && (
              <ActivitesList
                activites={activites}
                paiements={paiements}
                onOpenAddModal={() => setIsAddActModalOpen(true)}
                onOpenEditModal={(a) => {
                  setEditingActivite(a);
                  setIsEditActModalOpen(true);
                }}
                onDeleteActivite={requestDeleteActivite}
              />
            )}
            {currentTab === 'paiements' && (
              <PaiementsList
                paiements={paiements}
                proprietaires={proprietaires}
                activites={activites}
                onValidatePayment={handleValidatePayment}
                onRejectPayment={handleRejectPayment}
                onEditPaiement={(pay) => {
                  setEditingPaiement(pay);
                  setIsEditPaiementModalOpen(true);
                }}
                onDeletePaiement={requestDeletePaiement}
              />
            )}
            {currentTab === 'depenses' && (
              <DepensesView
                currentUser={user}
                role={role}
                depenses={depenses}
                rubriques={rubriquesDepenses}
                paiements={paiements}
                activites={activites}
                secteurs={secteurs}
                onOpenAddDepense={() => {
                  setEditingDepense(null);
                  setIsDepenseModalOpen(true);
                }}
                onOpenEditDepense={(dep) => {
                  setEditingDepense(dep);
                  setIsDepenseModalOpen(true);
                }}
                onDeleteDepense={requestDeleteDepense}
                onValidateDepense={handleValidateDepense}
                onRejectDepense={handleRejectDepense}
                onOpenAddRubrique={() => {
                  setEditingRubrique(null);
                  setIsRubriqueModalOpen(true);
                }}
                onOpenEditRubrique={(rub) => {
                  setEditingRubrique(rub);
                  setIsRubriqueModalOpen(true);
                }}
                onToggleRubriqueStatut={handleToggleRubriqueStatut}
                onDeleteRubrique={requestDeleteRubrique}
                onNavigateToBilan={handleOpenBilanTresorerie}
              />
            )}
            {currentTab === 'rapports' && (
              <RapportsView
                currentUser={user}
                role={role}
                secteurs={secteurs}
                proprietaires={proprietaires}
                activites={activites}
                paiements={paiements}
                depenses={depenses}
                rubriques={rubriquesDepenses}
                preselectedPropId={preselectedPropIdForReleve}
                initialSubTab={rapportsSubTab}
              />
            )}
          </>
        )}

        {/* PROPRIÉTAIRE VIEWS (Modify ONLY personal info) */}
        {role === 'proprietaire' && (
          <>
            {currentTab === 'dashboard' && (
              <ProprietaireDashboard
                currentUser={user}
                secteurs={secteurs}
                proprietaires={proprietaires}
                activites={activites}
                paiements={paiements}
                onNavigate={(t) => setCurrentTab(t)}
                onSelectActiviteForPayment={handleSelectActiviteForPayment}
              />
            )}
            {currentTab === 'payer' && (
              <PaiementForm
                currentUser={user}
                proprietaires={proprietaires}
                activites={activites}
                initialActiviteId={selectedPaymentActId}
                onSubmitPaiement={handleSubmitPaiement}
              />
            )}
            {currentTab === 'historique' && (
              <HistoriquePaiements
                currentUser={user}
                proprietaires={proprietaires}
                activites={activites}
                paiements={paiements}
                onNavigate={(t) => setCurrentTab(t)}
              />
            )}
            {currentTab === 'rapports' && (
              <RapportsView
                currentUser={user}
                role={role}
                secteurs={secteurs}
                proprietaires={proprietaires}
                activites={activites}
                paiements={paiements}
                preselectedPropId={user?.proprietaire_id || null}
              />
            )}
            {currentTab === 'profil' && (
              <ProfilView
                currentUser={user}
                secteurs={secteurs}
                proprietaires={proprietaires}
                paiements={paiements}
                onNavigate={(t) => setCurrentTab(t)}
                onOpenEditPersonalProfile={(p) => {
                  setEditingPersonalProfile(p);
                  setIsEditPersonalProfileModalOpen(true);
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Floating Action Button (FAB) for quick add actions */}
      {(role === 'admin' || role === 'responsable') && ['proprietaires', 'secteurs', 'activites', 'depenses'].includes(currentTab) && (
        <button
          onClick={() => {
            if (currentTab === 'proprietaires') setIsAddPropModalOpen(true);
            else if (currentTab === 'activites') setIsAddActModalOpen(true);
            else if (currentTab === 'secteurs') setIsAddSecteurModalOpen(true);
            else if (currentTab === 'depenses') {
              setEditingDepense(null);
              setIsDepenseModalOpen(true);
            }
          }}
          className="no-print fixed bottom-20 md:bottom-6 right-4 md:right-6 w-12 h-12 md:w-14 md:h-14 rounded-full bg-forest-700 hover:bg-forest-800 text-white shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-30"
          title="Ajouter"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* MODALS */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      {/* Propriétaire Modals */}
      <AddProprietaireModal
        isOpen={isAddPropModalOpen}
        onClose={() => setIsAddPropModalOpen(false)}
        secteurs={secteurs}
        onAdd={handleAddProprietaire}
      />

      <EditProprietaireModal
        isOpen={isEditPropModalOpen}
        onClose={() => {
          setIsEditPropModalOpen(false);
          setEditingProprietaire(null);
        }}
        proprietaire={editingProprietaire}
        secteurs={secteurs}
        onUpdate={handleUpdateProprietaire}
      />

      {/* Activité Modals */}
      <AddActiviteModal
        isOpen={isAddActModalOpen}
        onClose={() => setIsAddActModalOpen(false)}
        onAdd={handleAddActivite}
      />

      <EditActiviteModal
        isOpen={isEditActModalOpen}
        onClose={() => {
          setIsEditActModalOpen(false);
          setEditingActivite(null);
        }}
        activite={editingActivite}
        onUpdate={handleUpdateActivite}
      />

      {/* Secteur Modals */}
      <AddSecteurModal
        isOpen={isAddSecteurModalOpen}
        onClose={() => setIsAddSecteurModalOpen(false)}
        onAdd={handleAddSecteur}
      />

      <EditSecteurModal
        isOpen={isEditSecteurModalOpen}
        onClose={() => {
          setIsEditSecteurModalOpen(false);
          setEditingSecteur(null);
        }}
        secteur={editingSecteur}
        onUpdate={handleUpdateSecteur}
      />

      {/* Paiement Modals */}
      <EditPaiementModal
        isOpen={isEditPaiementModalOpen}
        onClose={() => {
          setIsEditPaiementModalOpen(false);
          setEditingPaiement(null);
        }}
        paiement={editingPaiement}
        proprietaires={proprietaires}
        activites={activites}
        onUpdate={handleUpdatePaiement}
      />

      {/* Personal Profile Modal (Propriétaire Only) */}
      <EditPersonalProfileModal
        isOpen={isEditPersonalProfileModalOpen}
        onClose={() => {
          setIsEditPersonalProfileModalOpen(false);
          setEditingPersonalProfile(null);
        }}
        proprietaire={editingPersonalProfile}
        onUpdate={handleUpdatePersonalProfile}
      />

      {/* Generic Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        title={deletingItem?.title || 'Confirmation de suppression'}
        itemDescription={deletingItem?.description || ''}
        warningNote={deletingItem?.warning}
        onConfirm={handleConfirmDelete}
      />

      <ViewProprietaireModal
        isOpen={Boolean(viewingProprietaire)}
        onClose={() => setViewingProprietaire(null)}
        proprietaire={viewingProprietaire}
        secteurs={secteurs}
        paiements={paiements}
        activites={activites}
        onGenerateReleve={handleOpenReleveForProp}
      />

      {/* Dépense & Rubrique Modals (Bureau du Syndic uniquement) */}
      {(role === 'admin' || role === 'responsable') && (
        <>
          <DepenseModal
            isOpen={isDepenseModalOpen}
            onClose={() => {
              setIsDepenseModalOpen(false);
              setEditingDepense(null);
            }}
            role={role}
            rubriques={rubriquesDepenses}
            activites={activites}
            secteurs={secteurs}
            soldeDisponible={soldeDisponibleCaisse}
            editingDepense={editingDepense}
            onSave={handleSaveDepense}
          />

          <RubriqueDepenseModal
            isOpen={isRubriqueModalOpen}
            onClose={() => {
              setIsRubriqueModalOpen(false);
              setEditingRubrique(null);
            }}
            editingRubrique={editingRubrique}
            onSave={handleSaveRubrique}
          />
        </>
      )}
    </div>
  );
}
