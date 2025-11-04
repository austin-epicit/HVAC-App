import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./auth/LoginPage";
import DispatchLayout from "./layouts/DispatchLayout";
import DashboardPage from "./pages/dispatch/DashboardPage";
import JobsPage from "./pages/dispatch/JobsPage";
import SchedulePage from "./pages/dispatch/SchedulePage";
import { useAuthStore } from "./auth/authStore";
import type { JSX } from "react";

function RequireAuth({ children }: { children: JSX.Element }) {
	const { user } = useAuthStore();
	return user ? children : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />

			<Route
				path="/dispatch/*"
				element={
					<RequireAuth>
						<DispatchLayout />
					</RequireAuth>
				}
			>
				<Route index element={<DashboardPage />} />
				<Route path="jobs" element={<JobsPage />} />
				<Route path="schedule" element={<SchedulePage />} />
			</Route>

			<Route path="*" element={<Navigate to="/login" replace />} />
		</Routes>
	);
}
