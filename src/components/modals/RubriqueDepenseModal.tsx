'use client';

import React, { useState, useEffect } from 'react';
import { RubriqueDepense, FamilleRubrique } from '@/types/database';
import { FAMILLES_RUBRIQUES_LABELS } from '@/lib/defaultRubriques';
import { X, FolderKanban } from 'lucide-react';

interface RubriqueDepenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRubrique?: RubriqueDepense | null;
  onSave: (data: Omit<RubriqueDepense, 'id'>, existingId?: string) => Promise<void>;
}

const SUGGESTED_ICONS = ['🛡️', '🌿', '💡', '🛣️', '📁', '⚖️', '🤝', '🚨', '🔧', '💧', '🧹', '🏗️'];

export const RubriqueDepenseModal: React.FC<RubriqueDepenseModalProps> = ({
  isOpen,
  onClose,
  editingRubrique,
  onSave,
}) => {
  const [nom, setNom] = useState('');
  const [icone, setIcone] = useState('🛡️');
  const [famille, setFamille] = useState<FamilleRubrique>('exploitation');
  const [budgetMensuel, setBudgetMensuel] = useState<number>(0);
  const [statut, setStatut] = useState<'actif' | 'inactif'>('actif');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingRubrique) {
      setNom(editingRubrique.nom);
      setIcone(editingRubrique.icone || '📋');
      setFamille(editingRubrique.famille || 'exploitation');
      setBudgetMensuel(Number(editingRubrique.budget_mensuel) || 0);
      setStatut(editingRubrique.statut || 'actif');
      setDescription(editingRubrique.description || '');
    } else {
      setNom('');
      setIcone('🛡️');
      setFamille('exploitation');
      setBudgetMensuel(0);
      setStatut('actif');
      setDescription('');
    }
  }, [editingRubrique, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return;

    setLoading(true);
    await onSave(
      {
        nom: nom.trim(),
        icone: icone.trim() || '📋',
        famille,
        budget_mensuel: Math.max(0, Number(budgetMensuel) || 0),
        statut,
        description: description.trim(),
      },
      editingRubrique?.id
    );
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100">
        <div className="p-6 bg-forest-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FolderKanban className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="font-serif text-lg font-bold">
                {editingRubrique ? 'Modifier la Rubrique de Dépense' : 'Nouvelle Rubrique de Dépense'}
              </h2>
              <p className="text-[11px] text-forest-200">
                Paramétrage des postes budgétaires de sorties de caisse
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-forest-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
              Intitulé de la rubrique *
            </label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Sécurité & Gardiennage, Entretien Groupe Électrogène..."
              required
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
                Famille comptable *
              </label>
              <select
                value={famille}
                onChange={(e) => setFamille(e.target.value as FamilleRubrique)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
              >
                {(Object.keys(FAMILLES_RUBRIQUES_LABELS) as FamilleRubrique[]).map((key) => (
                  <option key={key} value={key}>
                    {FAMILLES_RUBRIQUES_LABELS[key].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
                Statut de la rubrique
              </label>
              <select
                value={statut}
                onChange={(e) => setStatut(e.target.value as 'actif' | 'inactif')}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
              >
                <option value="actif">Actif (utilisable en saisie)</option>
                <option value="inactif">Inactif (archivé)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
                Icône visuelle
              </label>
              <input
                type="text"
                value={icone}
                onChange={(e) => setIcone(e.target.value)}
                placeholder="🛡️"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {SUGGESTED_ICONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcone(emoji)}
                    className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center border transition-all ${
                      icone === emoji
                        ? 'bg-emerald-100 border-emerald-400 scale-105'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
                Budget mensuel indicatif (FCFA)
              </label>
              <input
                type="number"
                min={0}
                step={500}
                value={budgetMensuel}
                onChange={(e) => setBudgetMensuel(Number(e.target.value))}
                placeholder="0 (sans plafond)"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Laissez 0 si aucun plafond mensuel n’est fixé pour ce poste.
              </p>
            </div>
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-gray-600 mb-1">
              Description & périmètre des charges couvertes
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Salaires des vigiles, achat d'équipements de ronde, entretien de la guérite..."
              rows={3}
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
              {loading
                ? 'Enregistrement...'
                : editingRubrique
                ? 'Enregistrer les modifications'
                : 'Créer la rubrique'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

