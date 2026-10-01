'use client';

import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, Copy, RefreshCw, X, KeyRound, ExternalLink } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { dataService } from '@/services/dataService';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const { isSupabaseLive } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyEnv = () => {
    const envText = `NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon-publique`;
    navigator.clipboard.writeText(envText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setSeedResult(null);
    const res = await dataService.seedSupabase();
    setSeedResult(res);
    setIsSeeding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-forest-900 to-forest-800 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-forest-700/60 border border-forest-500/40 text-emerald-300">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-white">Connexion Supabase Database</h2>
              <p className="text-xs text-forest-200">Gestion de la persistance PostgreSQL & Authentification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-forest-300 hover:text-white hover:bg-forest-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Box */}
          <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
            isSupabaseLive
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            {isSupabaseLive ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs space-y-1">
              <div className="font-semibold text-sm">
                {isSupabaseLive ? 'Supabase est connecté et opérationnel !' : 'Mode Démo / Données locales activé'}
              </div>
              <p className="text-gray-600 leading-relaxed">
                {isSupabaseLive
                  ? 'Vos données (propriétaires, activités, paiements, secteurs) sont synchronisées en direct avec votre base PostgreSQL Supabase.'
                  : 'L\'application fonctionne actuellement avec les données de démonstration réactives (localStorage). Pour connecter votre vraie base Supabase, renseignez vos identifiants dans .env.local.'}
              </p>
            </div>
          </div>

          {/* Step 1: SQL Schema */}
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-forest-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-forest-100 text-forest-800 flex items-center justify-center text-[10px]">1</span>
                Schéma SQL & Tables
              </span>
              <a 
                href="https://supabase.com/dashboard" 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs text-emerald-700 hover:underline flex items-center gap-1 font-medium"
              >
                Ouvrir Supabase Console <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-gray-600">
              Le fichier de migration complet contenant les 5 tables, clés étrangères, index, politiques RLS et triggers est disponible dans :
            </p>
            <div className="font-mono text-xs bg-white p-2.5 rounded-lg border border-gray-200 text-gray-700 flex items-center justify-between">
              <span>supabase/schema.sql</span>
              <span className="text-[10px] text-emerald-600 font-sans font-medium">✓ Créé et prêt</span>
            </div>
          </div>

          {/* Step 2: Env config */}
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-forest-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-forest-100 text-forest-800 flex items-center justify-center text-[10px]">2</span>
                Variables d'environnement (.env.local)
              </span>
              <button
                onClick={handleCopyEnv}
                className="text-xs flex items-center gap-1 text-forest-700 hover:text-forest-900 font-medium bg-white px-2 py-1 rounded border border-gray-200"
              >
                <Copy className="w-3 h-3" />
                {copied ? 'Copié !' : 'Copier exemple'}
              </button>
            </div>
            <div className="font-mono text-xs bg-slate-900 text-emerald-400 p-3 rounded-lg overflow-x-auto leading-relaxed">
              NEXT_PUBLIC_SUPABASE_URL=https://&lt;your-project&gt;.supabase.co<br />
              NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
            </div>
          </div>

          {/* Step 3: Seed Supabase */}
          {isSupabaseLive && (
            <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center text-[10px]">3</span>
                  Synchroniser les données initiales
                </span>
                <button
                  onClick={handleSeedDatabase}
                  disabled={isSeeding}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
                  {isSeeding ? 'Synchronisation...' : 'Peupler la base Supabase'}
                </button>
              </div>
              <p className="text-xs text-gray-600">
                Insère automatiquement les 4 secteurs, 12 copropriétaires, 6 cotisations types et les paiements d'exemple dans votre table Supabase.
              </p>
              {seedResult && (
                <div className={`p-3 rounded-lg text-xs font-medium ${
                  seedResult.success ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {seedResult.message}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-white text-xs font-medium rounded-lg hover:bg-gray-900 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
