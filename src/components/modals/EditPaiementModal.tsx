'use client';

import React, { useState, useEffect } from 'react';
import { Paiement, Proprietaire, Activite, PaiementStatut } from '@/types/database';
import { X, CreditCard } from 'lucide-react';

interface EditPaiementModalProps {
  isOpen: boolean;
  onClose: () => void;
  paiement: Paiement | null;
  proprietaires: Proprietaire[];
  activites: Activite[];
  onUpdate: (id: string, data: Partial<Paiement>) => Promise<void>;
}

export const EditPaiementModal: React.FC<EditPaiementModalProps> = ({
  isOpen,
  onClose,
  paiement,
  proprietaires,
  activites,
  onUpdate,
}) => {
  const [proprietaireId, setProprietaireId] = useState('');
  const [activiteId, setActiviteId] = useState('');
  const [montant, setMontant] = useState(0);
  const [date, setDate] = useState('');
  const [statut, setStatut] = useState<PaiementStatut>('en_attente');
  const [modePaiement, setModePaiement] = useState('');
  const [reference, setReference] = useState('');
  const [validePar, setValidePar] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (paiement) {
      setProprietaireId(paiement.proprietaire_id);
      setActiviteId(paiement.activite_id);
      setMontant(Number(paiement.montant));
      setDate(paiement.date);
      setStatut(paiement.statut);
      setModePaiement(paiement.mode_paiement || 'Mobile Money');
      setReference(paiement.reference || '');
      setValidePar(paiement.valide_par || '');
      setNote(paiement.note || '');
    }
  }, [paiement]);

  if (!isOpen || !paiement) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proprietaireId || !activiteId || !montant) return;

    setLoading(true);
    await onUpdate(paiement.id, {
      proprietaire_id: proprietaireId,
      activite_id: activiteId,
      montant: Number(montant),
      date,
      statut,
      mode_paiement: modePaiement.trim(),
      reference: reference.trim(),
      valide_par: statut === 'valide' ? (validePar.trim() || 'Syndic') : (validePar.trim() || null),
      note: note.trim(),
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100">
        <div className="p-6 bg-forest-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <h2 className="font-serif text-lg font-bold">Modifier le Paiement #{paiement.id}</h2>
          </div>
          <button onClick={onClose} className="p-1 text-forest-300 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
                Copropriétaire *
              </label>
              <select
                value={proprietaireId}
                onChange={(e) => setProprietaireId(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
              >
                {proprietaires.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nom} (Lot {p.lot})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
                Activité / Cotisation *
              </label>
              <select
                value={activiteId}
                onChange={(e) => {
                  const actId = e.target.value;
                  setActiviteId(actId);
                  const found = activites.find((a) => a.id === actId);
                  if (found) setMontant(found.montant);
                }}
                required
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
              >
                {activites.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.icone} {a.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
                Montant (FCFA) *
              </label>
              <input
                type="number"
                value={montant}
                onChange={(e) => setMontant(Number(e.target.value))}
                required
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
                Date de paiement *
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
                Statut du paiement *
              </label>
              <select
                value={statut}
                onChange={(e) => setStatut(e.target.value as PaiementStatut)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
              >
                <option value="en_attente">⏳ En attente</option>
                <option value="valide">✅ Validé</option>
                <option value="rejete">❌ Rejeté</option>
              </select>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
                Validé par
              </label>
              <input
                type="text"
                value={validePar}
                onChange={(e) => setValidePar(e.target.value)}
                placeholder="Nom du validateur"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
                Mode de paiement
              </label>
              <input
                type="text"
                value={modePaiement}
                onChange={(e) => setModePaiement(e.target.value)}
                placeholder="ex: Mobile Money (Wave, Orange), Virement, Espèces"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
                Référence / Reçu
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="ex: OM-20250301-44"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
              Note ou Commentaire
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Remarque ou détail de la transaction..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50 resize-none"
            />
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
              className="px-5 py-2 bg-forest-700 hover:bg-forest-800 text-white rounded-xl font-semibold shadow-md disabled:opacity-50"
            >
              {loading ? 'Sauvegarde...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
