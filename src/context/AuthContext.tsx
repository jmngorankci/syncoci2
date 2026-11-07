'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CurrentUser, UserRole } from '@/types/database';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { dataService } from '@/services/dataService';

const PASSWORDS_STORAGE_KEY = 'syndic_user_passwords_v1';
const EMAILS_STORAGE_KEY = 'syndic_user_emails_v1';
const DEFAULT_PASSWORD = 'demo1234';

function getStoredMap(key: string): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setStoredMap(key: string, map: Record<string, string>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(map));
  } catch (e) {
    console.error('Error saving to localStorage', e);
  }
}

export interface PasswordRecoveryResult {
  success: boolean;
  message: string;
  email?: string;
  userName?: string;
  mailtoUrl?: string;
  emailBodyPreview?: string;
}

interface AuthContextType {
  user: CurrentUser | null;
  role: UserRole;
  isSupabaseLive: boolean;
  isLoading: boolean;
  login: (role: UserRole, identifier: string, password?: string) => Promise<boolean>;
  lastLoginError: string | null;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  selectDemoProfile: (profile: CurrentUser) => void;
  updateCurrentUser: (data: Partial<CurrentUser>) => void;
  changePassword: (
    currentPassword: string,
    newPassword: string,
    updatedEmail?: string
  ) => Promise<{ success: boolean; message: string }>;
  recoverPasswordByEmail: (
    role: UserRole,
    identifier: string,
    emailInput?: string
  ) => Promise<PasswordRecoveryResult>;
  lookupUserEmail: (role: UserRole, identifier: string) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [role, setRole] = useState<UserRole>('admin');
  const [isSupabaseLive, setIsSupabaseLive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastLoginError, setLastLoginError] = useState<string | null>(null);

