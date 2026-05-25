import { useState, useEffect } from "react";

/**
 * Simple customer risk hook.
 * Returns the risk level for a given phone number based on a local blacklist.
 * If the phone is in the blacklist, returns "high"; otherwise "trusted".
 * In a real app this would call Supabase or another backend service.
 */
export function useCustomerRisk(phone) {
  const [riskLevel, setRiskLevel] = useState("trusted");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!phone) {
      setRiskLevel("trusted");
      return;
    }
    setLoading(true);
    // Simulate async lookup (e.g., Supabase call). Here we just use localStorage.
    const fetchRisk = async () => {
      try {
        const userId = (await import("../features/auth/hooks/useAuth")).useAuth?.()?.user?.id;
        const saved = localStorage.getItem(`seller_os_blacklist_${userId}`);
        const blacklist = saved ? JSON.parse(saved) : [];
        setRiskLevel(blacklist.includes(phone) ? "high" : "trusted");
      } catch (e) {
        console.error("useCustomerRisk error", e);
        setRiskLevel("trusted");
      } finally {
        setLoading(false);
      }
    };
    fetchRisk();
  }, [phone]);

  return { riskLevel, loading };
}
