import { useOrders } from "../orders/hooks/useOrders";
import KanbanBoard from "./components/KanbanBoard";
import Spinner from "../../components/Spinner";

export default function KanbanPage() {
  const { orders, loading, updateStatus } = useOrders();
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner size="lg" />
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
