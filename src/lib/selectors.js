import { ORDER_STATUS } from "./constants";

export const getPendingOrders = (orders) =>
  orders.filter((o) => o.status === ORDER_STATUS.PENDING);

export const getDeliveredOrders = (orders) =>
  orders.filter((o) => o.status === ORDER_STATUS.DELIVERED);

export const getDeliveredRevenue = (orders) =>
  getDeliveredOrders(orders).reduce((sum, o) => sum + o.amount, 0);

export const getOrdersByStatus = (orders, status) =>
  orders.filter((o) => o.status === status);
