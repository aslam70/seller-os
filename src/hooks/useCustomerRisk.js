import { useState, useEffect } from "react";
import { useAuth } from "../features/auth/hooks/useAuth";

export function useCustomerRisk(phone) {
  const { user } = useAuth();
  const [riskLevel, setRiskLevel] = useState("trusted");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!phone) {
      setRiskLevel("trusted");
      return;
    }
    setLoading(true);
    try {
      const saved = localStorage.getItem(`seller_os_blacklist_${user?.id}`);
      const blacklist = saved ? JSON.parse(saved) : [];
      setRiskLevel(blacklist.includes(phone) ? "high" : "trusted");
    } catch {
      setRiskLevel("trusted");
    } finally {
      setLoading(false);
    }
  }, [phone, user?.id]);

  return { riskLevel, loading };
}
