import { useOrders } from "../orders/hooks/useOrders";
import KanbanBoard from "./components/KanbanBoard";


export default function KanbanPage() {
  const { orders, loading, updateStatus } = useOrders();
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="text-gray-500">Loading orders...</span>
      </div>
    );
  }
  return (
    <div className="p-6 h-full">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Kanban Board</h1>
      <KanbanBoard orders={orders} updateStatus={updateStatus} />
    </div>
  );
}
