import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { supabase } from "../../../lib/supabase";
import toast from "react-hot-toast";

const SUBSCRIPTION_PLANS = {
  free: {
    id: "free",
    name: "Free Plan",
    orderLimit: 15,
    price: 0,
    features: [
      "Manage up to 15 orders",
      "Basic metrics dashboard",
      "Manual order entry",
      "Single user dashboard",
    ],
  },
  grower: {
    id: "grower",
    name: "Grower Plan",
    orderLimit: 250,
    price: 499,
    features: [
      "Manage up to 250 orders",
      "Interactive SVG trends & radial gauges",
      "CSV bulk importer & exporter",
      "WhatsApp transactional drafts box",
    ],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise Plan",
    orderLimit: Infinity,
    price: 1499,
    features: [
      "Unlimited orders & products",
      "Unlimited customer records",
      "Complete analytics & custom alerts",
      "Priority 24/7 dedicated support",
    ],
  },
};

export function useSubscription(currentOrdersCount = 0) {
  const { user } = useAuth();
  const [tier, setTier] = useState("free");
  const [loading, setLoading] = useState(true);

  // Fetch tier from Supabase profiles table
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("tier")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        // If profile doesn't exist yet (new user before trigger fires), default to free
        if (error.code === "PGRST116") {
          setTier("free");
        } else {
          console.error("Failed to load subscription profile:", error.message);
        }
      } else {
        setTier(data?.tier || "free");
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  // upgradeTo writes to Supabase — cannot be faked from the browser console
  // without a valid authenticated session and RLS passing
  const upgradeTo = useCallback(async (newTier) => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, tier: newTier, updated_at: new Date().toISOString() });

    if (error) {
      toast.error("Failed to update subscription. Please try again.");
      console.error(error);
      return;
    }

    setTier(newTier);
  }, [user]);

  const plan = SUBSCRIPTION_PLANS[tier] || SUBSCRIPTION_PLANS.free;
  const reachedLimit = currentOrdersCount >= plan.orderLimit;

  return {
    tier,
    plan,
    loading,
    reachedLimit,
    orderLimit: plan.orderLimit,
    orderCount: currentOrdersCount,
    upgradeTo,
    plans: SUBSCRIPTION_PLANS,
  };
}
