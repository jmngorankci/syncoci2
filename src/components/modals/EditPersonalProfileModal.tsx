'use client';

import React, { useState, useEffect } from 'react';
import { Proprietaire } from '@/types/database';
import { X, UserCheck, ShieldCheck } from 'lucide-react';

interface EditPersonalProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  proprietaire: Proprietaire | null;
  onUpdate: (id: string, data: { nom: string; tel: string; email: string }) => Promise<void>;
}

export const EditPersonalProfileModal: React.FC<EditPersonalProfileModalProps> = ({
  isOpen,
  onClose,
  proprietaire,
  onUpdate,
}) => {
  const [nom, setNom] = useState('');
  const [tel, setTel] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (proprietaire) {
      setNom(proprietaire.nom);
      setTel(proprietaire.tel);
      setEmail(proprietaire.email);
    }
  }, [proprietaire]);

  if (!isOpen || !proprietaire) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return;

    setLoading(true);
    await onUpdate(proprietaire.id, {
      nom: nom.trim(),
      tel: tel.trim(),
      email: email.trim(),
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[90dvh] overflow-y-auto border border-gray-100">
        <div className="p-6 bg-forest-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="font-serif text-lg font-bold">Modifier mes informations</h2>
              <p className="text-xs text-forest-200">Mise à jour de vos coordonnées personnelles</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-forest-300 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Read-only info banner */}
          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono font-bold text-xs">
                LOT {proprietaire.lot}
              </span>
              <span className="text-gray-500 text-xs">Îlot {proprietaire.ilot}</span>
            </div>
            <span className="text-[11px] text-gray-400 font-medium">Affectation fixe</span>
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
              Nom et Prénoms *
            </label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
              placeholder="Votre nom complet"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
              Numéro de Téléphone *
            </label>
            <input
              type="text"
              value={tel}
              onChange={(e) => setTel(e.target.value)}
              required
              placeholder="ex: 07 12 34 56"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
              Adresse Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="votre.email@domaine.ci"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
            />
          </div>

          <div className="pt-2 text-[11px] text-gray-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-forest-600 shrink-0" />
            <span>Vos données sont utilisées par le syndic pour l'envoi de reçus et notifications.</span>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl text-xs font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-semibold shadow-md disabled:opacity-50"
            >
              {loading ? 'Sauvegarde...' : 'Enregistrer mes informations'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
