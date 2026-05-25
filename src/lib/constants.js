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
  trusted: { label: "Trusted", icon: "ShieldCheck", color: "emerald" },
  medium: { label: "Medium Risk", icon: "ShieldAlert", color: "yellow" },
  high: { label: "High Risk", icon: "Shield", color: "red" },
  new_customer: { label: "New Customer", icon: "UserPlus", color: "gray" },
};
