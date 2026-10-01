'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CurrentUser, UserRole, Proprietaire, Secteur } from '@/types/database';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { dataService } from '@/services/dataService';

interface AuthContextType {
  user: CurrentUser | null;
  role: UserRole;
  isSupabaseLive: boolean;
  isLoading: boolean;
  login: (role: UserRole, identifier: string, password?: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  selectDemoProfile: (profile: CurrentUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [role, setRole] = useState<UserRole>('admin');
  const [isSupabaseLive, setIsSupabaseLive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsSupabaseLive(isSupabaseConfigured());

    // Restore saved session or default admin demo session
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

  const login = async (selectedRole: UserRole, identifier: string, _password?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const secteurs = await dataService.getSecteurs();
      const proprietaires = await dataService.getProprietaires();

      let loggedUser: CurrentUser;

      if (selectedRole === 'admin') {
        loggedUser = {
          id: 'admin-01',
          nom: 'Administrateur Syndic',
          email: 'admin@syndicite.ci',
          role: 'admin',
          initiales: 'AD',
          secteur_id: null,
          proprietaire_id: null,
        };
      } else if (selectedRole === 'responsable') {
        const foundSecteur = secteurs.find(s =>
          s.responsable.toLowerCase().includes(identifier.toLowerCase()) ||
          s.nom.toLowerCase().includes(identifier.toLowerCase())
        ) || secteurs[0];

        loggedUser = {
          id: `resp-${foundSecteur.id}`,
          nom: foundSecteur.responsable,
          email: `${foundSecteur.responsable.toLowerCase().replace(/\s+/g, '.')}@syndicite.ci`,
          role: 'responsable',
          initiales: foundSecteur.responsable.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
          secteur_id: foundSecteur.id,
          proprietaire_id: null,
        };
      } else {
        const foundProp = proprietaires.find(p =>
          p.lot.toLowerCase() === identifier.toLowerCase() ||
          p.nom.toLowerCase().includes(identifier.toLowerCase()) ||
          p.id.toLowerCase() === identifier.toLowerCase()
        ) || proprietaires[0];

        loggedUser = {
          id: foundProp.id,
          nom: foundProp.nom,
          email: foundProp.email,
          role: 'proprietaire',
          initiales: foundProp.nom.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
          secteur_id: foundProp.secteur_id,
          proprietaire_id: foundProp.id,
          lot: foundProp.lot,
        };
      }

      setUser(loggedUser);
      setRole(loggedUser.role);
      localStorage.setItem('syndic_auth_user', JSON.stringify(loggedUser));
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Login error', err);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('syndic_auth_user');
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === role && user) return;
    // Auto switch to default representative user of that role
    if (newRole === 'admin') {
      login('admin', 'admin');
    } else if (newRole === 'responsable') {
      login('responsable', 'Kofi');
    } else {
      login('proprietaire', 'A01');
    }
  };

  const selectDemoProfile = (profile: CurrentUser) => {
    setUser(profile);
    setRole(profile.role);
    localStorage.setItem('syndic_auth_user', JSON.stringify(profile));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isSupabaseLive,
        isLoading,
        login,
        logout,
        switchRole,
        selectDemoProfile,
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
