import { useState, useMemo } from "react";
import { ArrowLeft, User, Users } from "lucide-react";
import CustomerPanel from "./components/CustomerPanel";
import { useOrders } from "../orders/hooks/useOrders";
import EmptyState from "../../components/EmptyState";

const RISK_CONFIG = {
  high: { label: "High Risk", class: "bg-red-50 text-red-600 border-red-200" },
  medium: {
    label: "Medium Risk",
    class: "bg-amber-50 text-amber-600 border-amber-200",
  },
  low: {
    label: "Trusted",
    class: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
};

function riskLevel(orders) {
  const returns = orders.filter((o) => o.status === "returned").length;
  const ratio = returns / orders.length;
  if (ratio >= 0.5) return "high";
  if (ratio > 0) return "medium";
  return "low";
}

export default function CustomersPage() {
  const { orders } = useOrders();
  const [selected, setSelected] = useState(null);

  const customers = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      if (!map[o.customer]) {
        map[o.customer] = { name: o.customer, phone: o.phone, orders: [] };
      }
      map[o.customer].orders.push(o);
    });
    return Object.values(map).sort((a, b) => b.orders.length - a.orders.length);
  }, [orders]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Customers</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {customers.length} unique customers
        </p>
      </div>

      <div className="flex gap-5">
        {/* Customer list — hidden on mobile when a customer is selected */}
        <div className={`w-72 shrink-0 space-y-2 ${selected ? "hidden lg:block" : ""}`}>
          {customers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No customers yet"
              description="Customers appear automatically once you add orders."
            />
          ) : customers.map((c) => {
            const risk = riskLevel(c.orders);
            const spent = c.orders
              .filter((o) => o.status === "delivered")
              .reduce((s, o) => s + o.amount, 0);
            const isActive = selected?.name === c.name;

            return (
              <button
                key={c.name}
                onClick={() => setSelected(c)}
                className={`w-full text-left px-4 py-3.5 rounded-2xl border transition
                  ${
                    isActive
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-white border-gray-100 hover:border-gray-200"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0
                    ${isActive ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600"}`}
                  >
                    {c.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {c.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {c.orders.length} orders · ৳{spent}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-lg border font-medium ${RISK_CONFIG[risk].class}`}
                  >
                    {RISK_CONFIG[risk].label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Mobile: full-screen panel with back button */}
        <div className={`flex-1 ${selected ? "" : "hidden lg:block"}`}>
          {selected ? (
            <div className="lg:block">
              {/* Mobile back button */}
              <button
                onClick={() => setSelected(null)}
                className="lg:hidden flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4 transition"
              >
                <ArrowLeft size={16} />
                Back to customers
              </button>
              <CustomerPanel customer={selected} />
            </div>
          ) : (
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <User size={20} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-400">
                  Select a customer to view details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
