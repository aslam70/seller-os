import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import toast from "react-hot-toast";
import { ORDER_STATUS } from "../../../lib/constants";
import { useAuth } from "../../auth/hooks/useAuth";

function mapRow(row) {
  return {
    id: row.id,
    displayId: row.display_id,
    customer: row.customer,
    phone: row.phone,
    address: row.address,
    product: row.product,
    amount: row.amount,
    deliveryCharge: row.delivery_charge,
    payment: row.payment,
    status: row.status,
    courier: row.courier,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function useOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setOrders((data || []).map(mapRow));
      } catch (err) {
        setError(err.message);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const addOrder = async (formData) => {
    try {
      const newOrder = {
        customer: formData.customer,
        phone: formData.phone,
        address: formData.address,
        product: formData.product,
        amount: Number(formData.amount),
        delivery_charge: Number(formData.deliveryCharge) || 60,
        payment: formData.payment,
        status: ORDER_STATUS.PENDING,
        courier: formData.courier || "Pathao",
        notes: formData.notes || "",
        user_id: user.id,
        // Generate a short random display ID for UI purposes
        display_id: Math.random().toString(36).substring(2, 8).toUpperCase(),
      };

      const { data, error } = await supabase
        .from("orders")
        .insert(newOrder)
        .select()
        .single();

      if (error) throw error;

      setOrders((prev) => [mapRow(data), ...prev]);
      toast.success("Order added");
    } catch (err) {
      toast.error("Failed to add order");
      console.error(err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o)),
      );
      toast.success(`Status updated to ${status}`);
    } catch (err) {
      toast.error("Failed to update status");
      console.error(err);
    }
  };

  const deleteOrder = async (id) => {
    try {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setOrders((prev) => prev.filter((o) => o.id !== id));
      toast.success("Order deleted");
    } catch (err) {
      toast.error("Failed to delete order");
      console.error(err);
    }
  };

  const bulkAddOrders = async (rows) => {
    try {
      const dbRows = rows.map((row) => ({
        customer: row.customer,
        phone: row.phone || "",
        address: row.address || "",
        product: row.product,
        amount: Number(row.amount) || 0,
        delivery_charge: Number(row.deliveryCharge) || 60,
        payment: row.payment || "COD",
        status: row.status || ORDER_STATUS.PENDING,
        courier: row.courier || "Pathao",
        notes: row.notes || "",
        user_id: user.id,
      }));

      const { data, error } = await supabase
        .from("orders")
        .insert(dbRows)
        .select();

      if (error) throw error;

      setOrders((prev) => [...(data || []).map(mapRow), ...prev]);
      toast.success(`${data.length} orders imported!`);
      return true;
    } catch (err) {
      toast.error("Failed to import orders");
      console.error(err);
      return false;
    }
  };

  return { orders, loading, error, addOrder, bulkAddOrders, updateStatus, deleteOrder };
}
