import { X } from "lucide-react";
import { ORDER_STATUS } from "../../../lib/constants";

const statusTimeline = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PACKED,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.DELIVERED,
];

const statusColors = {
  pending: "badge-warning",
  confirmed: "badge-info",
  packed: "badge-secondary",
  shipped: "badge-primary",
  delivered: "badge-success",
  returned: "badge-error",
};

export default function OrderDrawer({ order, onClose, onStatusChange }) {
  if (!order) return null;

  const currentIndex = statusTimeline.indexOf(order.status);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-base-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <p className="text-xs text-base-content/50">Order</p>
            <h2 className="font-bold">{order.displayId || order.id}</h2>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 min-h-0">

          {/* Customer */}
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-base-content/40">
              Customer
            </p>
            <p className="font-semibold">{order.customer}</p>
            <p className="text-sm text-base-content/60">{order.phone}</p>
            <p className="text-sm text-base-content/60">{order.address}</p>
          </section>

          {/* Order Info */}
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-base-content/40">
              Order Info
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-base-200 p-3">
                <p className="text-xs text-base-content/50">Product</p>
                <p className="font-medium text-sm">{order.product}</p>
              </div>
              <div className="rounded-lg bg-base-200 p-3">
                <p className="text-xs text-base-content/50">Amount</p>
                <p className="font-medium text-sm">৳{order.amount}</p>
              </div>
              <div className="rounded-lg bg-base-200 p-3">
                <p className="text-xs text-base-content/50">Delivery</p>
                <p className="font-medium text-sm">৳{order.deliveryCharge}</p>
              </div>
              <div className="rounded-lg bg-base-200 p-3">
                <p className="text-xs text-base-content/50">Payment</p>
                <p className="font-medium text-sm">{order.payment}</p>
              </div>
              <div className="rounded-lg bg-base-200 p-3">
                <p className="text-xs text-base-content/50">Courier</p>
                <p className="font-medium text-sm">{order.courier}</p>
              </div>
              <div className="rounded-lg bg-base-200 p-3">
                <p className="text-xs text-base-content/50">Date</p>
                <p className="font-medium text-sm">
                  {new Date(order.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </section>

          {/* Notes */}
          {order.notes && (
            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-base-content/40">
                Notes
              </p>
              <p className="rounded-lg bg-base-200 px-4 py-3 text-sm">
                {order.notes}
              </p>
            </section>
          )}

          {/* Timeline */}
          {order.status !== ORDER_STATUS.RETURNED && (
            <section>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-base-content/40">
                Timeline
              </p>
              <div className="space-y-3">
                {statusTimeline.map((step, i) => {
                  const done = i <= currentIndex;
                  return (
                    <div key={step} className="flex items-center gap-3">
                      <div
                        className={`h-3 w-3 rounded-full shrink-0 ${
                          done ? "bg-emerald-500" : "bg-base-300"
                        }`}
                      />
                      <span
                        className={`capitalize text-sm ${
                          done ? "font-medium" : "text-base-content/40"
                        }`}
                      >
                        {step}
                      </span>
                      {i === currentIndex && (
                        <span className="ml-auto text-xs text-emerald-500 font-medium">
                          Current
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Status */}
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-base-content/40">
              Update Status
            </p>
            <select
              className="select select-bordered w-full"
              value={order.status}
              onChange={(e) => onStatusChange(order.id, e.target.value)}
            >
              {Object.values(ORDER_STATUS).map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s}
                </option>
              ))}
            </select>
          </section>
        </div>
      </div>
    </>
  );
}
