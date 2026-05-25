import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../auth/hooks/useAuth";

  // Get current user for blacklist key
  

/**
 * useCustomerRisk – calculates risk metrics for a given phone number.
 * Excludes the current order (by id) from the aggregation.
 * Returns loading state, computed metrics, and a human‑readable risk level.
 *
 * @param {string|null|undefined} phone – phone number associated with the order.
 * @param {string|undefined} currentId – optional ID of the current order to exclude from calculations.
 * @returns {{ loading: boolean, totalOrders: number, delivered: number, returned: number, returnRate: number, riskLevel: string }}
 */
export function useCustomerRisk(phone, currentId) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [totalOrders, setTotalOrders] = useState(0);
  const [delivered, setDelivered] = useState(0);
  const [returned, setReturned] = useState(0);
  const [returnRate, setReturnRate] = useState(0);
  const [riskLevel, setRiskLevel] = useState("");

  useEffect(() => {
    if (!phone) {
      // No phone, nothing to compute.
      setRiskLevel("");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Check blacklist
        const saved = localStorage.getItem(`seller_os_blacklist_${user?.id}`);
        const blacklist = saved ? JSON.parse(saved) : [];
        if (blacklist.includes(phone)) {
          setRiskLevel('high');
          setReturnRate(0);
          setLoading(false);
          return;
        }
        // Build base query for orders matching the phone number.
        let query = supabase.from("orders").select("status").eq("phone", phone);
        // Exclude the currently viewed order, if provided.
        if (currentId) {
          query = query.neq("id", currentId);
        }
        const { data, error } = await query;

        if (error) {
          console.error("Failed to fetch orders for risk scoring", error);
          setLoading(false);
          return;
        }

        const total = data?.length ?? 0;
        const deliveredCnt = data?.filter((o) => o.status === "delivered").length ?? 0;
        const returnedCnt = data?.filter((o) => o.status === "returned").length ?? 0;
        // Only consider completed orders (delivered or returned) for the denominator.
        const denominator = deliveredCnt + returnedCnt;
        const rate = denominator > 0 ? (returnedCnt / denominator) * 100 : 0;

        setTotalOrders(total);
        setDelivered(deliveredCnt);
        setReturned(returnedCnt);
        setReturnRate(rate);

        // Determine risk level key based on constants.
        let levelKey = "";
        if (total === 0) {
          levelKey = "new_customer"; // No previous orders.
        } else if (rate >= 40) {
          levelKey = "high";
        } else if (rate >= 20) {
          levelKey = "medium";
        } else {
          levelKey = "trusted";
        }
        setRiskLevel(levelKey);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [phone, currentId]);

  return { loading, totalOrders, delivered, returned, returnRate, riskLevel, blacklistChecked: true };
}
