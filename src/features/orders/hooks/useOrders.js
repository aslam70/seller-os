import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { orders as initialOrders } from "../../../data/orders";
import { storage } from "../../../lib/storage";
import { ORDER_STATUS } from "../../../lib/constants";

export function useOrders() {
  const [orders, setOrders] = useState(() => {
    try {
      const saved = storage.get();
      return saved.length ? saved : initialOrders;
    } catch {
      return initialOrders;
    }
  });

  useEffect(() => {
    storage.set(orders);
  }, [orders]);

  const addOrder = (formData) => {
    const newOrder = {
      id: `ORD-${String(orders.length + 1).padStart(3, "0")}`,
      customer: formData.customer,
      phone: formData.phone,
      address: formData.address,
      product: formData.product,
      amount: Number(formData.amount),
      deliveryCharge: Number(formData.deliveryCharge) || 60,
      payment: formData.payment,
      status: ORDER_STATUS.PENDING,
      courier: formData.courier || "Pathao",
      notes: formData.notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setOrders((prev) => [newOrder, ...prev]);
    toast.success("Order added successfully");
  };

  const updateStatus = (id, status) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o,
      ),
    );
    toast.success(`Status updated to ${status}`);
  };

  const deleteOrder = (id) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    toast.error("Order deleted");
  };

  return { orders, addOrder, updateStatus, deleteOrder };
}
