import { useState } from "react";
import { Plus, Trash2, Box } from "lucide-react";
import { useProducts } from "./hooks/useProducts";
import ProductModal from "./components/ProductModal";
import EmptyState from "../../components/EmptyState";

export default function ProductsPage() {
  const { products, loading, addProduct, deleteProduct } = useProducts();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Products</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm gap-1">
          <Plus size={14} /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-md"></span>
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Box}
          title="No products yet"
          description="Add products first — you'll need them when creating orders."
          action={
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
            >
              <Plus size={14} /> Add product
            </button>
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {products.map((p) => (
            <div key={p.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">{p.name}</p>
                {p.price > 0 && <p className="text-xs text-gray-400">৳{p.price}</p>}
              </div>
              <button onClick={() => deleteProduct(p.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && <ProductModal onAdd={addProduct} onClose={() => setShowModal(false)} />}
    </div>
  );
}
