'use client';

import React, { useState } from 'react';
import { Secteur, Proprietaire } from '@/types/database';
import { X, UserPlus } from 'lucide-react';

interface AddProprietaireModalProps {
  isOpen: boolean;
  onClose: () => void;
  secteurs: Secteur[];
  onAdd: (data: Omit<Proprietaire, 'id'>) => Promise<void>;
}

export const AddProprietaireModal: React.FC<AddProprietaireModalProps> = ({
  isOpen,
  onClose,
  secteurs,
  onAdd,
}) => {
  const [nom, setNom] = useState('');
  const [tel, setTel] = useState('');
  const [email, setEmail] = useState('');
  const [lot, setLot] = useState('');
  const [ilot, setIlot] = useState('1');
  const [secteurId, setSecteurId] = useState(secteurs[0]?.id || 'S1');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !lot.trim()) return;

    setLoading(true);
    await onAdd({
      nom: nom.trim(),
      tel: tel.trim(),
      email: email.trim() || `${lot.toLowerCase()}@syndicite.ci`,
      lot: lot.trim().toUpperCase(),
      ilot: ilot.trim(),
      secteur_id: secteurId,
      statut: 'actif',
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100">
        <div className="p-6 bg-forest-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserPlus className="w-5 h-5 text-emerald-400" />
            <h2 className="font-serif text-lg font-bold">Nouveau Copropriétaire</h2>
          </div>
          <button onClick={onClose} className="p-1 text-forest-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">Nom complet *</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex: Kouamé Brou"
                required
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
              />
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">Téléphone</label>
              <input
                type="text"
                value={tel}
                onChange={(e) => setTel(e.target.value)}
                placeholder="07 XX XX XX"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@domaine.ci"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">N° Lot *</label>
              <input
                type="text"
                value={lot}
                onChange={(e) => setLot(e.target.value)}
                placeholder="A05"
                required
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50 font-mono font-bold uppercase"
              />
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">Îlot</label>
              <input
                type="text"
                value={ilot}
                onChange={(e) => setIlot(e.target.value)}
                placeholder="2"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
              />
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">Secteur</label>
              <select
                value={secteurId}
                onChange={(e) => setSecteurId(e.target.value)}
                className="w-full px-2.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
              >
                {secteurs.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nom}
                  </option>
                ))}
              </select>
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
              className="px-5 py-2 bg-forest-700 hover:bg-forest-800 text-white rounded-xl font-semibold shadow-md disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Créer le copropriétaire'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
