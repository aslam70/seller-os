import { useState, useEffect, useRef } from "react";
import { PAYMENT_METHODS } from "../../../lib/constants";
import { useProducts } from "../../products/hooks/useProducts";

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

export default function AddOrderModal({ show, onClose, onAdd, customers = [] }) {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const inputRef = useRef(null);
  const { products } = useProducts();

  useEffect(() => {
    if (show) setForm({ ...EMPTY_FORM });
  }, [show]);

  const handleProductSelect = (e) => {
    const selected = products.find((p) => p.id === e.target.value);
    setForm({
      ...form,
      product: selected ? selected.name : "",
      amount: selected?.price > 0 ? String(selected.price) : form.amount,
    });
  };

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
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Modal / Bottom sheet */}
      <div className="fixed inset-x-0 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 flex flex-col max-h-[90dvh] sm:max-h-[80vh] sm:max-w-md sm:w-full">
        <div className="mt-auto sm:mt-0 bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90dvh] sm:max-h-[80vh]">
          {/* Header */}
          <div className="shrink-0 px-5 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">New Order</h2>
                <p className="text-xs text-gray-400 mt-0.5">Fill in the order details below</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Drag handle for mobile */}
            <div className="sm:hidden flex justify-center mt-2">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
          </div>

          {/* Scrollable form */}
          <div className="overflow-y-auto px-5 sm:px-6 py-4 space-y-4 pb-[env(safe-area-inset-bottom)] sm:pb-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Customer autocomplete */}
              <div className="col-span-2 relative">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Customer Name</label>
                <input
                  ref={inputRef}
                  type="text"
                  value={form.customer}
                  onChange={(e) => {
                    setForm({ ...form, customer: e.target.value });
                    setShowSuggestions(true);
                    setHighlightIdx(-1);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onKeyDown={(e) => {
                    const filtered = customers.filter((c) =>
                      c.name.toLowerCase().includes(form.customer.toLowerCase()),
                    );
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setHighlightIdx((prev) =>
                        prev < filtered.length - 1 ? prev + 1 : prev,
                      );
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setHighlightIdx((prev) => (prev > 0 ? prev - 1 : -1));
                    } else if (e.key === "Enter" && highlightIdx >= 0) {
                      e.preventDefault();
                      const selected = filtered[highlightIdx];
                      setForm({
                        ...form,
                        customer: selected.name,
                        phone: selected.phone || form.phone,
                      });
                      setShowSuggestions(false);
                    }
                  }}
                  placeholder="Search or type a name..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                {showSuggestions && form.customer.length > 0 && (
                  <div className="absolute z-10 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {customers
                      .filter((c) =>
                        c.name.toLowerCase().includes(form.customer.toLowerCase()),
                      )
                      .slice(0, 8)
                      .map((c, i) => (
                        <button
                          key={c.id}
                          type="button"
                          onMouseDown={() => {
                            setForm({
                              ...form,
                              customer: c.name,
                              phone: c.phone || form.phone,
                            });
                            setShowSuggestions(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 text-sm transition ${
                            i === highlightIdx
                              ? "bg-emerald-50 text-emerald-700"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <span className="font-medium">{c.name}</span>
                          {c.phone && (
                            <span className="text-gray-400 ml-2">{c.phone}</span>
                          )}
                        </button>
                      ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Phone</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              {/* Product dropdown */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Product</label>
                {products.length > 0 ? (
                  <select
                    onChange={handleProductSelect}
                    defaultValue=""
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="" disabled>Select a product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}{p.price > 0 ? ` — ৳${p.price}` : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="No products yet — type manually"
                    value={form.product}
                    onChange={(e) => setForm({ ...form, product: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                )}
              </div>

              {[
                { label: "Amount (৳)", key: "amount" },
                { label: "Delivery Charge", key: "deliveryCharge" },
                { label: "Address", key: "address", span: true },
              ].map(({ label, key, span }) => (
                <div key={key} className={span ? "col-span-2" : ""}>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Courier</label>
                <select
                  value={form.courier}
                  onChange={(e) => setForm({ ...form, courier: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  {COURIERS.map((c) => (<option key={c}>{c}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Payment Type</label>
                <select
                  value={form.payment}
                  onChange={(e) => setForm({ ...form, payment: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  {PAYMENT_METHODS.map((p) => (<option key={p}>{p}</option>))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 px-5 sm:px-6 py-4 border-t border-gray-100 flex gap-3 pb-[env(safe-area-inset-bottom)] sm:pb-4">
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
    </>
  );
}
