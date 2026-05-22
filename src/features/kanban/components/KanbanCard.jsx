import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function OrderCard({ order, isDragging }) {
  return (
    <div
      className={`bg-white rounded-xl p-3 shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing transition
      ${isDragging ? "opacity-40" : "hover:shadow-md hover:-translate-y-0.5"}`}
    >
      <p className="font-semibold text-gray-800 text-sm">{order.customer}</p>
      <p className="text-xs text-gray-500 mt-0.5">{order.product}</p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs font-medium text-emerald-600">
          ৳{order.amount}
        </span>
        <span className="text-xs text-gray-400">{order.payment}</span>
      </div>
      <p className="text-xs text-gray-400 mt-1 truncate">{order.phone}</p>
    </div>
  );
}

export function SortableCard({ order }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: order.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
    >
      <OrderCard order={order} isDragging={isDragging} />
    </div>
  );
}
