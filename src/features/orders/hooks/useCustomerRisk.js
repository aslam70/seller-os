import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";

/**
 * useCustomerRisk – calculates risk metrics for a given phone number.
 * Returns loading state, computed metrics, and a human‑readable risk level.
 *
 * @param {string|null|undefined} phone – phone number from the order.
 * @returns {{ loading: boolean, totalOrders: number, delivered: number, returned: number, returnRate: number, riskLevel: string }}
 */
export function useCustomerRisk(phone) {
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
        const { data, error } = await supabase
          .from("orders")
          .select("status")
          .eq("phone", phone);

        if (error) {
          console.error("Failed to fetch orders for risk scoring", error);
          setLoading(false);
          return;
        }

        const total = data?.length ?? 0;
        const deliveredCnt = data?.filter((o) => o.status === "delivered").length ?? 0;
        const returnedCnt = data?.filter((o) => o.status === "returned").length ?? 0;
        const rate = total > 0 ? (returnedCnt / total) * 100 : 0;

        setTotalOrders(total);
        setDelivered(deliveredCnt);
        setReturned(returnedCnt);
        setReturnRate(rate);

        // Determine risk level
        let level = "";
        if (total === 1) {
          level = "New Customer";
        } else if (rate >= 40) {
          level = "High Risk";
        } else if (rate >= 20) {
          level = "Medium Risk";
        } else {
          level = "Trusted";
        }
        setRiskLevel(level);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [phone]);

  return { loading, totalOrders, delivered, returned, returnRate, riskLevel };
}
