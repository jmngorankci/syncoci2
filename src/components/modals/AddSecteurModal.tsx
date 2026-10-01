'use client';

import React, { useState } from 'react';
import { Secteur } from '@/types/database';
import { X, Plus, MapPin } from 'lucide-react';

interface AddSecteurModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: Omit<Secteur, 'id'>) => Promise<void>;
}

export const AddSecteurModal: React.FC<AddSecteurModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [nom, setNom] = useState('');
  const [responsable, setResponsable] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !responsable.trim()) return;

    setLoading(true);
    await onAdd({
      nom: nom.trim(),
      responsable: responsable.trim(),
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100">
        <div className="p-6 bg-forest-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <h2 className="font-serif text-lg font-bold">Nouveau Secteur</h2>
          </div>
          <button onClick={onClose} className="p-1 text-forest-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">Nom du secteur *</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Secteur E — Centre ou Zone Villas"
              required
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">Nom du responsable désigné *</label>
            <input
              type="text"
              value={responsable}
              onChange={(e) => setResponsable(e.target.value)}
              placeholder="Ex: Paul Yao"
              required
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
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
              {loading ? 'Création...' : 'Créer le secteur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
