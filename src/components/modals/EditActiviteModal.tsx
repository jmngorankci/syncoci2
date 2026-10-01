'use client';

import React, { useState, useEffect } from 'react';
import { Activite, Periodicite } from '@/types/database';
import { X, Edit2 } from 'lucide-react';

interface EditActiviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  activite: Activite | null;
  onUpdate: (id: string, data: Partial<Activite>) => Promise<void>;
}

export const EditActiviteModal: React.FC<EditActiviteModalProps> = ({
  isOpen,
  onClose,
  activite,
  onUpdate,
}) => {
  const [nom, setNom] = useState('');
  const [icone, setIcone] = useState('🛡️');
  const [montant, setMontant] = useState(5000);
  const [periodicite, setPeriodicite] = useState<Periodicite>('mensuel');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activite) {
      setNom(activite.nom);
      setIcone(activite.icone);
      setMontant(activite.montant);
      setPeriodicite(activite.periodicite);
      setDescription(activite.description || '');
    }
  }, [activite]);

  if (!isOpen || !activite) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !montant) return;

    setLoading(true);
    await onUpdate(activite.id, {
      nom: nom.trim(),
      icone: icone.trim() || '💼',
      montant: Number(montant),
      periodicite,
      description: description.trim(),
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100">
        <div className="p-6 bg-forest-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Edit2 className="w-5 h-5 text-emerald-400" />
            <h2 className="font-serif text-lg font-bold">Modifier l'Activité : {activite.nom}</h2>
          </div>
          <button onClick={onClose} className="p-1 text-forest-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">Nom de l'activité *</label>
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
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">Icône (Emoji)</label>
              <input
                type="text"
                value={icone}
                onChange={(e) => setIcone(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
              />
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">Montant (FCFA) *</label>
              <input
                type="number"
                value={montant}
                onChange={(e) => setMontant(Number(e.target.value))}
                required
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">Périodicité</label>
            <select
              value={periodicite}
              onChange={(e) => setPeriodicite(e.target.value as Periodicite)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
            >
              <option value="mensuel">Mensuel</option>
              <option value="trimestriel">Trimestriel</option>
              <option value="semestriel">Semestriel</option>
              <option value="annuel">Annuel</option>
              <option value="ponctuel">Ponctuel</option>
            </select>
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
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
