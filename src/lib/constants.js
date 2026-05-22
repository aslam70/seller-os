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
};
