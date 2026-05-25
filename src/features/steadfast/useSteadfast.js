import { useCallback } from 'react';
import { supabase } from '../../lib/supabase';

/**
 * Hook that provides Steadfast API utilities via a Supabase Edge Function.
 * The API key and secret are stored as Supabase secrets and never exposed to the client.
 */
export function useSteadfast() {
  const createConsignment = useCallback(async (payload) => {
    try {
      const { data, error } = await supabase.functions.invoke('steadfast-consignment', {
        body: payload,
      });
      if (error) return { error: true, message: error.message };
      return data;
    } catch (e) {
      return { error: true, message: e.message ?? 'Network error' };
    }
  }, []);

  return { createConsignment };
}
