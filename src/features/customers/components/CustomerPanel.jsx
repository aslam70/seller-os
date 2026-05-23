import { ShoppingBag, TrendingUp, AlertTriangle } from "lucide-react";
import { STATUS_COLORS } from "../../orders/ordersConstants";
import { riskLevel, customerSpent, RISK_CONFIG } from "../hooks/useCustomers";

export default function CustomerPanel({ customer }) {
  const risk = riskLevel(customer.orders);
  const spent = customerSpent(customer.orders);
  const returns = customer.orders.filter((o) => o.status === "returned").length;

  return (
    <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
        <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-lg font-bold text-white">
          {customer.name[0]}
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">{customer.name}</h2>
          <p className="text-sm text-gray-400">{customer.phone}</p>
        </div>
        <span
          className={`ml-auto text-xs px-3 py-1 rounded-xl border font-medium ${RISK_CONFIG[risk].class}`}
        >
          {RISK_CONFIG[risk].label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 py-5 border-b border-gray-100">
        {[
          {
            label: "Total Orders",
            value: customer.orders.length,
            icon: ShoppingBag,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Total Spent",
            value: `৳${spent}`,
            icon: TrendingUp,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Returns",
            value: returns,
            icon: AlertTriangle,
            color: "text-red-600",
            bg: "bg-red-50",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-4`}>
            <Icon size={14} className={`${color} mb-2`} />
            <p className="text-lg font-bold text-gray-800">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="pt-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Order History
        </p>
        <div className="space-y-2">
          {customer.orders.map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl"
            >
              <div>
                <p className="text-sm font-medium text-gray-800">{o.product}</p>
                <p className="text-xs text-gray-400">{o.payment}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700">
                  ৳{o.amount}
                </span>
                <span
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium capitalize ${STATUS_COLORS[o.status]}`}
                >
                  {o.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
