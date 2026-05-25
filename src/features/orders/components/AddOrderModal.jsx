import { useState, useEffect, useRef } from "react";
import { PAYMENT_METHODS } from "../../../lib/constants";
import { useProducts } from "../../products/hooks/useProducts";
import { useAuth } from "../../auth/hooks/useAuth";
import { useCustomerRisk } from "../../hooks/useCustomerRisk";
import { MapPin, Search, Shield } from "lucide-react";

const COURIERS = ["Pathao", "Steadfast", "Redx", "Others"];

const EMPTY_FORM = {
  customer: "",
  phone: "",
  address: "",
  product: "",
  amount: "",
  payment: "COD",
  deliveryCharge: "60",
  courier: "Pathao",
  notes: "",
};

export default function AddOrderModal({ show, onClose, onAdd, customers = [] }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [locationTab, setLocationTab] = useState("inside"); // 'inside' or 'outside'
  const inputRef = useRef(null);
  const { riskLevel: phoneRiskLevel, loading: riskLoading } = useCustomerRisk(form.phone);
  const { products } = useProducts();

  // Load custom shop settings defaults
  const getDeliveryFees = () => {
    let insideFee = "60";
    let outsideFee = "120";
    if (user) {
      const saved = localStorage.getItem(`seller_os_settings_${user.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        insideFee = parsed.insideDhakaFee || "60";
        outsideFee = parsed.outsideDhakaFee || "120";
      }
    }
    return { insideFee, outsideFee };
  };

  useEffect(() => {
    if (show) {
      const { insideFee } = getDeliveryFees();
      setForm({
        ...EMPTY_FORM,
        deliveryCharge: insideFee,
        courier: "Pathao",
      });
      setLocationTab("inside");
    }
  }, [show, user]);

  // Adjust courier & delivery charge on location tab toggle
  const handleLocationToggle = (loc) => {
    setLocationTab(loc);
    const { insideFee, outsideFee } = getDeliveryFees();
    setForm((prev) => ({
      ...prev,
      deliveryCharge: loc === "inside" ? insideFee : outsideFee,
      courier: loc === "inside" ? "Pathao" : "Steadfast",
    }));
  };

  const handleProductSelect = (e) => {
    const selected = products.find((p) => p.id === e.target.value);
    setForm({
      ...form,
      product: selected ? selected.name : "",
      amount: selected?.price > 0 ? String(selected.price) : form.amount,
    });
  };

  const selectCustomer = (c) => {
    setForm((prev) => ({
      ...prev,
      customer: c.name,
      phone: c.phone || prev.phone,
      address: c.address || prev.address,
    }));
    setShowSuggestions(false);
  };

  function handleSubmit() {
    if (!form.customer || !form.product) return;
    onAdd({
      ...form,
      amount: Number(form.amount) || 0,
      deliveryCharge: Number(form.deliveryCharge) || 0,
    });
  }

  if (!show) return null;

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(form.customer.toLowerCase())
  );

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-xs animate-fade-in" onClick={onClose} />

      {/* Modal panel */}
      <div className="fixed inset-x-0 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 flex flex-col max-h-[90vh] sm:max-w-md sm:w-full">
        <div className="mt-auto sm:mt-0 bg-white rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="shrink-0 px-5 pt-5 pb-3 sm:px-6 sm:pt-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">New Order</h2>
                <p className="text-xs text-gray-400 mt-0.5">Register a manual sale transaction</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
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
          <div className="overflow-y-auto px-5 sm:px-6 py-4 space-y-4 pb-6 custom-scrollbar">
            {/* Location delivery fee defaults toggle */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1">
                <MapPin size={12} className="text-emerald-600" /> Delivery Zone
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleLocationToggle("inside")}
                  className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    locationTab === "inside"
                      ? "bg-white text-emerald-700 shadow-xs"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Inside Dhaka (৳60)
                </button>
                <button
                  type="button"
                  onClick={() => handleLocationToggle("outside")}
                  className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    locationTab === "outside"
                      ? "bg-white text-emerald-700 shadow-xs"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Outside Dhaka (৳120)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Customer autocomplete */}
              <div className="col-span-2 relative">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Customer Name</label>
                <div className="relative">
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
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setHighlightIdx((prev) =>
                          prev < filteredCustomers.length - 1 ? prev + 1 : prev
                        );
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setHighlightIdx((prev) => (prev > 0 ? prev - 1 : -1));
                      } else if (e.key === "Enter" && highlightIdx >= 0) {
                        e.preventDefault();
                        selectCustomer(filteredCustomers[highlightIdx]);
                      }
                    }}
                    placeholder="Search or type a name..."
                    className="w-full border border-gray-200 rounded-xl pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                {showSuggestions && form.customer.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto custom-scrollbar">
                    {filteredCustomers.slice(0, 8).map((c, i) => (
                      <button
                        key={c.id}
                        type="button"
                        onMouseDown={() => selectCustomer(c)}
                        className={`w-full text-left px-3 py-2 text-xs transition ${
                          i === highlightIdx
                            ? "bg-emerald-50 text-emerald-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div className="font-semibold">{c.name}</div>
                        {(c.phone || c.address) && (
                          <div className="text-[10px] text-gray-400 truncate">
                            {c.phone} {c.address ? `· ${c.address}` : ""}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Phone */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Phone Number</label>
                <input
                  type="text"
                  placeholder="01xxxxxxxxx"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              {phoneRiskLevel === 'high' && (
                <div className="col-span-2 flex items-center gap-2 bg-red-100 text-red-800 p-2 rounded-md">
                  <Shield className="w-4 h-4" />
                  <span>High risk phone number detected. Please verify before proceeding.</span>
                </div>
              )}
              {/* Amount */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Price / Amount (৳)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 font-bold"
                />
              </div>

              {/* Product selector dropdown */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Product catalog</label>
                {products.length > 0 ? (
                  <select
                    onChange={handleProductSelect}
                    value={products.find(p => p.name === form.product)?.id || ""}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="">Choose item...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}{p.price > 0 ? ` — ৳${p.price}` : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Type manually..."
                    value={form.product}
                    onChange={(e) => setForm({ ...form, product: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                )}
                {/* Fallback typing box for customized sales in catalog mode */}
                {products.length > 0 && (
                  <input
                    type="text"
                    placeholder="Or type custom product manually..."
                    value={form.product}
                    onChange={(e) => setForm({ ...form, product: e.target.value })}
                    className="w-full mt-1.5 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                )}
              </div>

              {/* Address */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Delivery Address</label>
                <input
                  type="text"
                  placeholder="Street name, area, district"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              {/* Delivery charge */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Delivery Charge (৳)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.deliveryCharge}
                  onChange={(e) => setForm({ ...form, deliveryCharge: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 font-semibold text-emerald-700"
                />
              </div>

              {/* Courier */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Courier service</label>
                <select
                  value={form.courier}
                  onChange={(e) => setForm({ ...form, courier: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  {COURIERS.map((c) => (<option key={c}>{c}</option>))}
                </select>
              </div>

              {/* Payment Type */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Payment Method</label>
                <select
                  value={form.payment}
                  onChange={(e) => setForm({ ...form, payment: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  {PAYMENT_METHODS.map((p) => (<option key={p}>{p}</option>))}
                </select>
              </div>

              {/* Notes */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Notes / Special Instructions</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  placeholder="Customer preference, delivery timings..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 px-5 sm:px-6 py-4 border-t border-gray-100 flex gap-3 bg-gray-50/50">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-200 rounded-xl py-2.5 text-xs text-gray-600 hover:bg-white hover:text-gray-800 transition font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.customer || !form.product}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-xl py-2.5 text-xs font-bold shadow-xs transition cursor-pointer"
            >
              Confirm Sale
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
