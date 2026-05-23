import { useState } from "react";
import { Plus, Search, ShoppingBag } from "lucide-react";
import { ORDER_STATUS } from "../../lib/constants";
import OrderRow from "./components/OrderRow";
import AddOrderModal from "./components/AddOrderModal";
import OrderDrawer from "./components/OrderDrawer";
import EmptyState from "../../components/EmptyState";
import { useOrders } from "./hooks/useOrders";
import { STATUS_COLORS } from "./ordersConstants";

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
  const { orders, loading, addOrder, updateStatus, deleteOrder } = useOrders();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  function handleAdd(formData) {
    addOrder(formData);
    setShowModal(false);
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {orders.length} total orders
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Add Order</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="relative mb-4">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search by customer or product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
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
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
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
      <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
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
                          onClick={() => setShowModal(true)}
                          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
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
    </div>
  );
}
