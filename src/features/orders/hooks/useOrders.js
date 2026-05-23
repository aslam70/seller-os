import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import toast from "react-hot-toast";
import { ORDER_STATUS } from "../../../lib/constants";

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
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
  }, []);

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
      toast.error("Order deleted");
    } catch (err) {
      toast.error("Failed to delete order");
      console.error(err);
    }
  };

  return { orders, loading, error, addOrder, updateStatus, deleteOrder };
}