  useEffect(() => {
    setIsSupabaseLive(isSupabaseConfigured());

    const savedUser = localStorage.getItem('syndic_auth_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setRole(parsed.role);
      } catch (e) {
        console.error(e);
      }
    }
    setIsLoading(false);
  }, []);

  const resolveUserAccount = async (
    selectedRole: UserRole,
    identifier: string
  ): Promise<CurrentUser | null> => {
    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId) return null;

    const customEmails = getStoredMap(EMAILS_STORAGE_KEY);

    if (selectedRole === 'admin') {
      if (cleanId !== 'admin' && !cleanId.includes('syndic') && !cleanId.includes('admin')) {
        return null;
      }
      const id = 'admin-01';
      return {
        id,
        nom: 'Administrateur Syndic',
        email: customEmails[id] || 'admin@syncoci2.ci',
        role: 'admin',
        initiales: 'AD',
        secteur_id: null,
        proprietaire_id: null,
      };
    }

    if (selectedRole === 'responsable') {
      const secteurs = await dataService.getSecteurs();
      const foundSecteur = secteurs.find(
        (s) =>
          s.responsable.toLowerCase().includes(cleanId) ||
          s.nom.toLowerCase().includes(cleanId) ||
          s.id.toLowerCase() === cleanId
      );
      if (!foundSecteur) return null;

      const id = `resp-${foundSecteur.id}`;
      const defaultEmail = `${foundSecteur.id.toLowerCase()}@syncoci2.ci`;
      return {
        id,
        nom: foundSecteur.responsable,
        email: customEmails[id] || defaultEmail,
        role: 'responsable',
        initiales: foundSecteur.responsable
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
        secteur_id: foundSecteur.id,
        proprietaire_id: null,
      };
    }

    // Propriétaire
    const proprietaires = await dataService.getProprietaires();
    // Exact lot match first (e.g. "Lot 1" vs "Lot 10"), then ID match, then name match
    const foundProp =
      proprietaires.find((p) => p.lot.trim().toLowerCase() === cleanId) ||
      proprietaires.find((p) => `lot ${p.lot.trim().toLowerCase()}` === cleanId) ||
      proprietaires.find((p) => p.id.toLowerCase() === cleanId) ||
      proprietaires.find((p) => p.nom.toLowerCase().includes(cleanId));

    if (!foundProp) return null;

    return {
      id: foundProp.id,
      nom: foundProp.nom,
      email: customEmails[foundProp.id] || foundProp.email || '',
      role: 'proprietaire',
      initiales: foundProp.nom
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      secteur_id: foundProp.secteur_id,
      proprietaire_id: foundProp.id,
      lot: foundProp.lot,
    };
  };

  const getUserExpectedPassword = (userId: string): string => {
    const passwords = getStoredMap(PASSWORDS_STORAGE_KEY);
    return passwords[userId] || DEFAULT_PASSWORD;
  };

  const login = async (
    selectedRole: UserRole,
    identifier: string,
    password?: string
  ): Promise<boolean> => {
    setLastLoginError(null);
    try {
      const account = await resolveUserAccount(selectedRole, identifier);
      if (!account) {
        setLastLoginError('Identifiant ou numéro de lot introuvable pour ce profil.');
        return false;
      }

      const expectedPassword = getUserExpectedPassword(account.id);
      if (password !== undefined && password !== expectedPassword) {
        setLastLoginError('Mot de passe incorrect. Cochez « Mot de passe oublié » si nécessaire.');
        return false;
      }

      setUser(account);
      setRole(account.role);
      localStorage.setItem('syndic_auth_user', JSON.stringify(account));
      return true;
    } catch (err) {
      console.error('Login error', err);
      setLastLoginError('Une erreur est survenue lors de la connexion.');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setLastLoginError(null);
    localStorage.removeItem('syndic_auth_user');
  };

  const switchRole = async (newRole: UserRole) => {
    if (newRole === role && user) return;
    const defaultId =
      newRole === 'admin' ? 'admin' : newRole === 'responsable' ? 'Secteur 1' : 'Lot 1';
    const account = await resolveUserAccount(newRole, defaultId);
    if (account) {
      setUser(account);
      setRole(account.role);
      localStorage.setItem('syndic_auth_user', JSON.stringify(account));
    }
  };

  const selectDemoProfile = (profile: CurrentUser) => {
    setUser(profile);
    setRole(profile.role);
    localStorage.setItem('syndic_auth_user', JSON.stringify(profile));
  };

  const updateCurrentUser = (data: Partial<CurrentUser>) => {
    if (!user) return;
    const updated: CurrentUser = {
      ...user,
      ...data,
      initiales: (data.nom || user.nom)
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    };
    setUser(updated);
    localStorage.setItem('syndic_auth_user', JSON.stringify(updated));

    if (data.email !== undefined) {
      const emails = getStoredMap(EMAILS_STORAGE_KEY);
      emails[user.id] = data.email;
      setStoredMap(EMAILS_STORAGE_KEY, emails);
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
    updatedEmail?: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'Aucun utilisateur connecté.' };
    }

    const expected = getUserExpectedPassword(user.id);
    if (currentPassword !== expected) {
      return {
        success: false,
        message: 'Le mot de passe actuel saisi est incorrect.',
      };
    }

    if (!newPassword || newPassword.trim().length < 4) {
      return {
        success: false,
        message: 'Le nouveau mot de passe doit contenir au moins 4 caractères.',
      };
    }

    // Save new password for this user ID
    const passwords = getStoredMap(PASSWORDS_STORAGE_KEY);
    passwords[user.id] = newPassword.trim();
    setStoredMap(PASSWORDS_STORAGE_KEY, passwords);

    // Save updated email if provided
    if (updatedEmail !== undefined && updatedEmail.trim() !== '') {
      const cleanEmail = updatedEmail.trim();
      const emails = getStoredMap(EMAILS_STORAGE_KEY);
      emails[user.id] = cleanEmail;
      setStoredMap(EMAILS_STORAGE_KEY, emails);

      // If proprietaire, also update email in Supabase proprietaires table
      if (user.role === 'proprietaire' && user.proprietaire_id) {
        try {
          await dataService.updateProprietaire(user.proprietaire_id, { email: cleanEmail });
        } catch (e) {
          console.warn('Could not sync email to Supabase:', e);
        }
      }

      updateCurrentUser({ email: cleanEmail });
    }

    return {
      success: true,
      message: 'Votre mot de passe a été modifié avec succès.',
    };
  };

  const lookupUserEmail = async (selectedRole: UserRole, identifier: string): Promise<string> => {
    const account = await resolveUserAccount(selectedRole, identifier);
    return account?.email || '';
  };

  const recoverPasswordByEmail = async (
    selectedRole: UserRole,
    identifier: string,
    emailInput?: string
  ): Promise<PasswordRecoveryResult> => {
    const account = await resolveUserAccount(selectedRole, identifier);
    if (!account) {
      return {
        success: false,
        message: 'Aucun compte trouvé avec cet identifiant ou numéro de lot.',
      };
    }

    const targetEmail = (emailInput?.trim() || account.email || '').trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      return {
        success: false,
        message:
          'Veuillez saisir une adresse email valide pour recevoir votre mot de passe.',
      };
    }

    // Save this email for future recoveries if it was provided
    const emails = getStoredMap(EMAILS_STORAGE_KEY);
    emails[account.id] = targetEmail;
    setStoredMap(EMAILS_STORAGE_KEY, emails);

    if (account.role === 'proprietaire' && account.proprietaire_id) {
      try {
        await dataService.updateProprietaire(account.proprietaire_id, { email: targetEmail });
      } catch {
        // Ignore error
      }
    }

    const userPassword = getUserExpectedPassword(account.id);
    const roleLabel =
      selectedRole === 'admin'
        ? 'Syndic Admin'
        : selectedRole === 'responsable'
        ? 'Responsable de secteur'
        : `Copropriétaire (${account.lot || identifier})`;

    try {
      const response = await fetch('/api/send-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          userName: account.nom,
          identifier: account.lot || identifier.trim(),
          roleLabel,
          password: userPassword,
        }),
      });

      const result = await response.json();
      const subject = encodeURIComponent(
        `SYNCOCI 2 — Récupération de votre mot de passe (${account.lot || identifier.trim()})`
      );
      const bodyText =
        result?.emailPreview?.body ||
        `Bonjour ${account.nom},\n\nVoici vos paramètres de connexion SYNCOCI 2 :\n- Profil : ${roleLabel}\n- Identifiant : ${
          account.lot || identifier.trim()
        }\n- Mot de passe : ${userPassword}\n\nLe Bureau du Syndic — SYNCOCI 2`;
      const mailtoUrl = `mailto:${encodeURIComponent(targetEmail)}?subject=${subject}&body=${encodeURIComponent(
        bodyText
      )}`;

      return {
        success: true,
        message: `Un email contenant le mot de passe de ${account.nom} a été envoyé à l'adresse ${targetEmail}.`,
        email: targetEmail,
        userName: account.nom,
        mailtoUrl,
        emailBodyPreview: bodyText,
      };
    } catch (err) {
      console.error('Error sending password recovery email:', err);
      return {
        success: false,
        message: 'Une erreur est survenue lors de l’envoi de l’email.',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isSupabaseLive,
        isLoading,
        login,
        lastLoginError,
        logout,
        switchRole,
        selectDemoProfile,
        updateCurrentUser,
        changePassword,
        recoverPasswordByEmail,
        lookupUserEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
