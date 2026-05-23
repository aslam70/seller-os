import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  RotateCcw,
  TrendingUp,
  PackageOpen,
} from "lucide-react";
import { ORDER_STATUS } from "../../lib/constants";
import { getDeliveredRevenue } from "../../lib/selectors";
import { useOrders } from "../orders/hooks/useOrders";

const STAT_CONFIG = [
  {
    key: "total",
    label: "Total Orders",
    icon: ShoppingBag,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    key: ORDER_STATUS.PENDING,
    label: "Pending",
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  {
    key: ORDER_STATUS.DELIVERED,
    label: "Delivered",
    icon: CheckCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    key: ORDER_STATUS.RETURNED,
    label: "Returned",
    icon: RotateCcw,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-100",
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { orders } = useOrders();
  const counts = {
    total: orders.length,
    [ORDER_STATUS.PENDING]: orders.filter(
      (o) => o.status === ORDER_STATUS.PENDING,
    ).length,
    [ORDER_STATUS.DELIVERED]: orders.filter(
      (o) => o.status === ORDER_STATUS.DELIVERED,
    ).length,
    [ORDER_STATUS.RETURNED]: orders.filter(
      (o) => o.status === ORDER_STATUS.RETURNED,
    ).length,
  };

  const totalRevenue = getDeliveredRevenue(orders);

  return (
    <div className="max-w-4xl">
      <div className="mb-7">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">Seller OS — overview</p>
      </div>

      {orders.length === 0 && (
        <div className="mb-6 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
            <PackageOpen size={16} className="text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-800 mb-0.5">Welcome to Seller OS</p>
            <p className="text-xs text-emerald-600 leading-relaxed">
              Start by adding your products, then create your first order to see stats here.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => navigate("/products")}
              className="text-xs px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition"
            >
              Add products
            </button>
            <button
              onClick={() => navigate("/orders")}
              className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
            >
              New order
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-6">
        {STAT_CONFIG.map(({ key, label, icon: Icon, color, bg, border }) => (
          <div key={key} className={`${bg} border ${border} rounded-2xl p-5`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {label}
              </p>
              <div
                className={`w-7 h-7 rounded-lg ${bg} border ${border} flex items-center justify-center`}
              >
                <Icon size={14} className={color} />
              </div>
            </div>
            <p className={`text-3xl font-bold ${color}`}>{counts[key]}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
            Delivered Revenue
          </p>
          <p className="text-2xl font-bold text-white">
            <span style={{ fontFamily: "serif" }}>৳</span>
            {totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
          <TrendingUp size={18} className="text-white" />
        </div>
      </div>
    </div>
  );
}
