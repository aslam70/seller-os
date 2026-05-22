import { ORDER_STATUSES } from "../../lib/constants";

export const STATUS_COLORS = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  packed: "bg-purple-50 text-purple-700 border-purple-200",
  shipped: "bg-cyan-50 text-cyan-700 border-cyan-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  returned: "bg-red-50 text-red-700 border-red-200",
};

export const STATUSES = ORDER_STATUSES;
