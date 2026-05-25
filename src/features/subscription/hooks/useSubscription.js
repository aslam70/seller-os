import { useState, useEffect } from "react";
import { useAuth } from "../../auth/hooks/useAuth";

const SUBSCRIPTION_PLANS = {
  free: {
    id: "free",
    name: "Free Plan",
    orderLimit: 15,
    price: 0,
    features: ["Manage up to 15 orders", "Basic metrics dashboard", "Manual order entry", "Single user dashboard"],
  },
  grower: {
    id: "grower",
    name: "Grower Plan",
    orderLimit: 250,
    price: 499,
    features: ["Manage up to 250 orders", "Interactive SVG trends & radial gauges", "CSV bulk importer & exporter", "WhatsApp transactional drafts box"],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise Plan",
    orderLimit: Infinity,
    price: 1499,
    features: ["Unlimited orders & products", "Unlimited customer records", "Complete analytics & custom alerts", "Priority 24/7 dedicated support"],
  },
};

export function useSubscription(currentOrdersCount = 0) {
  const { user } = useAuth();
  const [sub, setSub] = useState({ tier: "free" });

  useEffect(() => {
    if (!user) return;
    const key = `seller_os_sub_${user.id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setSub(JSON.parse(saved));
    } else {
      const initial = { tier: "free", activeSince: new Date().toISOString() };
      localStorage.setItem(key, JSON.stringify(initial));
      setSub(initial);
    }
  }, [user]);

  const upgradeTo = (tier) => {
    if (!user) return;
    const key = `seller_os_sub_${user.id}`;
    const updated = { ...sub, tier, updatedAt: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify(updated));
    setSub(updated);
  };

  const plan = SUBSCRIPTION_PLANS[sub.tier] || SUBSCRIPTION_PLANS.free;
  const reachedLimit = currentOrdersCount >= plan.orderLimit;

  return {
    tier: sub.tier,
    plan,
    reachedLimit,
    orderLimit: plan.orderLimit,
    orderCount: currentOrdersCount,
    upgradeTo,
    plans: SUBSCRIPTION_PLANS,
  };
}
