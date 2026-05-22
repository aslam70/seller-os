const KEY = "orders_v2";

export const storage = {
  get: () => JSON.parse(localStorage.getItem(KEY) || "[]"),
  set: (data) => localStorage.setItem(KEY, JSON.stringify(data)),
  clear: () => localStorage.removeItem(KEY),
};
