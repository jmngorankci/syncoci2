'use client';

import React, { useState, useEffect } from 'react';
import { Activite, CurrentUser, Proprietaire } from '@/types/database';
import { CreditCard, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface PaiementFormProps {
  currentUser: CurrentUser;
  proprietaires: Proprietaire[];
  activites: Activite[];
  initialActiviteId?: string | null;
  onSubmitPaiement: (data: {
    activite_id: string;
    montant: number;
    mode_paiement: string;
    reference: string;
    note: string;
  }) => Promise<void>;
}

export const PaiementForm: React.FC<PaiementFormProps> = ({
  currentUser,
  proprietaires,
  activites,
  initialActiviteId,
  onSubmitPaiement,
}) => {
  const [selectedActId, setSelectedActId] = useState<string>(initialActiviteId || activites[0]?.id || '');
  const [modePaiement, setModePaiement] = useState<string>('Mobile Money (Orange)');
  const [reference, setReference] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (initialActiviteId) {
      setSelectedActId(initialActiviteId);
    }
  }, [initialActiviteId]);

  const selectedAct = activites.find((a) => a.id === selectedActId) || activites[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAct) return;

    setLoading(true);
    await onSubmitPaiement({
      activite_id: selectedAct.id,
      montant: Number(selectedAct.montant),
      mode_paiement: modePaiement,
      reference: reference.trim(),
      note: note.trim(),
    });

    setLoading(false);
    setSuccess(true);
    setReference('');
    setNote('');

    setTimeout(() => {
      setSuccess(false);
    }, 4000);
  };

  const paymentModes = [
    'Mobile Money (Orange)',
    'Mobile Money (MTN)',
    'Wave',
    'Virement bancaire',
    'Espèces (Remis au bureau/responsable)',
    'Chèque',
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-gray-900">
          Régler une Cotisation
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Sélectionnez le service syndic à régler et indiquez la référence de votre transaction
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <div className="font-bold">Paiement soumis avec succès !</div>
            <div className="text-xs text-emerald-700">
              Votre responsable de secteur va vérifier et valider votre quittance dans les plus brefs délais.
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        {/* Activity Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">
            1. Choisissez la cotisation
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {activites.map((a) => {
              const isSelected = a.id === selectedActId;

              return (
                <div
                  key={a.id}
                  onClick={() => setSelectedActId(a.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-forest-700 bg-forest-50/70 shadow-md ring-2 ring-forest-700/20'
                      : 'border-gray-200 hover:border-forest-300 hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <div className="text-2xl mb-1.5">{a.icone}</div>
                    <div className={`font-semibold text-xs ${isSelected ? 'text-forest-950' : 'text-gray-800'}`}>
                      {a.nom}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-gray-100/60">
                    <div className="text-sm font-bold text-forest-800">
                      {Number(a.montant).toLocaleString('fr-FR')} F
                    </div>
                    <div className="text-[10px] text-gray-400 capitalize">{a.periodicite}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Activity Summary Card */}
        {selectedAct && (
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedAct.icone}</span>
              <div>
                <div className="font-bold text-sm text-forest-950">{selectedAct.nom}</div>
                <div className="text-xs text-forest-700">{selectedAct.description}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-forest-600">Montant à régler</div>
              <div className="font-serif text-xl font-bold text-forest-900">
                {Number(selectedAct.montant).toLocaleString('fr-FR')} FCFA
              </div>
            </div>
          </div>
        )}

        {/* Payment Details */}
        <div className="space-y-4 pt-2 border-t border-gray-100">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
            2. Mode & Justificatif de règlement
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Mode de règlement
              </label>
              <select
                value={modePaiement}
                onChange={(e) => setModePaiement(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50 text-gray-800"
              >
                {paymentModes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                N° de transaction ou Réf. reçu
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ex: OM-202502-0492 / VIR-9921"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Note ou précision (optionnel)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Paiement groupé 2 mois, reçu remis au gardien, etc."
              rows={2}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50 resize-none"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-2xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm shadow-lg shadow-forest-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <CreditCard className="w-4 h-4" />
          <span>{loading ? 'Enregistrement en cours...' : `Confirmer le règlement de ${Number(selectedAct?.montant || 0).toLocaleString('fr-FR')} FCFA`}</span>
        </button>
      </form>
    </div>
  );
};
