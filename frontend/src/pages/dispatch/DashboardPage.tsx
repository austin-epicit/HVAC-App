import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Users,
	Clock,
	MapPin,
	Phone,
	CheckCircle2,
	AlertCircle,
	Calendar,
	TrendingUp,
	Activity,
	ChevronRight,
	RefreshCw,
} from "lucide-react";
import Card from "../../components/ui/Card";
import SmartCalendar from "../../components/ui/SmartCalendar";
import { useAllJobsQuery } from "../../hooks/useJobs";
import { useAllTechniciansQuery } from "../../hooks/useTechnicians";
import type { Technician } from "../../types/technicians";

export default function DashboardPage() {
	const navigate = useNavigate();
	const { data: jobs = [], error: jobsError } = useAllJobsQuery();
	const {
		data: allTechnicians = [],
		error: techsError,
		refetch: refetchTechs,
	} = useAllTechniciansQuery();
	const [refreshing, setRefreshing] = useState(false);

	// Filter technicians who are on the clock (Available or Busy)
	const onlineTechnicians = allTechnicians.filter(
		(tech) => tech.status === "Available" || tech.status === "Busy"
	);

	// Calculate stats
	const availableCount = allTechnicians.filter((t) => t.status === "Available").length;
	const busyCount = allTechnicians.filter((t) => t.status === "Busy").length;
	const totalOnline = availableCount + busyCount;

	// Get technicians with active visits
	const techniciansWithActiveVisits = onlineTechnicians.map((tech) => {
		const activeVisits = jobs
			.flatMap((job) => job.visits || [])
			.filter(
				(visit) =>
					visit.status === "InProgress" &&
					visit.visit_techs?.some((vt) => vt.tech_id === tech.id)
			);

		const scheduledVisits = jobs
			.flatMap((job) => job.visits || [])
			.filter(
				(visit) =>
					visit.status === "Scheduled" &&
					visit.visit_techs?.some((vt) => vt.tech_id === tech.id)
			);

		return {
			...tech,
			activeVisits,
			scheduledVisits,
			totalVisitsToday: activeVisits.length + scheduledVisits.length,
		};
	});

	const handleRefresh = async () => {
		setRefreshing(true);
		await refetchTechs();
		setTimeout(() => setRefreshing(false), 500);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "Available":
				return "bg-green-500";
			case "Busy":
				return "bg-yellow-500";
			case "Break":
				return "bg-blue-500";
			case "Offline":
				return "bg-zinc-500";
			default:
				return "bg-zinc-500";
		}
	};

	const getTimeOnClock = (lastLogin: Date | string) => {
		const now = new Date();
		const loginTime = new Date(lastLogin);
		const diffMs = now.getTime() - loginTime.getTime();
		const diffHours = Math.floor(diffMs / 3600000);
		const diffMins = Math.floor((diffMs % 3600000) / 60000);

		if (diffHours > 0) return `${diffHours}h ${diffMins}m`;
		return `${diffMins}m`;
	};

	const getCurrentVisit = (tech: Technician & { activeVisits: any[] }) => {
		if (tech.activeVisits.length === 0) return null;
		return tech.activeVisits[0]; // First active visit
	};

	return (
		<div className="min-h-screen text-white p-6">
			<div className="grid gap-6 lg:grid-cols-3">
				{/* Calendar - Full Width on Top */}
				<Card className="lg:col-span-3">
					{jobsError && (
						<p className="text-red-400">
							Failed to load calendar.
						</p>
					)}
					<SmartCalendar
						jobs={jobs}
						view="week"
						toolbar={{
							left: "title",
							center: "",
							right: "today prev,next",
						}}
					/>
				</Card>

				{/* Stats Cards Row */}
				<div className="lg:col-span-3 grid gap-4 md:grid-cols-4">
					{/* Total Online */}
					<div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors">
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center gap-2">
								<Users
									size={18}
									className="text-blue-400"
								/>
								<span className="text-sm text-zinc-400">
									Online Now
								</span>
							</div>
						</div>
						<div className="text-3xl font-bold text-white">
							{totalOnline}
						</div>
						<div className="text-xs text-zinc-500 mt-1">
							{availableCount} available • {busyCount}{" "}
							busy
						</div>
					</div>

					{/* Active Jobs */}
					<div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors">
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center gap-2">
								<Activity
									size={18}
									className="text-yellow-400"
								/>
								<span className="text-sm text-zinc-400">
									In Progress
								</span>
							</div>
						</div>
						<div className="text-3xl font-bold text-white">
							{
								jobs
									.flatMap(
										(j) =>
											j.visits ||
											[]
									)
									.filter(
										(v) =>
											v.status ===
											"InProgress"
									).length
							}
						</div>
						<div className="text-xs text-zinc-500 mt-1">
							Active visits
						</div>
					</div>

					{/* Scheduled Today */}
					<div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors">
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center gap-2">
								<Calendar
									size={18}
									className="text-blue-400"
								/>
								<span className="text-sm text-zinc-400">
									Scheduled
								</span>
							</div>
						</div>
						<div className="text-3xl font-bold text-white">
							{
								jobs
									.flatMap(
										(j) =>
											j.visits ||
											[]
									)
									.filter(
										(v) =>
											v.status ===
											"Scheduled"
									).length
							}
						</div>
						<div className="text-xs text-zinc-500 mt-1">
							Today's visits
						</div>
					</div>

					{/* Completion Rate */}
					<div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors">
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center gap-2">
								<TrendingUp
									size={18}
									className="text-green-400"
								/>
								<span className="text-sm text-zinc-400">
									Completed
								</span>
							</div>
						</div>
						<div className="text-3xl font-bold text-white">
							{
								jobs
									.flatMap(
										(j) =>
											j.visits ||
											[]
									)
									.filter(
										(v) =>
											v.status ===
											"Completed"
									).length
							}
						</div>
						<div className="text-xs text-zinc-500 mt-1">
							This week
						</div>
					</div>
				</div>

				{/* Technicians Online - Main Section */}
				<Card className="lg:col-span-2">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-blue-600/20 rounded-lg">
								<Users
									size={20}
									className="text-blue-400"
								/>
							</div>
							<div>
								<h3 className="text-lg font-semibold text-white">
									Active Technicians
								</h3>
								<p className="text-xs text-zinc-400">
									{totalOnline} active •
									Real-time status
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<button
								onClick={handleRefresh}
								className={`p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors ${refreshing ? "animate-spin" : ""}`}
								title="Refresh status"
							>
								<RefreshCw
									size={16}
									className="text-zinc-400"
								/>
							</button>
							<button
								onClick={() =>
									navigate(
										"/dispatch/technicians"
									)
								}
								className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
							>
								View All
								<ChevronRight size={16} />
							</button>
						</div>
					</div>

					{techsError && (
						<div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
							<AlertCircle
								size={16}
								className="text-red-400"
							/>
							<p className="text-sm text-red-400">
								Failed to load technicians
							</p>
						</div>
					)}

					{!techsError && totalOnline === 0 && (
						<div className="text-center py-12">
							<div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-800 rounded-full mb-3">
								<Clock
									size={24}
									className="text-zinc-500"
								/>
							</div>
							<p className="text-zinc-400 mb-1">
								No technicians currently online
							</p>
							<p className="text-xs text-zinc-500">
								Check back when the team clocks in
							</p>
						</div>
					)}

					{!techsError && totalOnline > 0 && (
						<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-[500px] overflow-y-auto pr-2">
							{techniciansWithActiveVisits.map((tech) => {
								const currentVisit =
									getCurrentVisit(tech);
								const isOnJob =
									tech.activeVisits.length >
									0;

								return (
									<div
										key={tech.id}
										className="group bg-zinc-800/50 border border-zinc-700 rounded-lg hover:border-zinc-600 hover:bg-zinc-800 transition-all cursor-pointer overflow-hidden"
										onClick={() =>
											navigate(
												`/dispatch/technicians/${tech.id}`
											)
										}
									>
										{/* Card Content */}
										<div className="p-3">
											{/* Avatar & Status */}
											<div className="flex items-center justify-between mb-3">
												<div className="relative">
													<div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
														{tech.name
															.charAt(
																0
															)
															.toUpperCase()}
													</div>
													<div
														className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 ${getStatusColor(tech.status)} rounded-full border-2 border-zinc-800`}
													/>
												</div>

												<span
													className={`px-2 py-0.5 rounded text-xs font-medium ${
														tech.status ===
														"Available"
															? "bg-green-500/20 text-green-400"
															: "bg-yellow-500/20 text-yellow-400"
													}`}
												>
													{
														tech.status
													}
												</span>
											</div>

											{/* Name & Title */}
											<div className="mb-3">
												<h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate text-sm mb-0.5">
													{
														tech.name
													}
												</h4>
												<p className="text-xs text-zinc-500 truncate">
													{
														tech.title
													}
												</p>
											</div>

											{/* Current Status */}
											<div className="mb-3 min-h-[52px]">
												{isOnJob &&
													currentVisit && (
														<div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
															<div className="flex items-center gap-1.5 mb-1">
																<Activity
																	size={
																		12
																	}
																	className="text-yellow-400 flex-shrink-0"
																/>
																<p className="text-xs font-medium text-yellow-400">
																	On
																	Job
																</p>
															</div>
															<p className="text-xs text-zinc-300 truncate">
																{currentVisit
																	.job
																	?.name ||
																	"Unknown Job"}
															</p>
														</div>
													)}

												{!isOnJob &&
													tech
														.scheduledVisits
														.length >
														0 && (
														<div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded">
															<div className="flex items-center gap-1.5 mb-1">
																<Calendar
																	size={
																		12
																	}
																	className="text-blue-400 flex-shrink-0"
																/>
																<p className="text-xs font-medium text-blue-400">
																	Next
																</p>
															</div>
															<p className="text-xs text-zinc-300 truncate">
																{new Date(
																	tech
																		.scheduledVisits[0]
																		.scheduled_start_at
																).toLocaleTimeString(
																	"en-US",
																	{
																		hour: "numeric",
																		minute: "2-digit",
																		hour12: true,
																	}
																)}
															</p>
														</div>
													)}

												{!isOnJob &&
													tech
														.scheduledVisits
														.length ===
														0 && (
														<div className="p-2 bg-zinc-700/30 border border-zinc-700 rounded">
															<div className="flex items-center gap-1.5">
																<CheckCircle2
																	size={
																		12
																	}
																	className="text-green-400 flex-shrink-0"
																/>
																<p className="text-xs text-zinc-400">
																	Available
																</p>
															</div>
														</div>
													)}
											</div>

											{/* Visits Count */}
											<div className="flex items-center justify-between text-xs text-zinc-400 mb-3 pb-3 border-b border-zinc-700">
												<span className="flex items-center gap-1">
													<Calendar
														size={
															12
														}
													/>
													{
														tech.totalVisitsToday
													}{" "}
													today
												</span>
											</div>

											{/* Assign Visit Button */}
											<button
												onClick={(
													e
												) => {
													e.stopPropagation();
													navigate(
														`/dispatch/technicians/${tech.id}/assign`
													);
												}}
												className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-all hover:shadow-lg hover:shadow-blue-600/20"
											>
												<MapPin
													size={
														14
													}
												/>
												<span>
													Assign
													Visit
												</span>
											</button>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</Card>

				<Card title="Pending Actions">
					<div className="space-y-3">
						<div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
							<div>
								<p className="text-sm font-medium text-white">
									Requests
								</p>
							</div>
						</div>
						<div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
							<div>
								<p className="text-sm font-medium text-white">
									Quotes
								</p>
							</div>
						</div>

						<div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
							<div>
								<p className="text-sm font-medium text-white">
									Unscheduled Jobs
								</p>
								<p className="text-xs text-zinc-400">
									{
										jobs.filter(
											(j) =>
												j.status ===
												"Unscheduled"
										).length
									}{" "}
									need scheduling
								</p>
							</div>
							<button
								onClick={() =>
									navigate("/dispatch/jobs")
								}
								className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
							>
								View
							</button>
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
}
