import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../auth/authStore";

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
			<aside className="w-64 border-r-2 border-zinc-900 shadow-sm hidden md:flex flex-col">
				<div className="p-4 text-xl font-bold">Dispatch Panel Demo</div>
				<nav className="flex-1 p-2 space-y-1">
					<NavLink
						to="/dispatch"
						end
						className={({ isActive }) =>
							`block p-2 rounded ${isActive ? "bg-zinc-900 font-medium" : "hover:bg-zinc-800"}`
						}
					>
						Dashboard
					</NavLink>
					<NavLink
						to="/dispatch/jobs"
						className={({ isActive }) =>
							`block p-2 rounded ${isActive ? "bg-zinc-900 font-medium" : "hover:bg-zinc-800"}`
						}
					>
						Jobs
					</NavLink>
					<NavLink
						to="/dispatch/schedule"
						className={({ isActive }) =>
							`block p-2 rounded ${isActive ? "bg-zinc-900 font-medium" : "hover:bg-zinc-800"}`
						}
					>
						Schedule
					</NavLink>
				</nav>
			</aside>

			{/* Main Content */}
			<div className="flex flex-col flex-1 overflow-hidden">
				<header className="flex flex-row-reverse justify-between items-center px-6 py-3">
					<button
						onClick={handleLogout}
						className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
					>
						Logout
					</button>
				</header>
				<main className="flex-1 overflow-y-auto p-6">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
