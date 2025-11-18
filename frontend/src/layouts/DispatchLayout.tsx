import { Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../auth/authStore";
import {
	House,
	Calendar,
	Users,
	FileText,
	Wrench,
	ChartColumnDecreasing,
	Settings,
	Search,
	Package,
} from "lucide-react";
import SideNavItem from "../components/nav/SideNavItem";

export default function DispatchLayout() {
	const { logout, user } = useAuthStore();
	const navigate = useNavigate();

	// TODO logout
	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	const ICON_SIZE = 20;

	return (
		<div className="flex h-screen bg-zinc-950 text-white">
			<aside className="w-64 border-r border-zinc-900 shadow-sm hidden md:flex flex-col">
				<div className="p-4 text-xl font-bold border-b border-zinc-900">
					Dispatch Demo
				</div>

				<nav className="flex-1 p-2 space-y-1">
					<SideNavItem
						to="/dispatch"
						icon={<House size={ICON_SIZE} />}
						label="Dashboard"
					/>
					<SideNavItem
						to="/dispatch/jobs"
						icon={<FileText size={ICON_SIZE} />}
						label="Jobs"
					/>
					<SideNavItem
						to="/dispatch/schedule"
						icon={<Calendar size={ICON_SIZE} />}
						label="Schedule"
					/>
					<SideNavItem
						to="/dispatch/clients"
						icon={<Users size={ICON_SIZE} />}
						label="Clients"
					/>
					<SideNavItem
						to="/dispatch/inventory"
						icon={<Package size={ICON_SIZE} />}
						label="Inventory"
					/>
					<SideNavItem
						to="/dispatch/technicians"
						icon={<Wrench size={ICON_SIZE} />}
						label="Technicians"
					/>
					<SideNavItem
						to="/dispatch/reporting"
						icon={<ChartColumnDecreasing size={ICON_SIZE} />}
						label="Reporting"
					/>
					<SideNavItem
						to="/dispatch/settings"
						icon={<Settings size={ICON_SIZE} />}
						label="Settings"
					/>
				</nav>

				<div className="border-t border-zinc-900 p-4 text-sm text-gray-400">
					Logged in as{" "}
					<span className="text-gray-200">{user?.name}</span>
				</div>
			</aside>

			<div className="flex flex-col flex-1 overflow-hidden">
				<header className="flex justify-end items-center px-6 py-3 bg-zinc-950">
					<div className="flex items-center gap-3">
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

						<button
							onClick={handleLogout}
							className="text-sm bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600"
						>
							Logout
						</button>
					</div>
				</header>

				<main className="flex-1 overflow-y-auto p-6 bg-zinc-950">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
