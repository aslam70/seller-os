import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useProducts } from "./hooks/useProducts";
import ProductModal from "./components/ProductModal";

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
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">No products yet.</p>
          <p className="text-xs mt-1">Add products to use them in orders.</p>
        </div>
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
