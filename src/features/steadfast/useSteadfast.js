import { useCallback } from 'react';

const BASE_URL = 'https://portal.packzy.com/api/v1';

/**
 * Hook that provides Steadfast API utilities.
 * Uses the Vite env variables VITE_STEADFAST_API_KEY and VITE_STEADFAST_SECRET_KEY.
 */
export function useSteadfast() {
  const apiKey = import.meta.env.VITE_STEADFAST_API_KEY;
  const secretKey = import.meta.env.VITE_STEADFAST_SECRET_KEY;

  const headers = {
    'Api-Key': apiKey,
    'Secret-Key': secretKey,
    'Content-Type': 'application/json',
  };

  const createConsignment = useCallback(async (payload) => {
    try {
      const response = await fetch(`${BASE_URL}/create_order`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        return { error: true, message: data.message || 'Failed to create consignment' };
      }
      return data; // API returns { status, message, consignment }
    } catch (e) {
      return { error: true, message: e.message ?? 'Network error' };
    }
  }, []);

  // Additional helpers (status, balance, etc.) could be added here.
  return { createConsignment };
}
