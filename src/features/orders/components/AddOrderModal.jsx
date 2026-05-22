import { useState, useEffect } from "react";
import { PAYMENT_METHODS } from "../../../lib/constants";

const COURIERS = ["Pathao", "Steadfast", "Redx", "Others"];

const EMPTY_FORM = {
  customer: "",
  phone: "",
  address: "",
  product: "",
  amount: "",
  payment: "COD",
  deliveryCharge: "",
  courier: "Pathao",
  notes: "",
};

export default function AddOrderModal({ show, onClose, onAdd }) {
  const [form, setForm] = useState({ ...EMPTY_FORM });

  useEffect(() => {
    if (show) setForm({ ...EMPTY_FORM });
  }, [show]);

  function handleSubmit() {
    if (!form.customer || !form.product) return;
    onAdd({
      ...form,
      amount: Number(form.amount),
      deliveryCharge: Number(form.deliveryCharge) || 0,
    });
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">New Order</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Fill in the order details below
          </p>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Customer Name", key: "customer", span: true },
              { label: "Phone", key: "phone" },
              { label: "Product", key: "product" },
              { label: "Amount (৳)", key: "amount", type: "number" },
              { label: "Delivery Charge", key: "deliveryCharge", type: "number" },
              { label: "Address", key: "address", span: true },
            ].map(({ label, key, type = "text", span }) => (
              <div key={key} className={span ? "col-span-2" : ""}>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) =>
                    setForm({ ...form, [key]: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Courier
              </label>
              <select
                value={form.courier}
                onChange={(e) =>
                  setForm({ ...form, courier: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                {COURIERS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Payment Type
              </label>
              <select
                value={form.payment}
                onChange={(e) =>
                  setForm({ ...form, payment: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                {PAYMENT_METHODS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm({ ...form, notes: e.target.value })
                }
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 text-sm font-medium transition"
          >
            Add Order
          </button>
        </div>
      </div>
    </div>
  );
}
