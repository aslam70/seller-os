export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
        <Icon size={24} className="text-emerald-500" />
      </div>
      <p className="text-sm font-semibold text-gray-800 mb-1">{title}</p>
      <p className="text-sm text-gray-400 max-w-xs leading-relaxed">{description}</p>
      {action && (
        <div className="mt-5">{action}</div>
      )}
    </div>
  );
}
