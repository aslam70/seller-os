import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { getOrdersByStatus } from "../../../lib/selectors";
import KanbanColumn from "./KanbanColumn";
import { OrderCard } from "./KanbanCard";

const COLUMNS = [
  { id: "pending", label: "New Order", color: "bg-amber-400" },
  { id: "confirmed", label: "Confirmed", color: "bg-blue-400" },
  { id: "packed", label: "Packed", color: "bg-purple-400" },
  { id: "shipped", label: "Shipped", color: "bg-cyan-400" },
  { id: "delivered", label: "Delivered", color: "bg-emerald-400" },
  { id: "returned", label: "Returned", color: "bg-red-400" },
];

export default function KanbanBoard({ orders, updateStatus }) {
  const [activeOrder, setActiveOrder] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleDragStart({ active }) {
    setActiveOrder(orders.find((o) => o.id === active.id) || null);
  }

  function handleDragOver({ active, over }) {
    if (!over) return;
    const overColumn = COLUMNS.find((c) => c.id === over.id);
    const overCard = orders.find((o) => o.id === over.id);
    if (!overColumn && !overCard) return;
    const targetStatus = overColumn ? overColumn.id : overCard.status;
    updateStatus(active.id, targetStatus);
  }

  function handleDragEnd() {
    setActiveOrder(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            orders={getOrdersByStatus(orders, col.id)}
          />
        ))}
      </div>
      <DragOverlay>
        {activeOrder ? (
          <OrderCard order={activeOrder} isDragging={false} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
