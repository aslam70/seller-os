import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  RotateCcw,
  TrendingUp,
  PackageOpen,
  Truck,
  CreditCard,
  Percent,
} from "lucide-react";
import { ORDER_STATUS } from "../../lib/constants";
import { getDeliveredRevenue } from "../../lib/selectors";
import { useOrders } from "../orders/hooks/useOrders";

const STAT_CONFIG = [
  {
    key: "total",
    label: "Total Orders",
    icon: ShoppingBag,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50/70",
    border: "border-blue-100/80",
    hoverGlow: "shadow-blue-500/10",
  },
  {
    key: ORDER_STATUS.PENDING,
    label: "Pending",
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50/70",
    border: "border-amber-100/80",
    hoverGlow: "shadow-amber-500/10",
  },
  {
    key: ORDER_STATUS.DELIVERED,
    label: "Delivered",
    icon: CheckCircle,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50/70",
    border: "border-emerald-100/80",
    hoverGlow: "shadow-emerald-500/10",
  },
  {
    key: ORDER_STATUS.RETURNED,
    label: "Returned",
    icon: RotateCcw,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50/70",
    border: "border-red-100/80",
    hoverGlow: "shadow-red-500/10",
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { orders, loading } = useOrders();
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const counts = useMemo(() => {
    return {
      total: orders.length,
      [ORDER_STATUS.PENDING]: orders.filter((o) => o.status === ORDER_STATUS.PENDING).length,
      [ORDER_STATUS.DELIVERED]: orders.filter((o) => o.status === ORDER_STATUS.DELIVERED).length,
      [ORDER_STATUS.RETURNED]: orders.filter((o) => o.status === ORDER_STATUS.RETURNED).length,
    };
  }, [orders]);

  const totalRevenue = useMemo(() => getDeliveredRevenue(orders), [orders]);

  // Return Rate calculation
  const returnRate = useMemo(() => {
    if (orders.length === 0) return 0;
    const returnedCount = counts[ORDER_STATUS.RETURNED];
    return Math.round((returnedCount / orders.length) * 100);
  }, [orders, counts]);

  // Payment Breakdown
  const paymentBreakdown = useMemo(() => {
    const methods = { COD: 0, bKash: 0, Nagad: 0, Card: 0 };
    orders.forEach((o) => {
      if (methods[o.payment] !== undefined) {
        methods[o.payment]++;
      }
    });
    const total = orders.length || 1;
    return Object.entries(methods).map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / total) * 100),
    }));
  }, [orders]);

  // Courier Performance
  const courierStats = useMemo(() => {
    const stats = {};
    orders.forEach((o) => {
      const c = o.courier || "Pathao";
      if (!stats[c]) stats[c] = { total: 0, delivered: 0, returned: 0 };
      stats[c].total++;
      if (o.status === ORDER_STATUS.DELIVERED) stats[c].delivered++;
      if (o.status === ORDER_STATUS.RETURNED) stats[c].returned++;
    });
    return Object.entries(stats).map(([name, data]) => {
      const successRate = data.total > 0 ? Math.round((data.delivered / data.total) * 100) : 0;
      return { name, successRate, ...data };
    }).sort((a, b) => b.successRate - a.successRate);
  }, [orders]);

  // Sales Trend (7 Days)
  const salesTrend = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const isoStr = d.toISOString().split("T")[0];
      days.push({ label: dateStr, dateKey: isoStr, revenue: 0, count: 0 });
    }

    orders.forEach((o) => {
      if (!o.createdAt) return;
      const orderDate = o.createdAt.split("T")[0];
      const matchingDay = days.find((d) => d.dateKey === orderDate);
      if (matchingDay) {
        matchingDay.count++;
        if (o.status === ORDER_STATUS.DELIVERED) {
          matchingDay.revenue += o.amount;
        }
      }
    });

    return days;
  }, [orders]);

  // Trend Chart SVG Math
  const chartSvgPath = useMemo(() => {
    if (salesTrend.length === 0) return "";
    const width = 500;
    const height = 140;
    const maxVal = Math.max(...salesTrend.map((d) => d.revenue), 1000);
    const xStep = width / (salesTrend.length - 1);

    const points = salesTrend.map((d, index) => {
      const x = index * xStep;
      const y = height - (d.revenue / maxVal) * (height - 20) - 10;
      return { x, y, ...d };
    });

    // Make smooth cubic bezier path
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + xStep / 2;
      const cpY1 = p0.y;
      const cpX2 = p1.x - xStep / 2;
      const cpY2 = p1.y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }

    // Make filled path
    const fillPath = `${path} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return { path, fillPath, points };
  }, [salesTrend]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <span className="loading loading-spinner loading-lg text-emerald-600" />
          <p className="text-sm font-semibold text-gray-500">Loading metrics...</p>
        </div>
      </div>
    );
  }

  // Ring styling for radial gauge
  const radius = 34;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(returnRate, 100) / 100) * circumference;

  let gaugeColor = "text-emerald-500 stroke-emerald-500";
  let gaugeBg = "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (returnRate >= 25) {
    gaugeColor = "text-red-500 stroke-red-500";
    gaugeBg = "bg-red-50 text-red-700 border-red-100";
  } else if (returnRate > 10) {
    gaugeColor = "text-amber-500 stroke-amber-500";
    gaugeBg = "bg-amber-50 text-amber-700 border-amber-100";
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Overview</h1>
          <p className="text-xs text-gray-400 mt-0.5">Real-time analytical control deck</p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-xs shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Live Data Desk</span>
        </div>
      </div>

      {/* Welcome empty state */}
      {orders.length === 0 && (
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 flex flex-col md:flex-row md:items-center gap-5">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
            <PackageOpen size={20} className="text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-emerald-950 mb-0.5">Welcome to your Seller OS Portal</p>
            <p className="text-xs text-emerald-700/80 leading-relaxed max-w-2xl">
              Establish your digital catalog by adding products, or upload your legacy `orders.csv` in the Orders page. Once orders flow in, these analytics will spark into life.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => navigate("/products")}
              className="text-xs px-4 py-2.5 rounded-xl border border-emerald-200 text-emerald-800 hover:bg-emerald-100/50 font-medium transition cursor-pointer"
            >
              Add Products
            </button>
            <button
              onClick={() => navigate("/orders")}
              className="text-xs px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-semibold shadow-xs transition cursor-pointer"
            >
              Go to Orders
            </button>
          </div>
        </div>
      )}

      {/* Grid statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CONFIG.map(({ key, label, icon: Icon, color, bg, border, hoverGlow }) => (
          <div
            key={key}
            className={`${bg} border ${border} rounded-2xl p-5 shadow-xs transition hover:shadow-md hover:${hoverGlow} duration-300`}
          >
            <div className="flex items-center justify-between mb-3.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {label}
              </p>
              <div className="w-7 h-7 rounded-lg bg-white/80 flex items-center justify-center shadow-xs border border-gray-100/30">
                <Icon size={14} className={color} />
              </div>
            </div>
            <p className={`text-3xl font-extrabold tracking-tight ${color}`}>{counts[key]}</p>
          </div>
        ))}
      </div>

      {/* Visual Analytics Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Line Graph */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[320px]">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-gray-800">Delivered Revenue Trend</h3>
              <div className="text-xs text-gray-400">Last 7 Days</div>
            </div>
            <p className="text-2xl font-black text-gray-900 tracking-tight mb-4">
              <span className="font-serif mr-0.5">৳</span>
              {totalRevenue.toLocaleString()}
            </p>
          </div>

          <div className="relative flex-1 w-full min-h-[140px]">
            {orders.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                No revenue trends to plot yet
              </div>
            ) : (
              chartSvgPath && (
                <svg
                  viewBox="0 0 500 140"
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal gridlines */}
                  <line x1="0" y1="35" x2="500" y2="35" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
                  <line x1="0" y1="70" x2="500" y2="70" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
                  <line x1="0" y1="105" x2="500" y2="105" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />

                  {/* Filled Area */}
                  <path d={chartSvgPath.fillPath} fill="url(#areaGrad)" />

                  {/* Line path */}
                  <path
                    d={chartSvgPath.path}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Dots / Points */}
                  {chartSvgPath.points.map((pt, i) => (
                    <g key={i}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={hoveredPoint?.idx === i ? "6" : "4"}
                        className="fill-white stroke-emerald-500 stroke-[3px] transition-all cursor-pointer"
                        onMouseEnter={() => setHoveredPoint({ idx: i, ...pt })}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    </g>
                  ))}
                </svg>
              )
            )}

            {/* Hover Tooltip */}
            {hoveredPoint && (
              <div
                className="absolute bg-gray-900 text-white rounded-lg p-2 shadow-lg text-[10px] pointer-events-none transition-all duration-150 z-10"
                style={{
                  left: `${(hoveredPoint.idx / 6) * 85 + 2}%`,
                  bottom: `${140 - hoveredPoint.y - 10}px`,
                }}
              >
                <div className="font-semibold">{hoveredPoint.label}</div>
                <div className="text-emerald-400 font-bold mt-0.5">৳{hoveredPoint.revenue.toLocaleString()}</div>
                <div className="text-gray-400">{hoveredPoint.count} orders</div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {salesTrend.map((d, i) => (
              <span key={i}>{d.label}</span>
            ))}
          </div>
        </div>

        {/* Circular Return Rate Gauge */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between items-center text-center">
          <div className="w-full text-left">
            <h3 className="text-sm font-bold text-gray-800">Returned Risk Gauge</h3>
            <p className="text-xs text-gray-400 mt-0.5">Percentage of non-delivered returns</p>
          </div>

          <div className="relative my-4 flex items-center justify-center">
            <svg className="w-28 h-28 transform -rotate-90">
              {/* Back Ring */}
              <circle
                stroke="#f1f5f9"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx="56"
                cy="56"
              />
              {/* Progress Ring */}
              <circle
                className={`${gaugeColor} transition-all duration-500`}
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + " " + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx="56"
                cy="56"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-gray-800">{returnRate}%</span>
              <span className="text-[9px] uppercase tracking-wider font-semibold text-gray-400">Return Rate</span>
            </div>
          </div>

          <div className={`w-full px-4 py-3 border rounded-xl flex items-center gap-2 ${gaugeBg}`}>
            <Percent size={14} className="shrink-0" />
            <div className="text-left text-xs leading-tight">
              {returnRate >= 25 ? (
                <>
                  <p className="font-bold">Dangerous threshold</p>
                  <p className="opacity-80">Consider blacklisting high-risk numbers.</p>
                </>
              ) : returnRate > 10 ? (
                <>
                  <p className="font-bold">Moderate returns</p>
                  <p className="opacity-80">Refining order verification is suggested.</p>
                </>
              ) : (
                <>
                  <p className="font-bold">Healthy Trust Rating</p>
                  <p className="opacity-80">Outstanding customer delivery success.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Couriers & Payments analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Courier Success Rankings */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Truck size={16} className="text-emerald-600" />
            <h3 className="text-sm font-bold text-gray-800">Courier Success Performance</h3>
          </div>

          <div className="space-y-4">
            {courierStats.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No courier records registered yet</p>
            ) : (
              courierStats.map((item) => {
                let barColor = "bg-emerald-500";
                if (item.successRate < 50) barColor = "bg-red-400";
                else if (item.successRate < 75) barColor = "bg-amber-400";

                return (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-700">{item.name}</span>
                      <span className="text-gray-400 font-medium">
                        {item.successRate}% Success · {item.total} orders
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${item.successRate}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Payment Shares */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={16} className="text-emerald-600" />
            <h3 className="text-sm font-bold text-gray-800">Payment Breakdown Share</h3>
          </div>

          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No payment records registered yet</p>
            ) : (
              <div className="space-y-4">
                {/* Horizontal segmented bar */}
                <div className="w-full h-4 bg-gray-100 rounded-lg overflow-hidden flex">
                  {paymentBreakdown.map((item, idx) => {
                    const colors = [
                      "bg-emerald-500",
                      "bg-indigo-500",
                      "bg-purple-500",
                      "bg-amber-400",
                    ];
                    if (item.count === 0) return null;
                    return (
                      <div
                        key={item.name}
                        className={`${colors[idx % colors.length]} h-full transition-all`}
                        style={{ width: `${item.pct}%` }}
                        title={`${item.name}: ${item.pct}%`}
                      />
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {paymentBreakdown.map((item, idx) => {
                    const dotColors = [
                      "bg-emerald-500",
                      "bg-indigo-500",
                      "bg-purple-500",
                      "bg-amber-400",
                    ];
                    return (
                      <div
                        key={item.name}
                        className="flex items-center gap-2.5 bg-gray-50/50 p-2 border border-gray-100/50 rounded-xl"
                      >
                        <div className={`w-2.5 h-2.5 rounded-full ${dotColors[idx % dotColors.length]}`} />
                        <div>
                          <p className="text-xs font-bold text-gray-700">{item.name}</p>
                          <p className="text-[10px] text-gray-400 font-medium">
                            {item.pct}% share ({item.count} orders)
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
