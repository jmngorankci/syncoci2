import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Secteur, Proprietaire, Activite, Paiement, PaiementStatut } from '@/types/database';
import { INITIAL_SECTEURS, INITIAL_PROPRIETAIRES, INITIAL_ACTIVITES, INITIAL_PAIEMENTS } from '@/lib/initialData';

const STORAGE_KEYS = {
  SECTEURS: 'syndic_secteurs_v1',
  PROPRIETAIRES: 'syndic_proprietaires_v1',
  ACTIVITES: 'syndic_activites_v1',
  PAIEMENTS: 'syndic_paiements_v1',
};

// Local storage helpers
function getLocalItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error('Error reading localStorage', e);
    return fallback;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error writing localStorage', e);
  }
}

export const dataService = {
  isLiveSupabase(): boolean {
    return isSupabaseConfigured();
  },

  async getSecteurs(): Promise<Secteur[]> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('secteurs')
        .select('*')
        .order('nom', { ascending: true });
      if (!error && data && data.length > 0) {
        return data as Secteur[];
      }
    }
    return getLocalItem<Secteur[]>(STORAGE_KEYS.SECTEURS, INITIAL_SECTEURS);
  },

  async getProprietaires(): Promise<Proprietaire[]> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('proprietaires')
        .select('*')
        .order('lot', { ascending: true });
      if (!error && data && data.length > 0) {
        return data as Proprietaire[];
      }
    }
    return getLocalItem<Proprietaire[]>(STORAGE_KEYS.PROPRIETAIRES, INITIAL_PROPRIETAIRES);
  },

  async getActivites(): Promise<Activite[]> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('activites')
        .select('*')
        .order('nom', { ascending: true });
      if (!error && data && data.length > 0) {
        return data as Activite[];
      }
    }
    return getLocalItem<Activite[]>(STORAGE_KEYS.ACTIVITES, INITIAL_ACTIVITES);
  },

  async getPaiements(): Promise<Paiement[]> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('paiements')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as Paiement[];
      }
    }
    return getLocalItem<Paiement[]>(STORAGE_KEYS.PAIEMENTS, INITIAL_PAIEMENTS);
  },

  async addProprietaire(prop: Omit<Proprietaire, 'id'>): Promise<Proprietaire> {
    const supabase = getSupabase();
    const id = 'P' + String(Date.now()).slice(-4);
    const newProp: Proprietaire = { ...prop, id, statut: prop.statut || 'actif' };

    if (supabase) {
      const { data, error } = await supabase
        .from('proprietaires')
        .insert([newProp])
        .select()
        .single();
      if (!error && data) return data as Proprietaire;
    }

    const current = getLocalItem<Proprietaire[]>(STORAGE_KEYS.PROPRIETAIRES, INITIAL_PROPRIETAIRES);
    const updated = [...current, newProp];
    setLocalItem(STORAGE_KEYS.PROPRIETAIRES, updated);
    return newProp;
  },

  async addSecteur(secteur: Omit<Secteur, 'id'>): Promise<Secteur> {
    const supabase = getSupabase();
    const id = 'S' + String(Date.now()).slice(-3);
    const newSect: Secteur = { ...secteur, id };

    if (supabase) {
      const { data, error } = await supabase
        .from('secteurs')
        .insert([newSect])
        .select()
        .single();
      if (!error && data) return data as Secteur;
    }

    const current = getLocalItem<Secteur[]>(STORAGE_KEYS.SECTEURS, INITIAL_SECTEURS);
    const updated = [...current, newSect];
    setLocalItem(STORAGE_KEYS.SECTEURS, updated);
    return newSect;
  },

  async addActivite(act: Omit<Activite, 'id'>): Promise<Activite> {
    const supabase = getSupabase();
    const id = 'ACT' + String(Date.now()).slice(-3);
    const newAct: Activite = { ...act, id };

    if (supabase) {
      const { data, error } = await supabase
        .from('activites')
        .insert([newAct])
        .select()
        .single();
      if (!error && data) return data as Activite;
    }

    const current = getLocalItem<Activite[]>(STORAGE_KEYS.ACTIVITES, INITIAL_ACTIVITES);
    const updated = [...current, newAct];
    setLocalItem(STORAGE_KEYS.ACTIVITES, updated);
    return newAct;
  },

  async updateActivite(id: string, actData: Partial<Activite>): Promise<Activite | null> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('activites')
        .update(actData)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as Activite;
    }

    const current = getLocalItem<Activite[]>(STORAGE_KEYS.ACTIVITES, INITIAL_ACTIVITES);
    const updated = current.map(a => a.id === id ? { ...a, ...actData } : a);
    setLocalItem(STORAGE_KEYS.ACTIVITES, updated);
    return updated.find(a => a.id === id) || null;
  },

  async createPaiement(paymentData: Omit<Paiement, 'id' | 'statut' | 'date'>): Promise<Paiement> {
    const supabase = getSupabase();
    const id = 'PAY' + String(Date.now()).slice(-4);
    const date = new Date().toISOString().split('T')[0];
    const newPayment: Paiement = {
      ...paymentData,
      id,
      date,
      statut: 'en_attente',
    };

    if (supabase) {
      const { data, error } = await supabase
        .from('paiements')
        .insert([newPayment])
        .select()
        .single();
      if (!error && data) return data as Paiement;
    }

    const current = getLocalItem<Paiement[]>(STORAGE_KEYS.PAIEMENTS, INITIAL_PAIEMENTS);
    const updated = [newPayment, ...current];
    setLocalItem(STORAGE_KEYS.PAIEMENTS, updated);
    return newPayment;
  },

  async updatePaiementStatut(id: string, statut: PaiementStatut, validePar: string): Promise<Paiement | null> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('paiements')
        .update({ statut, valide_par: validePar })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as Paiement;
    }

    const current = getLocalItem<Paiement[]>(STORAGE_KEYS.PAIEMENTS, INITIAL_PAIEMENTS);
    const updated = current.map(p => p.id === id ? { ...p, statut, valide_par: validePar } : p);
    setLocalItem(STORAGE_KEYS.PAIEMENTS, updated);
    return updated.find(p => p.id === id) || null;
  },

  async seedSupabase(): Promise<{ success: boolean; message: string }> {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, message: 'Supabase n\'est pas encore configuré avec des clés valides.' };
    }

    try {
      // 1. Secteurs
      await supabase.from('secteurs').upsert(INITIAL_SECTEURS);
      // 2. Activités
      await supabase.from('activites').upsert(INITIAL_ACTIVITES);
      // 3. Propriétaires
      await supabase.from('proprietaires').upsert(INITIAL_PROPRIETAIRES);
      // 4. Paiements
      await supabase.from('paiements').upsert(INITIAL_PAIEMENTS);

      return { success: true, message: 'Base de données Supabase initialisée avec succès avec les données de démonstration !' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue lors de l\'initialisation';
      return { success: false, message };
    }
  },

  resetDemoData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.SECTEURS);
    localStorage.removeItem(STORAGE_KEYS.PROPRIETAIRES);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITES);
    localStorage.removeItem(STORAGE_KEYS.PAIEMENTS);
  }
};
