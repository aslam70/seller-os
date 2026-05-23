import { useState } from "react";
import { X } from "lucide-react";

export default function ProductModal({ onAdd, onClose }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onAdd({ name: name.trim(), price });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Add Product</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Product name"
            className="input input-bordered w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Default price (optional)"
            className="input input-bordered w-full"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <button type="submit" className="btn btn-primary w-full">Add Product</button>
        </form>
      </div>
    </div>
  );
}
