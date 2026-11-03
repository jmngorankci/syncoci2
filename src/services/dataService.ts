import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  Secteur,
  Proprietaire,
  Activite,
  Paiement,
  PaiementStatut,
  RubriqueDepense,
  Depense,
  DepenseStatut,
  UserRole,
} from '@/types/database';
import { INITIAL_SECTEURS, INITIAL_PROPRIETAIRES, INITIAL_ACTIVITES, INITIAL_PAIEMENTS } from '@/lib/initialData';
import { INITIAL_RUBRIQUES_DEPENSES, INITIAL_DEPENSES } from '@/lib/defaultRubriques';

const STORAGE_KEYS = {
  SECTEURS: 'syndic_secteurs_v2',
  PROPRIETAIRES: 'syndic_proprietaires_v2',
  ACTIVITES: 'syndic_activites_v2',
  PAIEMENTS: 'syndic_paiements_v2',
  RUBRIQUES_DEPENSES: 'syndic_rubriques_depenses_v1',
  DEPENSES: 'syndic_depenses_v1',
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
      try {
        const { data, error } = await supabase
          .from('secteurs')
          .select('*')
          .order('nom', { ascending: true });
        if (!error && data && data.length > 0) {
          return data as Secteur[];
        }
      } catch (err) {
        console.warn('Supabase getSecteurs error, using local fallback:', err);
      }
    }
    return getLocalItem<Secteur[]>(STORAGE_KEYS.SECTEURS, INITIAL_SECTEURS);
  },

  async getProprietaires(): Promise<Proprietaire[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('proprietaires')
          .select('*')
          .order('lot', { ascending: true });
        if (!error && data && data.length > 0) {
          return data as Proprietaire[];
        }
      } catch (err) {
        console.warn('Supabase getProprietaires error, using local fallback:', err);
      }
    }
    return getLocalItem<Proprietaire[]>(STORAGE_KEYS.PROPRIETAIRES, INITIAL_PROPRIETAIRES);
  },

  async getActivites(): Promise<Activite[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('activites')
          .select('*')
          .order('nom', { ascending: true });
        if (!error && data && data.length > 0) {
          return data as Activite[];
        }
      } catch (err) {
        console.warn('Supabase getActivites error, using local fallback:', err);
      }
    }
    return getLocalItem<Activite[]>(STORAGE_KEYS.ACTIVITES, INITIAL_ACTIVITES);
  },

  async getPaiements(): Promise<Paiement[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('paiements')
          .select('*')
          .order('date', { ascending: false });
        if (!error && data && data.length > 0) {
          return data as Paiement[];
        }
      } catch (err) {
        console.warn('Supabase getPaiements error, using local fallback:', err);
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

  async updateProprietaire(id: string, propData: Partial<Proprietaire>): Promise<Proprietaire | null> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('proprietaires')
          .update(propData)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          const current = getLocalItem<Proprietaire[]>(STORAGE_KEYS.PROPRIETAIRES, INITIAL_PROPRIETAIRES);
          const updated = current.map(p => p.id === id ? { ...p, ...propData } : p);
          setLocalItem(STORAGE_KEYS.PROPRIETAIRES, updated);
          return data as Proprietaire;
        }
      } catch (err) {
        console.warn('Supabase updateProprietaire error:', err);
      }
    }

    const current = getLocalItem<Proprietaire[]>(STORAGE_KEYS.PROPRIETAIRES, INITIAL_PROPRIETAIRES);
    const updated = current.map(p => p.id === id ? { ...p, ...propData } : p);
    setLocalItem(STORAGE_KEYS.PROPRIETAIRES, updated);
    return updated.find(p => p.id === id) || null;
  },

  async deleteProprietaire(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('proprietaires').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteProprietaire error:', err);
      }
    }

    const currentProps = getLocalItem<Proprietaire[]>(STORAGE_KEYS.PROPRIETAIRES, INITIAL_PROPRIETAIRES);
    setLocalItem(STORAGE_KEYS.PROPRIETAIRES, currentProps.filter(p => p.id !== id));

    const currentPays = getLocalItem<Paiement[]>(STORAGE_KEYS.PAIEMENTS, INITIAL_PAIEMENTS);
    setLocalItem(STORAGE_KEYS.PAIEMENTS, currentPays.filter(p => p.proprietaire_id !== id));
    return true;
  },

  async updateSecteur(id: string, sectData: Partial<Secteur>): Promise<Secteur | null> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('secteurs')
          .update(sectData)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          const current = getLocalItem<Secteur[]>(STORAGE_KEYS.SECTEURS, INITIAL_SECTEURS);
          const updated = current.map(s => s.id === id ? { ...s, ...sectData } : s);
          setLocalItem(STORAGE_KEYS.SECTEURS, updated);
          return data as Secteur;
        }
      } catch (err) {
        console.warn('Supabase updateSecteur error:', err);
      }
    }

    const current = getLocalItem<Secteur[]>(STORAGE_KEYS.SECTEURS, INITIAL_SECTEURS);
    const updated = current.map(s => s.id === id ? { ...s, ...sectData } : s);
    setLocalItem(STORAGE_KEYS.SECTEURS, updated);
    return updated.find(s => s.id === id) || null;
  },

  async deleteSecteur(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('secteurs').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteSecteur error:', err);
      }
    }

    const currentSects = getLocalItem<Secteur[]>(STORAGE_KEYS.SECTEURS, INITIAL_SECTEURS);
    setLocalItem(STORAGE_KEYS.SECTEURS, currentSects.filter(s => s.id !== id));

    // Update proprietaires in this secteur to unassigned
    const currentProps = getLocalItem<Proprietaire[]>(STORAGE_KEYS.PROPRIETAIRES, INITIAL_PROPRIETAIRES);
    setLocalItem(
      STORAGE_KEYS.PROPRIETAIRES,
      currentProps.map(p => (p.secteur_id === id ? { ...p, secteur_id: '' } : p))
    );
    return true;
  },

  async updateActivite(id: string, actData: Partial<Activite>): Promise<Activite | null> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('activites')
          .update(actData)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          const current = getLocalItem<Activite[]>(STORAGE_KEYS.ACTIVITES, INITIAL_ACTIVITES);
          const updated = current.map(a => a.id === id ? { ...a, ...actData } : a);
          setLocalItem(STORAGE_KEYS.ACTIVITES, updated);
          return data as Activite;
        }
      } catch (err) {
        console.warn('Supabase updateActivite error:', err);
      }
    }

    const current = getLocalItem<Activite[]>(STORAGE_KEYS.ACTIVITES, INITIAL_ACTIVITES);
    const updated = current.map(a => a.id === id ? { ...a, ...actData } : a);
    setLocalItem(STORAGE_KEYS.ACTIVITES, updated);
    return updated.find(a => a.id === id) || null;
  },

  async deleteActivite(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('activites').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteActivite error:', err);
      }
    }

    const currentActs = getLocalItem<Activite[]>(STORAGE_KEYS.ACTIVITES, INITIAL_ACTIVITES);
    setLocalItem(STORAGE_KEYS.ACTIVITES, currentActs.filter(a => a.id !== id));
    return true;
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
      try {
        const { data, error } = await supabase
          .from('paiements')
          .insert([newPayment])
          .select()
          .single();
        if (!error && data) {
          const current = getLocalItem<Paiement[]>(STORAGE_KEYS.PAIEMENTS, INITIAL_PAIEMENTS);
          setLocalItem(STORAGE_KEYS.PAIEMENTS, [data as Paiement, ...current]);
          return data as Paiement;
        }
      } catch (err) {
        console.warn('Supabase createPaiement error:', err);
      }
    }

    const current = getLocalItem<Paiement[]>(STORAGE_KEYS.PAIEMENTS, INITIAL_PAIEMENTS);
    const updated = [newPayment, ...current];
    setLocalItem(STORAGE_KEYS.PAIEMENTS, updated);
    return newPayment;
  },

  async updatePaiement(id: string, paymentData: Partial<Paiement>): Promise<Paiement | null> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('paiements')
          .update(paymentData)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          const current = getLocalItem<Paiement[]>(STORAGE_KEYS.PAIEMENTS, INITIAL_PAIEMENTS);
          const updated = current.map(p => p.id === id ? { ...p, ...paymentData } : p);
          setLocalItem(STORAGE_KEYS.PAIEMENTS, updated);
          return data as Paiement;
        }
      } catch (err) {
        console.warn('Supabase updatePaiement error:', err);
      }
    }

    const current = getLocalItem<Paiement[]>(STORAGE_KEYS.PAIEMENTS, INITIAL_PAIEMENTS);
    const updated = current.map(p => p.id === id ? { ...p, ...paymentData } : p);
    setLocalItem(STORAGE_KEYS.PAIEMENTS, updated);
    return updated.find(p => p.id === id) || null;
  },

  async deletePaiement(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('paiements').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deletePaiement error:', err);
      }
    }

    const currentPays = getLocalItem<Paiement[]>(STORAGE_KEYS.PAIEMENTS, INITIAL_PAIEMENTS);
    setLocalItem(STORAGE_KEYS.PAIEMENTS, currentPays.filter(p => p.id !== id));
    return true;
  },

  async updatePaiementStatut(id: string, statut: PaiementStatut, validePar: string): Promise<Paiement | null> {
    return this.updatePaiement(id, { statut, valide_par: validePar });
  },

  // =========================================================================
  // RUBRIQUES DE DÉPENSES
  // =========================================================================

  async getRubriquesDepenses(): Promise<RubriqueDepense[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('rubriques_depenses')
          .select('*')
          .order('created_at', { ascending: true });
        if (!error && data) {
          if (data.length > 0) {
            setLocalItem(STORAGE_KEYS.RUBRIQUES_DEPENSES, data);
            return data as RubriqueDepense[];
          }
          // Table exists on Supabase but is empty: seed the 8 default rubriques
          const { data: seeded, error: seedErr } = await supabase
            .from('rubriques_depenses')
            .upsert(INITIAL_RUBRIQUES_DEPENSES)
            .select('*');
          if (!seedErr && seeded && seeded.length > 0) {
            setLocalItem(STORAGE_KEYS.RUBRIQUES_DEPENSES, seeded);
            return seeded as RubriqueDepense[];
          }
        }
      } catch (err) {
        console.warn('Supabase getRubriquesDepenses error, using local fallback:', err);
      }
    }
    return getLocalItem<RubriqueDepense[]>(STORAGE_KEYS.RUBRIQUES_DEPENSES, INITIAL_RUBRIQUES_DEPENSES);
  },

  async addRubriqueDepense(rub: Omit<RubriqueDepense, 'id'>): Promise<RubriqueDepense> {
    const supabase = getSupabase();
    const id = 'RUB_' + String(Date.now()).slice(-4);
    const newRub: RubriqueDepense = {
      ...rub,
      id,
      statut: rub.statut || 'actif',
      budget_mensuel: Number(rub.budget_mensuel) || 0,
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('rubriques_depenses')
          .insert([newRub])
          .select()
          .single();
        if (!error && data) {
          const current = getLocalItem<RubriqueDepense[]>(STORAGE_KEYS.RUBRIQUES_DEPENSES, INITIAL_RUBRIQUES_DEPENSES);
          setLocalItem(STORAGE_KEYS.RUBRIQUES_DEPENSES, [...current, data as RubriqueDepense]);
          return data as RubriqueDepense;
        }
      } catch (err) {
        console.warn('Supabase addRubriqueDepense error:', err);
      }
    }

    const current = getLocalItem<RubriqueDepense[]>(STORAGE_KEYS.RUBRIQUES_DEPENSES, INITIAL_RUBRIQUES_DEPENSES);
    const updated = [...current, newRub];
    setLocalItem(STORAGE_KEYS.RUBRIQUES_DEPENSES, updated);
    return newRub;
  },

  async updateRubriqueDepense(id: string, rubData: Partial<RubriqueDepense>): Promise<RubriqueDepense | null> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('rubriques_depenses')
          .update(rubData)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          const current = getLocalItem<RubriqueDepense[]>(STORAGE_KEYS.RUBRIQUES_DEPENSES, INITIAL_RUBRIQUES_DEPENSES);
          const updated = current.map((r) => (r.id === id ? { ...r, ...rubData } : r));
          setLocalItem(STORAGE_KEYS.RUBRIQUES_DEPENSES, updated);
          return data as RubriqueDepense;
        }
      } catch (err) {
        console.warn('Supabase updateRubriqueDepense error:', err);
      }
    }

    const current = getLocalItem<RubriqueDepense[]>(STORAGE_KEYS.RUBRIQUES_DEPENSES, INITIAL_RUBRIQUES_DEPENSES);
    const updated = current.map((r) => (r.id === id ? { ...r, ...rubData } : r));
    setLocalItem(STORAGE_KEYS.RUBRIQUES_DEPENSES, updated);
    return updated.find((r) => r.id === id) || null;
  },

  async deleteRubriqueDepense(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('rubriques_depenses').delete().eq('id', id);
        if (error) {
          throw new Error(error.message);
        }
      } catch (err) {
        console.warn('Supabase deleteRubriqueDepense error:', err);
      }
    }

    const current = getLocalItem<RubriqueDepense[]>(STORAGE_KEYS.RUBRIQUES_DEPENSES, INITIAL_RUBRIQUES_DEPENSES);
    setLocalItem(
      STORAGE_KEYS.RUBRIQUES_DEPENSES,
      current.filter((r) => r.id !== id)
    );
    return true;
  },

  // =========================================================================
  // DÉPENSES (SORTIES DE CAISSE)
  // =========================================================================

  async getDepenses(): Promise<Depense[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('depenses')
          .select('*')
          .order('date', { ascending: false });
        if (!error && data) {
          setLocalItem(STORAGE_KEYS.DEPENSES, data);
          return data as Depense[];
        }
      } catch (err) {
        console.warn('Supabase getDepenses error, using local fallback:', err);
      }
    }
    return getLocalItem<Depense[]>(STORAGE_KEYS.DEPENSES, INITIAL_DEPENSES);
  },

  async createDepense(
    depenseData: Omit<Depense, 'id' | 'statut' | 'enregistre_par' | 'valide_par'> & { statut?: DepenseStatut },
    role: UserRole,
    authorName: string
  ): Promise<Depense> {
    const supabase = getSupabase();
    const year = (depenseData.date || new Date().toISOString().split('T')[0]).slice(0, 4);
    const id = `DEP-${year}-${String(Date.now()).slice(-4)}`;

    // Règle stricte validée : Responsable => toujours 'en_attente' jusqu'à validation Admin
    const enforcedStatut: DepenseStatut =
      role === 'admin' ? depenseData.statut || 'valide' : 'en_attente';
    const validePar = enforcedStatut === 'valide' ? authorName : null;

    const newDepense: Depense = {
      rubrique_id: depenseData.rubrique_id,
      activite_id: depenseData.activite_id || null,
      secteur_id: depenseData.secteur_id || null,
      libelle: depenseData.libelle,
      montant: Number(depenseData.montant),
      date: depenseData.date || new Date().toISOString().split('T')[0],
      beneficiaire: depenseData.beneficiaire || '',
      mode_paiement: depenseData.mode_paiement || 'Espèces (Caisse)',
      reference_piece: depenseData.reference_piece || '',
      note: depenseData.note || '',
      id,
      statut: enforcedStatut,
      enregistre_par: authorName,
      valide_par: validePar,
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('depenses')
          .insert([newDepense])
          .select()
          .single();
        if (!error && data) {
          const current = getLocalItem<Depense[]>(STORAGE_KEYS.DEPENSES, INITIAL_DEPENSES);
          setLocalItem(STORAGE_KEYS.DEPENSES, [data as Depense, ...current]);
          return data as Depense;
        }
      } catch (err) {
        console.warn('Supabase createDepense error:', err);
      }
    }

    const current = getLocalItem<Depense[]>(STORAGE_KEYS.DEPENSES, INITIAL_DEPENSES);
    const updated = [newDepense, ...current];
    setLocalItem(STORAGE_KEYS.DEPENSES, updated);
    return newDepense;
  },

  async updateDepense(id: string, depData: Partial<Depense>): Promise<Depense | null> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('depenses')
          .update(depData)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          const current = getLocalItem<Depense[]>(STORAGE_KEYS.DEPENSES, INITIAL_DEPENSES);
          const updated = current.map((d) => (d.id === id ? { ...d, ...depData } : d));
          setLocalItem(STORAGE_KEYS.DEPENSES, updated);
          return data as Depense;
        }
      } catch (err) {
        console.warn('Supabase updateDepense error:', err);
      }
    }

    const current = getLocalItem<Depense[]>(STORAGE_KEYS.DEPENSES, INITIAL_DEPENSES);
    const updated = current.map((d) => (d.id === id ? { ...d, ...depData } : d));
    setLocalItem(STORAGE_KEYS.DEPENSES, updated);
    return updated.find((d) => d.id === id) || null;
  },

  async updateDepenseStatut(id: string, statut: DepenseStatut, validePar: string): Promise<Depense | null> {
    return this.updateDepense(id, { statut, valide_par: validePar });
  },

  async deleteDepense(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.from('depenses').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteDepense error:', err);
      }
    }

    const current = getLocalItem<Depense[]>(STORAGE_KEYS.DEPENSES, INITIAL_DEPENSES);
    setLocalItem(
      STORAGE_KEYS.DEPENSES,
      current.filter((d) => d.id !== id)
    );
    return true;
  },

  async seedSupabase(): Promise<{ success: boolean; message: string }> {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, message: 'Supabase n\'est pas encore configuré avec des clés valides.' };
    }

    try {
      // 1. Secteurs
      const { error: errSec } = await supabase.from('secteurs').upsert(INITIAL_SECTEURS);
      if (errSec) throw new Error(`Erreur secteurs: ${errSec.message}`);

      // 2. Activités
      const { error: errAct } = await supabase.from('activites').upsert(INITIAL_ACTIVITES);
      if (errAct) throw new Error(`Erreur activites: ${errAct.message}`);

      // 3. Propriétaires (par lots de 100)
      for (let i = 0; i < INITIAL_PROPRIETAIRES.length; i += 100) {
        const chunk = INITIAL_PROPRIETAIRES.slice(i, i + 100);
        const { error } = await supabase.from('proprietaires').upsert(chunk);
        if (error) throw new Error(`Erreur proprietaires (chunk ${i}): ${error.message}`);
      }

      // 4. Paiements (par lots de 200)
      for (let i = 0; i < INITIAL_PAIEMENTS.length; i += 200) {
        const chunk = INITIAL_PAIEMENTS.slice(i, i + 200);
        const { error } = await supabase.from('paiements').upsert(chunk);
        if (error) throw new Error(`Erreur paiements (chunk ${i}): ${error.message}`);
      }

      // 5. Rubriques de dépenses par défaut (si la table est migrée)
      try {
        await supabase.from('rubriques_depenses').upsert(INITIAL_RUBRIQUES_DEPENSES);
      } catch {
        // Ignore si la migration rubriques_depenses n'est pas encore appliquée côté Supabase
      }

      return { 
        success: true, 
        message: `Base Supabase initialisée avec succès : ${INITIAL_PROPRIETAIRES.length} copropriétaires et ${INITIAL_PAIEMENTS.length} paiements enregistrés !` 
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue lors de l\'initialisation';
      return { success: false, message };
    }
  },

  resetDemoData(): void {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    localStorage.removeItem('syndic_secteurs_v1');
    localStorage.removeItem('syndic_proprietaires_v1');
    localStorage.removeItem('syndic_activites_v1');
    localStorage.removeItem('syndic_paiements_v1');
  }
};

