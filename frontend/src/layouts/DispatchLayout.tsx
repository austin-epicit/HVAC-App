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
		<div className="flex h-screen bg-gray-50 text-gray-900">
			{/* Sidebar */}
			<aside className="w-64 bg-white border-r shadow-sm hidden md:flex flex-col">
				<div className="p-4 text-xl font-bold border-b">Dispatch Panel</div>
				<nav className="flex-1 p-2 space-y-1">
					<NavLink
						to="/dispatch"
						end
						className={({ isActive }) =>
							`block p-2 rounded ${isActive ? "bg-blue-100 font-medium" : "hover:bg-gray-100"}`
						}
					>
						Dashboard
					</NavLink>
					<NavLink
						to="/dispatch/jobs"
						className={({ isActive }) =>
							`block p-2 rounded ${isActive ? "bg-blue-100 font-medium" : "hover:bg-gray-100"}`
						}
					>
						Jobs
					</NavLink>
					<NavLink
						to="/dispatch/schedule"
						className={({ isActive }) =>
							`block p-2 rounded ${isActive ? "bg-blue-100 font-medium" : "hover:bg-gray-100"}`
						}
					>
						Schedule
					</NavLink>
				</nav>
			</aside>

			{/* Main Content */}
			<div className="flex flex-col flex-1 overflow-hidden">
				<header className="flex justify-between items-center bg-white border-b px-6 py-3">
					<h1 className="text-lg font-semibold">
						Welcome, {user?.name}
					</h1>
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
