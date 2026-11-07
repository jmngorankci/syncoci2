'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, PasswordRecoveryResult } from '@/context/AuthContext';
import { UserRole } from '@/types/database';
import {
  Building2,
  ShieldCheck,
  UserCheck,
  Home,
  Lock,
  User,
  Mail,
  ArrowRight,
  Send,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';

interface LoginScreenProps {
  onOpenSupabaseConfig?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = () => {
  const { login, lastLoginError, recoverPasswordByEmail, lookupUserEmail } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('proprietaire');
  const [identifier, setIdentifier] = useState('Lot 1');
  const [password, setPassword] = useState('demo1234');
  const [showPassword, setShowPassword] = useState(false);

  // État pour la case à cocher "Mot de passe oublié"
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryResult, setRecoveryResult] = useState<PasswordRecoveryResult | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Pré-remplir l'email enregistré lorsqu'on coche "Mot de passe oublié" ou change d'identifiant
  useEffect(() => {
    if (!isForgotPassword || !identifier.trim()) return;
    let active = true;
    lookupUserEmail(selectedRole, identifier).then((foundEmail) => {
      if (active && foundEmail) {
        setRecoveryEmail(foundEmail);
      }
    });
    return () => {
      active = false;
    };
  }, [isForgotPassword, selectedRole, identifier, lookupUserEmail]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);
    setRecoveryResult(null);
    if (role === 'admin') setIdentifier('admin');
    else if (role === 'responsable') setIdentifier('Secteur 1');
    else setIdentifier('Lot 1');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRecoveryResult(null);

    if (!identifier.trim()) {
      setError('Veuillez saisir votre identifiant ou numéro de lot.');
      return;
    }

    // Mode "Mot de passe oublié" coché -> Envoi du mot de passe par email
    if (isForgotPassword) {
      if (!recoveryEmail.trim() || !recoveryEmail.includes('@')) {
        setError('Veuillez saisir votre adresse email pour recevoir votre mot de passe.');
        return;
      }
      setLoading(true);
      const res = await recoverPasswordByEmail(selectedRole, identifier, recoveryEmail);
      setLoading(false);

      if (!res.success) {
        setError(res.message);
      } else {
        setRecoveryResult(res);
      }
      return;
    }

    // Mode Connexion standard
    setLoading(true);
    const success = await login(selectedRole, identifier, password);
    if (!success) {
      setError(lastLoginError || 'Identifiant ou mot de passe incorrect.');
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
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/25 border border-emerald-400/40 text-white">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight">
              <span className="text-orange-500">SYNCOCI</span>{' '}
              <span className="text-emerald-500">2</span>
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-emerald-600 mt-1">
              Gestion des Copropriétaires de la Cité Ivoire 2
            </p>
          </div>

          {(error || lastLoginError) && !recoveryResult && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error || lastLoginError}
            </div>
          )}

          {recoveryResult && recoveryResult.success && (
            <div className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <div className="font-bold text-emerald-950">Email envoyé avec succès !</div>
                  <p className="mt-0.5 text-emerald-800">{recoveryResult.message}</p>
                </div>
              </div>

              {recoveryResult.emailBodyPreview && (
                <div className="p-2.5 rounded-xl bg-white border border-emerald-200/80 text-[11px] font-mono text-gray-700 whitespace-pre-line">
                  {recoveryResult.emailBodyPreview}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                {recoveryResult.mailtoUrl && (
                  <a
                    href={recoveryResult.mailtoUrl}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-600 hover:text-orange-700 underline"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Ouvrir dans mon client mail</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setRecoveryResult(null);
                    setError(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold transition-colors ml-auto"
                >
                  Retour à la connexion
                </button>
              </div>
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
                  <Home
                    className={`w-4 h-4 mb-1 ${
                      selectedRole === 'proprietaire' ? 'text-emerald-600' : 'text-gray-400'
                    }`}
                  />
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
                  <UserCheck
                    className={`w-4 h-4 mb-1 ${
                      selectedRole === 'responsable' ? 'text-amber-600' : 'text-gray-400'
                    }`}
                  />
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
                  <ShieldCheck
                    className={`w-4 h-4 mb-1 ${
                      selectedRole === 'admin' ? 'text-forest-700' : 'text-gray-400'
                    }`}
                  />
                  <span>Syndic Admin</span>
                </button>
              </div>
            </div>

            {/* Identifier Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                {selectedRole === 'proprietaire'
                  ? 'N° de lot ou Nom'
                  : selectedRole === 'responsable'
                  ? 'Nom du responsable ou secteur'
                  : 'Identifiant'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setError(null);
                  }}
                  placeholder={
                    selectedRole === 'proprietaire'
                      ? 'Ex: Lot 1 ou BOKA'
                      : selectedRole === 'responsable'
                      ? 'Ex: Secteur 1'
                      : 'admin'
                  }
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50/50"
                  required
                />
              </div>
            </div>

            {/* Password Input OR Recovery Email Input when "Mot de passe oublié" is checked */}
            {!isForgotPassword ? (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-orange-900">
                  Adresse email de réception *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-orange-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="Saisissez votre adresse email..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    required
                  />
                </div>
                <p className="text-[11px] text-orange-800/80 leading-snug">
                  Votre mot de passe associé à <strong>{identifier || 'votre compte'}</strong> vous
                  sera immédiatement envoyé à cette adresse email.
                </p>
              </div>
            )}

            {/* Checkbox "Mot de passe oublié" */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={isForgotPassword}
                  onChange={(e) => {
                    setIsForgotPassword(e.target.checked);
                    setError(null);
                    setRecoveryResult(null);
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                />
                <span className="text-xs font-semibold text-gray-600 group-hover:text-orange-600 transition-colors">
                  Mot de passe oublié
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl text-white font-medium text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2 ${
                isForgotPassword
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-900/20'
                  : 'bg-gradient-to-r from-forest-700 to-forest-600 hover:from-forest-800 hover:to-forest-700 shadow-forest-900/20'
              }`}
            >
              {isForgotPassword ? (
                <>
                  <Send className="w-4 h-4" />
                  <span>
                    {loading
                      ? 'Envoi de l’email en cours...'
                      : 'Envoyer mon mot de passe par email'}
                  </span>
                </>
              ) : (
                <>
                  <span>{loading ? 'Connexion en cours...' : "Accéder à l'espace"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-emerald-300/90 mt-6">
          <span className="font-bold text-orange-400">SYNCOCI 2</span> © {new Date().getFullYear()}{' '}
          — Gestion des Copropriétaires de la Cité Ivoire 2
        </p>
      </div>
    </div>
  );
};
