import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableCard } from "./KanbanCard";

export default function KanbanColumn({ column, orders }) {
  const { setNodeRef } = useDroppable({ id: column.id });
  return (
    <div ref={setNodeRef} className="flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${column.color}`} />
        <span className="truncate text-sm font-semibold text-gray-700">
          {column.label}
        </span>
        <span className="shrink-0 bg-gray-100 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full">
          {orders.length}
        </span>
      </div>
      <div className="bg-gray-50 rounded-2xl p-2 flex flex-col gap-2 min-h-[120px]">
        <SortableContext
          items={orders.map((o) => o.id)}
          strategy={verticalListSortingStrategy}
        >
          {orders.map((order) => (
            <SortableCard key={order.id} order={order} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
