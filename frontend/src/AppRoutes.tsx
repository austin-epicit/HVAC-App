import LoginPage from "./auth/LoginPage";
import DispatchLayout from "./layouts/DispatchLayout";
import DashboardPage from "./pages/dispatch/DashboardPage";
import JobsPage from "./pages/dispatch/JobsPage";
import JobDetailPage from "./pages/dispatch/JobDetailPage";
import SchedulePage from "./pages/dispatch/SchedulePage";
import ClientsPage from "./pages/dispatch/ClientsPage";
import ClientDetailsPage from "./pages/dispatch/ClientDetailPage";
import TechniciansPage from "./pages/dispatch/TechniciansPage";
import TechnicianDetailsPage from "./pages/dispatch/TechnicianDetailPage";
import MapPage from "./pages/dispatch/MapPage";
import ReportingPage from "./pages/dispatch/ReportingPage";
import SettingsPage from "./pages/dispatch/SettingsPage";
import QuotesPage from "./pages/dispatch/QuotesPage";
import AssignTechnicianPage from "./pages/dispatch/AssignTechnicianPage";
import RequestsPage from "./pages/dispatch/RequestsPage";
import InventoryPage from "./pages/dispatch/InventoryPage";

import { Routes, Route, Navigate } from "react-router-dom";
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
				<Route path="schedule" element={<SchedulePage />} />
				<Route path="clients" element={<ClientsPage />} />
				<Route path="clients/:clientId" element={<ClientDetailsPage />} />
				<Route path="jobs" element={<JobsPage />} />
				<Route path="jobs/:jobId" element={<JobDetailPage />} />
				<Route path="technicians" element={<TechniciansPage />} />
				<Route
					path="technicians/:technicianId"
					element={<TechnicianDetailsPage />}
				/>
				<Route
					path="technicians/:technicianId/assign"
					element={<AssignTechnicianPage />}
				/>
				<Route path="map" element={<MapPage />} />
				<Route path="reporting" element={<ReportingPage />} />
				<Route path="settings" element={<SettingsPage />} />
				<Route path="inventory" element={<InventoryPage />} />
				<Route path="quotes" element={<QuotesPage />} />
				<Route path="requests" element={<RequestsPage />} />
			</Route>

			<Route path="*" element={<Navigate to="/login" replace />} />
		</Routes>
	);
}
