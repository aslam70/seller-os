import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../auth/hooks/useAuth";
import toast from "react-hot-toast";

export function useProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });
      if (error) toast.error("Failed to load products");
      else setProducts(data || []);
      setLoading(false);
    };
    fetchProducts();
  }, [user]);

  const addProduct = async ({ name, price }) => {
    const { data, error } = await supabase
      .from("products")
      .insert({ name, price: Number(price) || 0, user_id: user.id })
      .select()
      .single();
    if (error) { toast.error("Failed to add product"); return; }
    setProducts((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    toast.success("Product added");
  };

  const deleteProduct = async (id) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error("Failed to delete product"); return; }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Product deleted");
  };

  return { products, loading, addProduct, deleteProduct };
}
