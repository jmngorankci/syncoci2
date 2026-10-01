'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dataService } from '@/services/dataService';
import { Secteur, Proprietaire, Activite, Paiement } from '@/types/database';

import { Navbar } from '@/components/Navbar';
import { LoginScreen } from '@/components/LoginScreen';
import { SupabaseConfigModal } from '@/components/modals/SupabaseConfigModal';

// Admin Views
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { ProprietairesList } from '@/components/admin/ProprietairesList';
import { SecteursList } from '@/components/admin/SecteursList';
import { ActivitesList } from '@/components/admin/ActivitesList';
import { PaiementsList } from '@/components/admin/PaiementsList';
import { RapportsFinanciers } from '@/components/admin/RapportsFinanciers';

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
import { AddActiviteModal } from '@/components/modals/AddActiviteModal';
import { EditActiviteModal } from '@/components/modals/EditActiviteModal';
import { AddSecteurModal } from '@/components/modals/AddSecteurModal';
import { ViewProprietaireModal } from '@/components/modals/ViewProprietaireModal';

import { CheckCircle2, AlertTriangle, Plus, Database, Sparkles } from 'lucide-react';

export default function HomePage() {
  const { user, role, isLoading: authLoading } = useAuth();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedPaymentActId, setSelectedPaymentActId] = useState<string | null>(null);

  // Data State
  const [secteurs, setSecteurs] = useState<Secteur[]>([]);
  const [proprietaires, setProprietaires] = useState<Proprietaire[]>([]);
  const [activites, setActivites] = useState<Activite[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);

  // Modals
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isAddPropModalOpen, setIsAddPropModalOpen] = useState(false);
  const [isAddActModalOpen, setIsAddActModalOpen] = useState(false);
  const [isEditActModalOpen, setIsEditActModalOpen] = useState(false);
  const [editingActivite, setEditingActivite] = useState<Activite | null>(null);
  const [isAddSecteurModalOpen, setIsAddSecteurModalOpen] = useState(false);
  const [viewingProprietaire, setViewingProprietaire] = useState<Proprietaire | null>(null);

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
      const [s, pr, a, pa] = await Promise.all([
        dataService.getSecteurs(),
        dataService.getProprietaires(),
        dataService.getActivites(),
        dataService.getPaiements(),
      ]);
      setSecteurs(s);
      setProprietaires(pr);
      setActivites(a);
      setPaiements(pa);
    } catch (err) {
      console.error('Error loading data', err);
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset current tab when role switches
  useEffect(() => {
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
    return (
      <>
        <LoginScreen onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)} />
        <SupabaseConfigModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-semibold ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-600'
              : 'bg-amber-900 text-amber-100 border-amber-600'
          }`}>
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ADMIN VIEWS */}
        {role === 'admin' && (
          <>
            {currentTab === 'dashboard' && (
              <AdminDashboard
                secteurs={secteurs}
                proprietaires={proprietaires}
                activites={activites}
                paiements={paiements}
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
              />
            )}
            {currentTab === 'secteurs' && (
              <SecteursList
                secteurs={secteurs}
                proprietaires={proprietaires}
                paiements={paiements}
                activites={activites}
                onOpenAddModal={() => setIsAddSecteurModalOpen(true)}
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
              />
            )}
            {currentTab === 'paiements' && (
              <PaiementsList
                paiements={paiements}
                proprietaires={proprietaires}
                activites={activites}
                onValidatePayment={handleValidatePayment}
                onRejectPayment={handleRejectPayment}
              />
            )}
            {currentTab === 'rapports' && (
              <RapportsFinanciers
                secteurs={secteurs}
                proprietaires={proprietaires}
                activites={activites}
                paiements={paiements}
              />
            )}
          </>
        )}

        {/* RESPONSABLE VIEWS */}
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
              />
            )}
            {currentTab === 'mon-secteur' && (
              <MonSecteurView
                currentUser={user}
                secteurs={secteurs}
                proprietaires={proprietaires}
                paiements={paiements}
              />
            )}
            {currentTab === 'rapports' && (
              <RapportsFinanciers
                secteurs={secteurs}
                proprietaires={proprietaires}
                activites={activites}
                paiements={paiements}
              />
            )}
          </>
        )}

        {/* PROPRIÉTAIRE VIEWS */}
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
              />
            )}
            {currentTab === 'profil' && (
              <ProfilView
                currentUser={user}
                secteurs={secteurs}
                proprietaires={proprietaires}
                paiements={paiements}
              />
            )}
          </>
        )}
      </main>

      {/* Floating Action Button (FAB) for quick add actions */}
      {role === 'admin' && ['proprietaires', 'secteurs', 'activites'].includes(currentTab) && (
        <button
          onClick={() => {
            if (currentTab === 'proprietaires') setIsAddPropModalOpen(true);
            else if (currentTab === 'activites') setIsAddActModalOpen(true);
            else if (currentTab === 'secteurs') setIsAddSecteurModalOpen(true);
          }}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-forest-700 hover:bg-forest-800 text-white shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-40"
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

      <AddProprietaireModal
        isOpen={isAddPropModalOpen}
        onClose={() => setIsAddPropModalOpen(false)}
        secteurs={secteurs}
        onAdd={handleAddProprietaire}
      />

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

      <AddSecteurModal
        isOpen={isAddSecteurModalOpen}
        onClose={() => setIsAddSecteurModalOpen(false)}
        onAdd={handleAddSecteur}
      />

      <ViewProprietaireModal
        isOpen={Boolean(viewingProprietaire)}
        onClose={() => setViewingProprietaire(null)}
        proprietaire={viewingProprietaire}
        secteurs={secteurs}
        paiements={paiements}
        activites={activites}
      />
    </div>
  );
}
