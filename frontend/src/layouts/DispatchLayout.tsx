import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../auth/authStore";
import {
  House,
  Calendar,
  Users,
  FileText,
  Wrench,
  ChartColumnDecreasing,
  Settings,
  Search
} from "lucide-react";

export default function DispatchLayout() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-900 shadow-sm hidden md:flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-zinc-900">
          Dispatch Panel Demo
        </div>

        <nav className="flex-1 p-2 space-y-1">
          <NavItem 
		  	to="/dispatch" 
			icon={<House size={18} />} 
			label="Dashboard" 
		  />
          <NavItem 
		 	to="/dispatch/jobs" 
		 	icon={<FileText size={18} />} 
		  	label="Jobs" 
		  />
          <NavItem
            to="/dispatch/schedule"
            icon={<Calendar size={18} />}
            label="Schedule"
          />
          <NavItem
            to="/dispatch/clients"
            icon={<Users size={18} />}
            label="Clients"
          />
		  <NavItem
			to="/dispatch/technicians"
			icon={<Wrench size={18} />}
			label="Technicians"
		  />
          <NavItem
            to="/dispatch/reporting"
            icon={<ChartColumnDecreasing size={18} />}
            label="Reporting"
          />
          <NavItem
            to="/dispatch/settings"
            icon={<Settings size={18} />}
            label="Settings"
          />
        </nav>

        {/* Optional bottom area (user info or footer) */}
        <div className="border-t border-zinc-900 p-4 text-sm text-gray-400">
          Logged in as <span className="text-gray-200">{user?.name}</span>
        </div>
      </aside>

      
      <div className="flex flex-col flex-1 overflow-hidden">
		{/* Top Bar */}
        <header className="flex justify-end items-center px-6 py-3 border-b border-zinc-900 bg-zinc-950">
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative w-80">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search clients, jobs or technicians..."
                className="w-full pl-10 pr-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm 
                        text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 
                        focus:ring-blue-500"
              />
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="text-sm bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </header>

		{/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-zinc-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* -------------------------------------------
   🔹 Reusable NavItem component
   ------------------------------------------- */
function NavItem({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center gap-3 p-2 rounded-md transition-colors ${
          isActive
            ? "bg-zinc-900 font-medium text-white"
            : "text-gray-400 hover:text-white hover:bg-zinc-800"
        }`
      }
    >
      <span className="text-gray-400">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}
