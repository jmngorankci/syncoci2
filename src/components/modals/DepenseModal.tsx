'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Depense,
  DepenseStatut,
  RubriqueDepense,
  Activite,
  Secteur,
  UserRole,
} from '@/types/database';
import { X, ArrowDownCircle, AlertTriangle, Clock, ShieldCheck } from 'lucide-react';

interface DepenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
  rubriques: RubriqueDepense[];
  activites: Activite[];
  secteurs: Secteur[];
  soldeDisponible: number;
  editingDepense?: Depense | null;
  onSave: (
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
  ) => Promise<void>;
}

const MODES_PAIEMENT_CAISSE = [
  'Espèces (Caisse)',
  'Wave',
  'Mobile Money (Orange)',
  'Mobile Money (MTN)',
  'Mobile Money (Moov)',
  'Virement bancaire',
  'Chèque',
];

export const DepenseModal: React.FC<DepenseModalProps> = ({
  isOpen,
  onClose,
  role,
  rubriques,
  activites,
  secteurs,
  soldeDisponible,
  editingDepense,
  onSave,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const selectableRubriques = useMemo(() => {
    return rubriques.filter(
      (r) => r.statut === 'actif' || (editingDepense && r.id === editingDepense.rubrique_id)
    );
  }, [rubriques, editingDepense]);

  const [rubriqueId, setRubriqueId] = useState('');
  const [activiteId, setActiviteId] = useState<string>('');
  const [secteurId, setSecteurId] = useState<string>('');
  const [libelle, setLibelle] = useState('');
  const [montant, setMontant] = useState<number>(0);
  const [date, setDate] = useState<string>(todayStr);
  const [beneficiaire, setBeneficiaire] = useState('');
  const [modePaiement, setModePaiement] = useState('Espèces (Caisse)');
  const [referencePiece, setReferencePiece] = useState('');
  const [statut, setStatut] = useState<DepenseStatut>('valide');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingDepense) {
      setRubriqueId(editingDepense.rubrique_id);
      setActiviteId(editingDepense.activite_id || '');
      setSecteurId(editingDepense.secteur_id || '');
      setLibelle(editingDepense.libelle);
      setMontant(Number(editingDepense.montant));
      setDate(editingDepense.date);
      setBeneficiaire(editingDepense.beneficiaire || '');
      setModePaiement(editingDepense.mode_paiement || 'Espèces (Caisse)');
      setReferencePiece(editingDepense.reference_piece || '');
      setStatut(editingDepense.statut);
      setNote(editingDepense.note || '');
    } else {
      setRubriqueId(selectableRubriques[0]?.id || '');
      setActiviteId(activites[0]?.id || '');
      setSecteurId('');
      setLibelle('');
      setMontant(0);
      setDate(todayStr);
      setBeneficiaire('');
      setModePaiement('Espèces (Caisse)');
      setReferencePiece('');
      setStatut(role === 'admin' ? 'valide' : 'en_attente');
      setNote('');
    }
  }, [editingDepense, isOpen, selectableRubriques, activites, role, todayStr]);

  if (!isOpen) return null;

  const adjustedAvailableBalance =
    editingDepense && editingDepense.statut === 'valide'
      ? soldeDisponible + Number(editingDepense.montant)
      : soldeDisponible;

  const isExceedingCash = Number(montant) > 0 && Number(montant) > adjustedAvailableBalance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rubriqueId || !libelle.trim() || Number(montant) <= 0) return;

    setLoading(true);
    await onSave(
      {
        rubrique_id: rubriqueId,
        activite_id: activiteId || null,
        secteur_id: secteurId || null,
        libelle: libelle.trim(),
        montant: Number(montant),
        date,
        beneficiaire: beneficiaire.trim(),
        mode_paiement: modePaiement,
        reference_piece: referencePiece.trim(),
        statut: role === 'admin' ? statut : 'en_attente',
        note: note.trim(),
      },
      editingDepense?.id
    );
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#0d2b1a] to-[#1f4d34] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center">
              <ArrowDownCircle className="w-5 h-5 text-rose-300" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold">
                {editingDepense
                  ? `Modifier la Dépense #${editingDepense.id}`
                  : 'Enregistrer une Sortie de Caisse (Dépense)'}
              </h2>
              <p className="text-xs text-emerald-200/90">
                Solde disponible en caisse :{' '}
                <strong className="text-white">
                  {adjustedAvailableBalance.toLocaleString('fr-FR')} FCFA
                </strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-forest-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[82vh] overflow-y-auto">
          {/* Role approval notice */}
          {role === 'responsable' ? (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Validation Administrateur requise :</span> En tant que
                Responsable de secteur, cette dépense sera enregistrée avec le statut{' '}
                <strong>« En attente »</strong> jusqu’à son approbation par l’Administrateur du syndic.
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-forest-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Saisie Administrateur : validation directe activée par défaut sur la trésorerie.
              </span>
            </div>
          )}

          {/* Rubrique & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
                Rubrique de dépense *
              </label>
              <select
                value={rubriqueId}
                onChange={(e) => setRubriqueId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50 font-medium"
              >
                {selectableRubriques.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.icone} {r.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
                Date de l’opération *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
              />
            </div>
          </div>

          {/* Libellé & Montant */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
                Libellé / Motif de la sortie *
              </label>
              <input
                type="text"
                value={libelle}
                onChange={(e) => setLibelle(e.target.value)}
                placeholder="Ex: Règlement prestation gardiennage Octobre 2026"
                required
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
                Montant décaissé (FCFA) *
              </label>
              <input
                type="number"
                min={1}
                step={1}
                value={montant || ''}
                onChange={(e) => setMontant(Number(e.target.value))}
                placeholder="Ex: 150000"
                required
                className="w-full px-3.5 py-2 text-sm font-bold text-rose-700 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-rose-50/30"
              />
            </div>
          </div>

          {/* Warning if exceeding available cash */}
          {isExceedingCash && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Alerte trésorerie :</span> Ce montant dépasse le solde net
                actuellement validé en caisse ({adjustedAvailableBalance.toLocaleString('fr-FR')} FCFA).
              </div>
            </div>
          )}

          {/* Bénéficiaire, Mode de paiement, Référence pièce */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
                Bénéficiaire / Fournisseur
              </label>
              <input
                type="text"
                value={beneficiaire}
                onChange={(e) => setBeneficiaire(e.target.value)}
                placeholder="Ex: Ivoire Sécurité, CIE..."
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
                Mode de règlement
              </label>
              <select
                value={modePaiement}
                onChange={(e) => setModePaiement(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
              >
                {MODES_PAIEMENT_CAISSE.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
                N° Pièce / Facture / Réf.
              </label>
              <input
                type="text"
                value={referencePiece}
                onChange={(e) => setReferencePiece(e.target.value)}
                placeholder="Ex: FACT-2026-089"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50 font-mono"
              />
            </div>
          </div>

          {/* Imputation : Caisse d'activité & Périmètre Secteur */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
                Fonds / Activité d’imputation
              </label>
              <select
                value={activiteId}
                onChange={(e) => setActiviteId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
              >
                <option value="">Trésorerie Générale (Pot commun)</option>
                {activites.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.icone} {a.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
                Secteur concerné
              </label>
              <select
                value={secteurId}
                onChange={(e) => setSecteurId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
              >
                <option value="">Toute la Cité (Charges communes)</option>
                {secteurs.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Admin-only Status Selector + Observation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {role === 'admin' && (
              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Statut de validation
                </label>
                <select
                  value={statut}
                  onChange={(e) => setStatut(e.target.value as DepenseStatut)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50 font-semibold"
                >
                  <option value="valide">✅ Validée (décaissée)</option>
                  <option value="en_attente">⏳ En attente</option>
                  <option value="rejete">❌ Rejetée</option>
                </select>
              </div>
            )}

            <div className={role === 'admin' ? 'sm:col-span-2' : 'sm:col-span-3'}>
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
                Observation / Note complémentaire
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Détails sur les travaux réalisés, numéro du prestataire..."
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl font-semibold shadow-md disabled:opacity-50"
            >
              {loading
                ? 'Enregistrement...'
                : editingDepense
                ? 'Mettre à jour la dépense'
                : role === 'admin'
                ? 'Enregistrer & Valider la sortie'
                : 'Soumettre pour validation Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

