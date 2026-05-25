export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PACKED: "packed",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  RETURNED: "returned",
};

export const ORDER_STATUSES = Object.values(ORDER_STATUS);

export const PAYMENT_METHODS = ["COD", "bKash", "Nagad", "Card"];

export const RISK_LEVELS = {
  TRUSTED: "trusted",
  MEDIUM: "medium",
  HIGH: "high",
  NEW_CUSTOMER: "new_customer",
};

export const RISK_BADGE_CONFIG = {
  trusted: { label: "Trusted", icon: "ShieldCheck", colorClass: "text-emerald-600" },
  medium: { label: "Medium Risk", icon: "ShieldAlert", colorClass: "text-yellow-600" },
  high: { label: "High Risk", icon: "Shield", colorClass: "text-red-600" },
  new_customer: { label: "New Customer", icon: "UserPlus", colorClass: "text-gray-500" },
};
