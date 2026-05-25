import { NavLink, useNavigate } from "react-router-dom";
import { X, LayoutDashboard, ClipboardList, Kanban, Users, ShoppingBag, Package, LogOut, Settings } from "lucide-react";
import { useAuth } from "../features/auth/hooks/useAuth";
import { useSubscription } from "../features/subscription/hooks/useSubscription";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/orders", label: "Orders", icon: ClipboardList },
  { to: "/kanban", label: "Kanban", icon: Kanban },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/products", label: "Products", icon: Package },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 h-screen bg-white border-r border-gray-100 flex-col shrink-0">
        <Inner onClose={onClose} />
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-56 bg-white border-r border-gray-100 flex-col shrink-0 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Inner onClose={onClose} />
      </aside>
    </>
  );
}

function Inner({ onClose }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { plan } = useSubscription();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <>
      <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
            <ShoppingBag size={14} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 tracking-tight">Seller OS</span>
        </div>
        <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
              ${isActive
                ? "bg-emerald-50 text-emerald-700"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">
            {user?.email?.[0]?.toUpperCase() || "S"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-700 truncate">{user?.email}</p>
            <p className="text-xs text-gray-400 font-medium">{plan?.name || "Free Plan"}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </>
  );
}
