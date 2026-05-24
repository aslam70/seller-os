import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
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
  const [localOrders, setLocalOrders] = useState([]);

  // Sync with orders from prop
  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragStart({ active }) {
    setActiveOrder(localOrders.find((o) => o.id === active.id) || null);
  }

  function handleDragOver({ active, over }) {
    if (!over) return;

    const overColumn = COLUMNS.find((c) => c.id === over.id);
    const overCard = localOrders.find((o) => o.id === over.id);
    if (!overColumn && !overCard) return;

    const targetStatus = overColumn ? overColumn.id : overCard.status;

    // Optimistically update local order status for instant visual feedback!
    setLocalOrders((prev) =>
      prev.map((o) => (o.id === active.id ? { ...o, status: targetStatus } : o))
    );
  }

  function handleDragEnd({ active, over }) {
    if (over) {
      const overColumn = COLUMNS.find((c) => c.id === over.id);
      const overCard = localOrders.find((o) => o.id === over.id);
      
      if (overColumn || overCard) {
        const targetStatus = overColumn ? overColumn.id : overCard.status;
        const originalOrder = orders.find((o) => o.id === active.id);
        
        // Write to Supabase ONLY if the status actually changed
        if (originalOrder && originalOrder.status !== targetStatus) {
          updateStatus(active.id, targetStatus);
        }
      }
    }
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 h-full select-none">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            orders={localOrders.filter((o) => o.status === col.id)}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={{ duration: 150, easing: "cubic-bezier(0.18, 0.89, 0.32, 1.28)" }}>
        {activeOrder ? (
          <div className="rotate-2 shadow-lg ring-1 ring-emerald-500/20">
            <OrderCard order={activeOrder} isDragging={false} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
