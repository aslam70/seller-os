import { Trash2 } from "lucide-react";
import { STATUSES, STATUS_COLORS } from "../ordersConstants";

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}

export default function OrderRow({ order, updateStatus, deleteOrder, onClick }) {
  return (
    <tr
      key={order.id}
      className={`transition ${onClick ? "cursor-pointer hover:bg-base-200" : "hover:bg-gray-50"}`}
      onClick={() => onClick?.(order)}
    >
      <td className="px-5 py-4">
        <p className="font-semibold text-gray-800">{order.customer}</p>
        <p className="text-xs text-gray-400 mt-0.5">{order.phone}</p>
      </td>
      <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap" title={`Updated: ${formatDate(order.updatedAt)}`}>
        {formatDate(order.createdAt)}
      </td>
      <td className="px-5 py-4 text-gray-600 max-w-[160px] truncate" title={order.product}>
        {order.product}
      </td>
      <td className="px-5 py-4 font-semibold text-gray-800 whitespace-nowrap">
        <span style={{ fontFamily: "serif" }}>৳</span>
        {order.amount}
      </td>
      <td className="px-5 py-4">
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg font-medium">
          {order.payment}
        </span>
      </td>
      <td className="px-5 py-4 max-w-[140px] truncate" title={order.address}>
        <span className="text-xs text-gray-500">{order.address}</span>
      </td>
      <td className="px-5 py-4">
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg font-medium">
          {order.courier || "—"}
        </span>
      </td>
      <td className="px-5 py-4 max-w-[160px] truncate" title={order.notes}>
        <span className="text-xs text-gray-400">{order.notes || "—"}</span>
      </td>
      <td className="px-5 py-4">
        <select
          value={order.status}
          onChange={(e) => updateStatus(order.id, e.target.value)}
          className={`text-xs px-2.5 py-1 rounded-lg font-medium border capitalize focus:outline-none cursor-pointer ${STATUS_COLORS[order.status]}`}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </td>
      <td className="px-5 py-4">
        <button
          onClick={() => deleteOrder(order.id)}
          className="text-gray-300 hover:text-red-500 transition p-1"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );
}
