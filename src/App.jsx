import { Routes, Route } from "react-router-dom";
import { useOrders } from "./features/orders/hooks/useOrders";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardPage from "./features/dashboard/DashboardPage";
import OrdersPage from "./features/orders/OrdersPage";
import KanbanPage from "./features/kanban/KanbanPage";
import CustomersPage from "./features/customers/CustomersPage";

export default function App() {
  const { orders, addOrder, updateStatus, deleteOrder } = useOrders();

  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<DashboardPage orders={orders} />} />
        <Route
          path="/orders"
          element={
            <OrdersPage
              orders={orders}
              addOrder={addOrder}
              updateStatus={updateStatus}
              deleteOrder={deleteOrder}
            />
          }
        />
        <Route
          path="/kanban"
          element={<KanbanPage orders={orders} updateStatus={updateStatus} />}
        />
        <Route path="/customers" element={<CustomersPage orders={orders} />} />
      </Route>
    </Routes>
  );
}
