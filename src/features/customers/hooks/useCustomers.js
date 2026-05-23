import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../auth/hooks/useAuth";
import toast from "react-hot-toast";

function mapRow(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone || "",
    address: row.address || "",
    notes: row.notes || "",
    createdAt: row.created_at,
  };
}

export const RISK_CONFIG = {
  high: { label: "High Risk", class: "bg-red-50 text-red-600 border-red-200" },
  medium: {
    label: "Medium Risk",
    class: "bg-amber-50 text-amber-600 border-amber-200",
  },
  low: {
    label: "Trusted",
    class: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
};

export function riskLevel(orders) {
  const returns = orders.filter((o) => o.status === "returned").length;
  const ratio = returns / orders.length;
  if (ratio >= 0.5) return "high";
  if (ratio > 0) return "medium";
  return "low";
}

export function customerSpent(orders) {
  return orders
    .filter((o) => o.status === "delivered")
    .reduce((s, o) => s + o.amount, 0);
}

export function useCustomers() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchCustomers = async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("name", { ascending: true });
      if (error) toast.error("Failed to load customers");
      else setCustomers((data || []).map(mapRow));
      setLoading(false);
    };
    fetchCustomers();
  }, [user]);

  // Find existing or create new customer, returns customer id
  const findOrCreate = async ({ name, phone, address }) => {
    // Check if customer with same name+phone already exists
    const existing = customers.find(
      (c) =>
        c.name.toLowerCase().trim() === name.toLowerCase().trim() &&
        c.phone === phone,
    );
    if (existing) return existing.id;

    // Create new
    const { data, error } = await supabase
      .from("customers")
      .insert({ name: name.trim(), phone, address, user_id: user.id })
      .select()
      .single();

    if (error) {
      console.error("Failed to create customer:", error);
      return null;
    }

    const newCustomer = mapRow(data);
    setCustomers((prev) =>
      [...prev, newCustomer].sort((a, b) => a.name.localeCompare(b.name)),
    );
    return newCustomer.id;
  };

  const updateCustomer = async (id, updates) => {
    const { error } = await supabase
      .from("customers")
      .update(updates)
      .eq("id", id);
    if (error) {
      toast.error("Failed to update customer");
      return;
    }
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    );
    toast.success("Customer updated");
  };

  const deleteCustomer = async (id) => {
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete customer");
      return;
    }
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    toast.success("Customer deleted");
  };

  return { customers, loading, findOrCreate, updateCustomer, deleteCustomer };
}
