import { X, Trash2, Loader2, ShieldCheck, ShieldAlert, Shield, UserPlus } from "lucide-react";
import { ORDER_STATUS, RISK_BADGE_CONFIG } from "../../../lib/constants";
import { useSubscription } from "../../../features/subscription/hooks/useSubscription";
import { useSteadfast } from "../../../features/steadfast/useSteadfast";
import { useCustomerRisk } from "../../../features/orders/hooks/useCustomerRisk";
import toast from "react-hot-toast";

const statusTimeline = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PACKED,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.DELIVERED,
];

const statusColors = {
  pending: "bg-amber-50 text-amber-600 border-amber-200",
  confirmed: "bg-blue-50 text-blue-600 border-blue-200",
  packed: "bg-purple-50 text-purple-600 border-purple-200",
  shipped: "bg-cyan-50 text-cyan-600 border-cyan-200",
  delivered: "bg-emerald-50 text-emerald-600 border-emerald-200",
  returned: "bg-red-50 text-red-600 border-red-200",
};

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}

export default function OrderDrawer({ order, onClose, onStatusChange, onDelete }) {
  const { tier } = useSubscription();
  const { createConsignment } = useSteadfast();
  const { loading: riskLoading, totalOrders, delivered, returned, returnRate, riskLevel } = useCustomerRisk(order?.phone, order?.id);

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
      <div className="fixed right-0 top-0 z-50 flex h-full w-full sm:max-w-md flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 shrink-0">
          <div>
            <p className="text-xs text-gray-400">Order</p>
            <h2 className="font-bold text-gray-900">{order.displayId || order.id}</h2>
          </div>
          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                onClick={() => onDelete(order.id)}
                className="text-gray-300 hover:text-red-500 transition p-1"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 min-h-0 pb-[env(safe-area-inset-bottom)]">

          {/* Customer History */}
          {!riskLoading && (
            <section className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Customer History
              </p>
              <div className="flex flex-col space-y-1">
                <p className="text-sm">
                  📦 {totalOrders} orders  ✅ {delivered} delivered  ❌ {returned} returned
                </p>
                <p className="text-sm">Return Rate: {returnRate.toFixed(1)}%</p>
{riskLevel && (
  <div className={`flex items-center space-x-1 text-${RISK_BADGE_CONFIG[riskLevel].color}-600`}>
    {(() => {
      const IconMap = {
        trusted: ShieldCheck,
        medium: ShieldAlert,
        high: Shield,
        new_customer: UserPlus,
      };
      const Icon = IconMap[riskLevel];
      return Icon ? <Icon size={16} /> : null;
    })()}
    <span>{RISK_BADGE_CONFIG[riskLevel].label}</span>
  </div>
)}
              </div>
            </section>
          )}
          {riskLoading && <div className="animate-pulse h-6 bg-gray-200 rounded w-48 mb-2" />}
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Customer
            </p>
            <p className="font-semibold text-gray-900">{order.customer}</p>
            <p className="text-sm text-gray-500">{order.phone}</p>
            <p className="text-sm text-gray-500">{order.address}</p>
          </section>

          {/* Order Info */}
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Order Info
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-400">Product</p>
                <p className="font-medium text-sm text-gray-800">{order.product}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-400">Amount</p>
                <p className="font-medium text-sm text-gray-800">৳{order.amount}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-400">Delivery</p>
                <p className="font-medium text-sm text-gray-800">৳{order.deliveryCharge}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-400">Payment</p>
                <p className="font-medium text-sm text-gray-800">{order.payment}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-400">Courier</p>
                <p className="font-medium text-sm text-gray-800">{order.courier}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-400">Date</p>
                <p className="font-medium text-sm text-gray-800">
                  {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
          </section>

          {/* Notes */}
          {order.notes && (
            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Notes
              </p>
              <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700">
                {order.notes}
              </p>
            </section>
          )}

          {/* Timeline */}
          {order.status !== ORDER_STATUS.RETURNED && (
            <section>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Timeline
              </p>
              <div className="space-y-3">
                {statusTimeline.map((step, i) => {
                  const done = i <= currentIndex;
                  return (
                    <div key={step} className="flex items-center gap-3">
                      <div
                        className={`h-3 w-3 rounded-full shrink-0 ${
                          done ? "bg-emerald-500" : "bg-gray-200"
                        }`}
                      />
                      <span
                        className={`capitalize text-sm ${
                          done ? "font-medium text-gray-800" : "text-gray-400"
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
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Update Status
            </p>
            <select
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
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

            {/* Create Consignment (Steadfast) */}
            {tier === "grower" && (
              <button
                onClick={async () => {
                  try {
                    const payload = {
                      invoice: order.id?.toString() ?? order.displayId?.toString(),
                      recipient_name: order.customer,
                      recipient_phone: order.phone,
                      recipient_address: order.address,
                      cod_amount: Number(order.amount) || 0,
                    };
                    const result = await createConsignment(payload);
                    if (result?.consignment) {
                      toast.success(
                        `Consignment ${result.consignment.tracking_code} created`
                      );
                      // optional: you could store tracking_code in order state here
                    } else {
                      toast.error(result?.message ?? "Failed to create consignment");
                    }
                  } catch (e) {
                    toast.error(e?.message ?? "Error creating consignment");
                  }
                }}
                className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md font-medium"
              >
                Create Consignment
              </button>
            )}

        </div>
      </div>
    </>
  );
}
