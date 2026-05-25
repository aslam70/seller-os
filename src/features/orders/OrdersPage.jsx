import { useState } from "react";
import { Plus, Search, ShoppingBag, Download, Upload, AlertTriangle, Lock } from "lucide-react";
import { ORDER_STATUS } from "../../lib/constants";
import OrderRow from "./components/OrderRow";
import AddOrderModal from "./components/AddOrderModal";
import OrderDrawer from "./components/OrderDrawer";
import CsvImportModal from "./components/CsvImportModal";
import EmptyState from "../../components/EmptyState";
import { useOrders } from "./hooks/useOrders";
import { STATUS_COLORS } from "./ordersConstants";
import { useCustomers } from "../customers/hooks/useCustomers";
import { useSubscription } from "../subscription/hooks/useSubscription";
import SaaSUpgradeModal from "../../components/SaaSUpgradeModal";
import toast from "react-hot-toast";

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}

export default function OrdersPage() {
  const { orders, loading, addOrder, bulkAddOrders, updateStatus, deleteOrder } = useOrders();
  const { customers, findOrCreate } = useCustomers();
  const { tier, plan, reachedLimit } = useSubscription(orders.length);

  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // SaaS Paywall State
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallTitle, setPaywallTitle] = useState("Upgrade Plan");

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="loading loading-spinner loading-md text-emerald-500" />
      </div>
    );
  }

  const filtered = orders.filter(
    (o) =>
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.product.toLowerCase().includes(search.toLowerCase()),
  );

  async function handleAdd(formData) {
    const customerId = await findOrCreate({
      name: formData.customer,
      phone: formData.phone,
      address: formData.address,
    });
    if (!customerId) return;
    addOrder(formData);
    setShowModal(false);
  }

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      toast.error("No orders to export.");
      return;
    }
    const headers = [
      "Customer",
      "Phone",
      "Address",
      "Product",
      "Amount",
      "Delivery Charge",
      "Payment",
      "Status",
      "Courier",
      "Notes",
      "Created At"
    ];
    const rows = filtered.map((o) => [
      `"${o.customer.replace(/"/g, '""')}"`,
      `"${(o.phone || "").replace(/"/g, '""')}"`,
      `"${(o.address || "").replace(/"/g, '""')}"`,
      `"${o.product.replace(/"/g, '""')}"`,
      o.amount,
      o.deliveryCharge || 60,
      o.payment,
      o.status,
      o.courier || "Pathao",
      `"${(o.notes || "").replace(/"/g, '""')}"`,
      o.createdAt || ""
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Interceptors for Premium SaaS actions
  const handleAddOrderClick = () => {
    if (reachedLimit) {
      setPaywallTitle("Order Quota Limit Reached");
      setPaywallOpen(true);
    } else {
      setShowModal(true);
    }
  };

  const handleImportCSVClick = () => {
    if (tier === "free") {
      setPaywallTitle("CSV Automation is a Premium Feature");
      setPaywallOpen(true);
    } else {
      setShowImportModal(true);
    }
  };

  const handleExportCSVClick = () => {
    if (tier === "free") {
      setPaywallTitle("CSV Automation is a Premium Feature");
      setPaywallOpen(true);
    } else {
      handleExportCSV();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* SaaS Quota Warning Banner */}
      {tier === "free" && (
        <div className="glass-panel border-amber-200 bg-amber-50/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <AlertTriangle size={15} />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900">You are on the Free Plan ({orders.length} / 15 Orders Used)</p>
              <p className="text-[10px] text-amber-700/80 mt-0.5 font-medium leading-normal">
                Upgrade to Grower Plan to activate bulk CSV importing/exporting, unlock SVG charts, and extend your limits to 250 orders.
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              setPaywallTitle("Upgrade to Grower Plan");
              setPaywallOpen(true);
            }}
            className="text-xs px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
          >
            Upgrade Now
          </button>
        </div>
      )}

      {/* Header with quick buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Orders</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {orders.length} total orders logged
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSVClick}
            className="flex items-center justify-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-3.5 py-2.5 rounded-xl text-xs font-bold shadow-xs hover:bg-gray-50 transition cursor-pointer"
          >
            <Download size={14} /> Export CSV {tier === "free" && <Lock size={10} className="text-amber-500" />}
          </button>
          <button
            onClick={handleImportCSVClick}
            className="flex items-center justify-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-3.5 py-2.5 rounded-xl text-xs font-bold shadow-xs hover:bg-gray-50 transition cursor-pointer"
          >
            <Upload size={14} /> Import CSV {tier === "free" && <Lock size={10} className="text-amber-500" />}
          </button>
          <button
            onClick={handleAddOrderClick}
            className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition cursor-pointer"
          >
            <Plus size={14} /> Add Order {reachedLimit && <Lock size={10} className="text-white" />}
          </button>
        </div>
      </div>

      <div className="relative">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search by customer name or product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
        />
      </div>

      {/* Mobile card list */}
      <div className="lg:hidden space-y-2">
        {filtered.length === 0 ? (
          orders.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="No orders yet"
              description="Add your first order to start tracking sales and deliveries."
              action={
                <button
                  onClick={handleAddOrderClick}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer"
                >
                  <Plus size={14} /> Add order
                </button>
              }
            />
          ) : (
            <EmptyState
              icon={Search}
              title="No results found"
              description={`No orders match "${search}". Try a different name or product.`}
            />
          )
        ) : (
          filtered.map((order) => (
            <button
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="w-full text-left bg-white border border-gray-100 rounded-xl px-4 py-3.5 hover:border-gray-200 transition"
            >
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm font-semibold text-gray-800">{order.customer}</p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-lg border font-medium capitalize ${STATUS_COLORS[order.status]}`}
                >
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{order.product}</p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>
                  ৳{order.amount}
                  {order.phone ? ` · ${order.phone}` : ""}
                </span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 shadow-xs overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["Customer", "Date", "Product", "Amount", "Payment", "Address", "Courier", "Notes", "Status", ""].map(
                (h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10}>
                  {orders.length === 0 ? (
                    <EmptyState
                      icon={ShoppingBag}
                      title="No orders yet"
                      description="Add your first order to start tracking sales and deliveries."
                      action={
                        <button
                          onClick={handleAddOrderClick}
                          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer"
                        >
                          <Plus size={14} /> Add order
                        </button>
                      }
                    />
                  ) : (
                    <EmptyState
                      icon={Search}
                      title="No results found"
                      description={`No orders match "${search}". Try a different name or product.`}
                    />
                  )}
                </td>
              </tr>
            ) : (
              filtered.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  updateStatus={updateStatus}
                  deleteOrder={deleteOrder}
                  onClick={setSelectedOrder}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddOrderModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleAdd}
        customers={customers}
      />

      <CsvImportModal
        show={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={bulkAddOrders}
      />

      <OrderDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusChange={(id, status) => {
          updateStatus(id, status);
          setSelectedOrder(prev => ({ ...prev, status }));
        }}
        onDelete={(id) => {
          deleteOrder(id);
          setSelectedOrder(null);
        }}
      />

      {/* Reusable SaaS Paywall Modal */}
      <SaaSUpgradeModal 
        show={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        title={paywallTitle}
      />
    </div>
  );
}
