'use client';

import React, { useState, useEffect } from 'react';
import { Proprietaire, Secteur } from '@/types/database';
import { X, UserCheck } from 'lucide-react';

interface EditProprietaireModalProps {
  isOpen: boolean;
  onClose: () => void;
  proprietaire: Proprietaire | null;
  secteurs: Secteur[];
  onUpdate: (id: string, data: Partial<Proprietaire>) => Promise<void>;
}

export const EditProprietaireModal: React.FC<EditProprietaireModalProps> = ({
  isOpen,
  onClose,
  proprietaire,
  secteurs,
  onUpdate,
}) => {
  const [nom, setNom] = useState('');
  const [tel, setTel] = useState('');
  const [email, setEmail] = useState('');
  const [lot, setLot] = useState('');
  const [ilot, setIlot] = useState('');
  const [secteurId, setSecteurId] = useState('');
  const [statut, setStatut] = useState<'actif' | 'inactif' | 'archive'>('actif');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (proprietaire) {
      setNom(proprietaire.nom);
      setTel(proprietaire.tel);
      setEmail(proprietaire.email);
      setLot(proprietaire.lot);
      setIlot(proprietaire.ilot || '');
      setSecteurId(proprietaire.secteur_id);
      setStatut(proprietaire.statut || 'actif');
    }
  }, [proprietaire]);

  if (!isOpen || !proprietaire) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !lot.trim()) return;

    setLoading(true);
    await onUpdate(proprietaire.id, {
      nom: nom.trim(),
      tel: tel.trim(),
      email: email.trim(),
      lot: lot.trim(),
      ilot: ilot.trim(),
      secteur_id: secteurId,
      statut,
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-lg w-full max-h-[90dvh] overflow-y-auto border border-gray-100">
        <div className="p-6 bg-forest-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="font-serif text-lg font-bold">Modifier le Copropriétaire : {proprietaire.nom}</h2>
          </div>
          <button onClick={onClose} className="p-1 text-forest-300 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
              Nom complet *
            </label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
                Numéro de Lot *
              </label>
              <input
                type="text"
                value={lot}
                onChange={(e) => setLot(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
                Îlot
              </label>
              <input
                type="text"
                value={ilot}
                onChange={(e) => setIlot(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
                Téléphone
              </label>
              <input
                type="text"
                value={tel}
                onChange={(e) => setTel(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
              />
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
                Adresse Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
                Secteur
              </label>
              <select
                value={secteurId}
                onChange={(e) => setSecteurId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
              >
                <option value="">Non assigné</option>
                {secteurs.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nom} ({s.responsable})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
                Statut
              </label>
              <select
                value={statut}
                onChange={(e) => setStatut(e.target.value as 'actif' | 'inactif' | 'archive')}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
              >
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
                <option value="archive">Archivé</option>
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
              {loading ? 'Sauvegarde...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
