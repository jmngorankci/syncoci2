'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/database';
import { 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  Home, 
  Lock, 
  User, 
  ArrowRight
} from 'lucide-react';

interface LoginScreenProps {
  onOpenSupabaseConfig?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = () => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('proprietaire');
  const [identifier, setIdentifier] = useState('Lot 1');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);
    if (role === 'admin') setIdentifier('admin');
    else if (role === 'responsable') setIdentifier('Secteur 1');
    else setIdentifier('Lot 1');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Veuillez saisir votre identifiant ou numéro de lot.');
      return;
    }
    setLoading(true);
    setError(null);

    const success = await login(selectedRole, identifier, password);
    if (!success) {
      setError('Identifiant introuvable ou erreur de connexion.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1e12] via-[#133020] to-[#1e4a32] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
          {/* Logo Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-forest-600 to-forest-800 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-forest-900/20 text-white">
              <Building2 className="w-7 h-7 text-emerald-300" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Syndic<span className="text-emerald-600">Cité</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Plateforme de gestion de copropriété & cotisations
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Tabs */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                Se connecter en tant que
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('proprietaire')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    selectedRole === 'proprietaire'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm font-semibold'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Home className={`w-4 h-4 mb-1 ${selectedRole === 'proprietaire' ? 'text-emerald-600' : 'text-gray-400'}`} />
                  <span>Propriétaire</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('responsable')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    selectedRole === 'responsable'
                      ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-sm font-semibold'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <UserCheck className={`w-4 h-4 mb-1 ${selectedRole === 'responsable' ? 'text-amber-600' : 'text-gray-400'}`} />
                  <span>Responsable</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('admin')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    selectedRole === 'admin'
                      ? 'border-forest-700 bg-forest-50 text-forest-900 shadow-sm font-semibold'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <ShieldCheck className={`w-4 h-4 mb-1 ${selectedRole === 'admin' ? 'text-forest-700' : 'text-gray-400'}`} />
                  <span>Syndic Admin</span>
                </button>
              </div>
            </div>

            {/* Identifier Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                {selectedRole === 'proprietaire' ? 'N° de lot ou Nom' : selectedRole === 'responsable' ? 'Nom du responsable' : 'Identifiant'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={selectedRole === 'proprietaire' ? 'Ex: Lot 1 ou Kouamé' : selectedRole === 'responsable' ? 'Ex: Secteur 1' : 'admin'}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50/50"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50/50"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-forest-700 to-forest-600 hover:from-forest-800 hover:to-forest-700 text-white font-medium text-sm shadow-md shadow-forest-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Connexion en cours...' : 'Accéder à l\'espace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-forest-300/80 mt-6">
          SyndicCité © {new Date().getFullYear()} — Solution certifiée copropriétés modernes
        </p>
      </div>
    </div>
  );
};
