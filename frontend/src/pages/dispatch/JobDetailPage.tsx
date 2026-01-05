import { useParams, useNavigate } from "react-router-dom";
import {
	ChevronLeft,
	Edit2,
	User,
	Calendar,
	MapPin,
	Clock,
	Users,
	TrendingUp,
	Map,
	Plus,
	Mail,
	Phone,
} from "lucide-react";
import {
	useJobByIdQuery,
	useJobVisitsByJobIdQuery,
	useCreateJobVisitMutation,
} from "../../hooks/useJobs";
import JobNoteManager from "../../components/jobs/JobNoteManager";
import Card from "../../components/ui/Card";
import EditJob from "../../components/jobs/EditJob";
import CreateJobVisit from "../../components/jobs/CreateJobVisit";
import EditJobVisit from "../../components/jobs/EditJobVisit";
import { useState } from "react";

export default function JobDetailPage() {
	const { jobId } = useParams<{ jobId: string }>();
	const navigate = useNavigate();
	const { data: job, isLoading } = useJobByIdQuery(jobId!);
	const { data: visits = [] } = useJobVisitsByJobIdQuery(jobId!);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isCreateVisitModalOpen, setIsCreateVisitModalOpen] = useState(false);
	const [editingVisitId, setEditingVisitId] = useState<string | null>(null);
	const { mutateAsync: createJobVisitMutation } = useCreateJobVisitMutation();

	const editingVisit = visits.find((v) => v.id === editingVisitId);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-white text-lg">Loading job details...</div>
			</div>
		);
	}

	if (!job) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-white text-lg">Job not found</div>
			</div>
		);
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case "Completed":
				return "bg-green-500/20 text-green-400 border-green-500/30";
			case "InProgress":
				return "bg-blue-500/20 text-blue-400 border-blue-500/30";
			case "In Progress":
				return "bg-blue-500/20 text-blue-400 border-blue-500/30";
			case "Scheduled":
				return "bg-purple-500/20 text-purple-400 border-purple-500/30";
			case "Cancelled":
				return "bg-red-500/20 text-red-400 border-red-500/30";
			case "Unscheduled":
				return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
			default:
				return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
		}
	};

	const getVisitStatusColor = (status: string) => {
		switch (status) {
			case "Scheduled":
				return "text-blue-400";
			case "InProgress":
				return "text-amber-400";
			case "Completed":
				return "text-green-400";
			case "Cancelled":
				return "text-red-400";
			default:
				return "text-gray-400";
		}
	};

	const getPriorityColor = (priority: string) => {
		switch (priority?.toLowerCase()) {
			case "high":
				return "text-red-400";
			case "medium":
				return "text-amber-400";
			case "low":
				return "text-green-400";
			case "normal":
			default:
				return "text-blue-400";
		}
	};

	const formatDateTime = (date: Date | string) => {
		const d = typeof date === "string" ? new Date(date) : date;
		return (
			d.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
			}) +
			" at " +
			d.toLocaleTimeString("en-US", {
				hour: "numeric",
				minute: "2-digit",
			})
		);
	};

	const formatTime = (date: Date | string) => {
		const d = typeof date === "string" ? new Date(date) : date;
		return d.toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
		});
	};

	const formatDateTimeRange = (visit: any) => {
		const start = new Date(visit.scheduled_start_at);
		const end = new Date(visit.scheduled_end_at);

		if (visit.schedule_type === "all_day") {
			return "All Day";
		} else if (
			visit.schedule_type === "window" &&
			visit.arrival_window_start &&
			visit.arrival_window_end
		) {
			return `${formatTime(visit.arrival_window_start)} - ${formatTime(visit.arrival_window_end)} (window)`;
		} else {
			return `${formatTime(start)} - ${formatTime(end)}`;
		}
	};

	const primaryContact = job.client?.contacts?.find((cc: any) => cc.is_primary)?.contact;

	const sortedVisits = [...visits].sort(
		(a, b) =>
			new Date(a.scheduled_start_at).getTime() -
			new Date(b.scheduled_start_at).getTime()
	);

	return (
		<div className="text-white space-y-6">
			{/* Header */}
			<div className="grid grid-cols-2 gap-4 mb-6 items-center">
				<h1 className="text-3xl font-bold text-white">{job.name}</h1>

				<span
					className={`justify-self-end inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(
						job.status
					)}`}
				>
					{job.status}
				</span>
			</div>

			{/* Job Information (2/3) and Client Details (1/3) */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Job Information - 2/3 width */}
				<div className="lg:col-span-2">
					<Card
						title="Job Information"
						headerAction={
							<button
								onClick={() =>
									setIsEditModalOpen(true)
								}
								className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors"
							>
								<Edit2 size={14} />
								Edit
							</button>
						}
						className="h-full"
					>
						<div className="space-y-4">
							<div>
								<h3 className="text-zinc-400 text-sm mb-1">
									Description
								</h3>
								<p className="text-white break-words">
									{job.description ||
										"No description provided"}
								</p>
							</div>

							<div>
								<h3 className="text-zinc-400 text-sm mb-1 flex items-center gap-2">
									<MapPin size={14} />
									Address
								</h3>
								<p className="text-white break-words">
									{job.address}
								</p>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<h3 className="text-zinc-400 text-sm mb-1 flex items-center gap-2">
										<TrendingUp
											size={14}
										/>
										Priority
									</h3>
									<p
										className={`font-medium capitalize ${getPriorityColor(job.priority)}`}
									>
										{job.priority ||
											"normal"}
									</p>
								</div>
								<div>
									<h3 className="text-zinc-400 text-sm mb-1 flex items-center gap-2">
										<Calendar
											size={14}
										/>
										Created
									</h3>
									<p className="text-white">
										{new Date(
											job.created_at
										).toLocaleDateString(
											"en-US",
											{
												year: "numeric",
												month: "short",
												day: "numeric",
											}
										)}
									</p>
								</div>
							</div>
						</div>
					</Card>
				</div>

				{/* Client Details - 1/3 width */}
				<div className="lg:col-span-1">
					<Card
						title="Client Details"
						headerAction={
							job.client?.is_active !== undefined && (
								<span
									className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
										job.client.is_active
											? "bg-green-500/20 text-green-400 border-green-500/30"
											: "bg-red-500/20 text-red-400 border-red-500/30"
									}`}
								>
									{job.client.is_active
										? "Active"
										: "Inactive"}
								</span>
							)
						}
						className="h-full"
					>
						<div className="space-y-4">
							<div>
								<h3 className="text-zinc-400 text-sm mb-2 flex items-center gap-2">
									<User size={14} />
									Client Name
								</h3>
								<p>
									{job.client?.name ||
										"Unknown Client"}
								</p>
							</div>

							<div>
								<h3 className="text-zinc-400 text-sm mb-1">
									Address
								</h3>
								<p className="text-white text-sm break-words">
									{job.client?.address ||
										"No address available"}
								</p>
							</div>

							{/* Primary Contact within Client Card */}
							{primaryContact && (
								<div className="pt-4 border-t border-zinc-700">
									<div className="flex items-center justify-between mb-3">
										<h3 className="text-zinc-400 text-sm">
											Primary
											Contact
										</h3>
										{primaryContact.title && (
											<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
												{
													primaryContact.title
												}
											</span>
										)}
									</div>
									<div className="space-y-2">
										<p className="text-white font-medium">
											{
												primaryContact.name
											}
										</p>

										{primaryContact.email && (
											<div className="flex items-center gap-2 text-sm">
												<Mail
													size={
														14
													}
													className="text-zinc-400 flex-shrink-0"
												/>
												<a className="text-white truncate">
													{
														primaryContact.email
													}
												</a>
											</div>
										)}

										{primaryContact.phone && (
											<div className="flex items-center gap-2 text-sm">
												<Phone
													size={
														14
													}
													className="text-zinc-400 flex-shrink-0"
												/>
												<a className="text-white">
													{
														primaryContact.phone
													}
												</a>
											</div>
										)}
									</div>
								</div>
							)}

							<button
								onClick={() =>
									navigate(
										`/dispatch/clients/${job.client_id}`
									)
								}
								className="w-full mt-4 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-md text-sm font-medium transition-colors"
							>
								View Full Client Profile
							</button>
						</div>
					</Card>
				</div>
			</div>

			{/* Scheduled Visits - Full Width */}
			<Card
				title="Scheduled Visits"
				headerAction={
					visits.length > 0 ? (
						<button
							onClick={() =>
								setIsCreateVisitModalOpen(true)
							}
							className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors"
						>
							<Plus size={16} />
							Create Visit
						</button>
					) : undefined
				}
			>
				{visits.length === 0 ? (
					<div className="text-center py-12">
						<Calendar
							size={48}
							className="mx-auto mb-3 opacity-50 text-zinc-600"
						/>
						<p className="text-lg font-medium mb-2 text-zinc-400">
							No visits scheduled
						</p>
						<p className="text-sm text-zinc-500 mb-4">
							Create a visit to schedule this job
						</p>
						<button
							onClick={() =>
								setIsCreateVisitModalOpen(true)
							}
							className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors"
						>
							<Plus size={16} />
							Create First Visit
						</button>
					</div>
				) : (
					<div className="space-y-3">
						{sortedVisits.map((visit) => (
							<div
								key={visit.id}
								className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 hover:border-zinc-600 transition-colors"
							>
								<div className="flex items-start justify-between mb-3">
									<div className="flex items-center gap-3">
										<div
											className={`font-medium ${getVisitStatusColor(visit.status)}`}
										>
											{
												visit.status
											}
										</div>
										<span className="text-gray-500">
											•
										</span>
										<span className="text-sm text-gray-400 capitalize">
											{visit.schedule_type.replace(
												"_",
												" "
											)}
										</span>
									</div>
									<button
										onClick={() =>
											setEditingVisitId(
												visit.id
											)
										}
										className="text-gray-400 hover:text-white transition-colors"
									>
										<Edit2 size={16} />
									</button>
								</div>

								<div className="space-y-2">
									{/* Date & Time */}
									<div className="flex items-center gap-2 text-sm">
										<Clock
											size={16}
											className="text-gray-400"
										/>
										{visit.schedule_type ===
										"all_day" ? (
											<span className="text-gray-300">
												{
													formatDateTime(
														visit.scheduled_start_at
													).split(
														" at "
													)[0]
												}{" "}
												-
												All
												Day
											</span>
										) : visit.schedule_type ===
												"window" &&
										  visit.arrival_window_start &&
										  visit.arrival_window_end ? (
											<span className="text-gray-300">
												{
													formatDateTime(
														visit.scheduled_start_at
													).split(
														" at "
													)[0]
												}{" "}
												•
												Window:{" "}
												{formatTime(
													visit.arrival_window_start
												)}{" "}
												-{" "}
												{formatTime(
													visit.arrival_window_end
												)}
											</span>
										) : (
											<span className="text-gray-300">
												{formatDateTime(
													visit.scheduled_start_at
												)}{" "}
												-{" "}
												{formatTime(
													visit.scheduled_end_at
												)}
											</span>
										)}
									</div>

									{/* Technicians */}
									{visit.visit_techs &&
										visit.visit_techs
											.length >
											0 && (
											<div className="flex items-center gap-2 text-sm">
												<Users
													size={
														16
													}
													className="text-gray-400"
												/>
												<span className="text-gray-300">
													{visit.visit_techs
														.map(
															(
																vt: any
															) =>
																vt
																	.tech
																	.name
														)
														.join(
															", "
														)}
												</span>
											</div>
										)}

									{/* Actual Times (if completed) */}
									{visit.actual_start_at &&
										visit.actual_end_at && (
											<div className="mt-2 pt-2 border-t border-zinc-700 text-xs text-gray-400">
												Actual:{" "}
												{formatTime(
													visit.actual_start_at
												)}{" "}
												-{" "}
												{formatTime(
													visit.actual_end_at
												)}
											</div>
										)}
								</div>
							</div>
						))}
					</div>
				)}
			</Card>

			{/* Status Timeline - Full Width */}
			<Card title="Status Timeline" className="h-fit">
				<div className="py-8">
					<div className="max-w-4xl mx-auto">
						<div className="flex items-center justify-center mb-6">
							<TrendingUp
								size={48}
								className="text-zinc-600"
							/>
						</div>
						<h3 className="text-zinc-400 text-lg font-medium mb-2 text-center">
							Job Timeline
						</h3>
						<p className="text-zinc-500 text-sm text-center max-w-2xl mx-auto mb-6">
							Track status changes and key milestones
							throughout the job lifecycle.
						</p>
						<div className="flex items-center justify-center gap-8 mt-8">
							<div className="flex items-center gap-3">
								<div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></div>
								<div>
									<p className="text-zinc-400 text-xs">
										Current Status
									</p>
									<p className="text-white text-sm font-medium">
										{job.status}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0"></div>
								<div>
									<p className="text-zinc-400 text-xs">
										Total Visits
									</p>
									<p className="text-white text-sm font-medium">
										{visits.length}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-3 opacity-50">
								<div className="w-3 h-3 rounded-full bg-zinc-600 flex-shrink-0"></div>
								<div>
									<p className="text-zinc-500 text-xs">
										Detailed timeline
										coming soon
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Card>

			{/* Assigned Technicians and Technician Location - Two Column */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card
					title="Assigned Technicians"
					headerAction={
						visits.length > 0 &&
						visits.some(
							(v) =>
								v.visit_techs &&
								v.visit_techs.length > 0
						) ? (
							<span className="text-sm text-zinc-400">
								{visits.reduce(
									(acc, v) =>
										acc +
										(v.visit_techs
											?.length ||
											0),
									0
								)}{" "}
								assignments
							</span>
						) : undefined
					}
				>
					{visits.length === 0 ? (
						<div className="flex items-center justify-center min-h-[300px]">
							<div className="text-center">
								<Users
									size={48}
									className="mx-auto text-zinc-600 mb-3"
								/>
								<h3 className="text-zinc-400 text-lg font-medium mb-2">
									No Visits Created
								</h3>
								<p className="text-zinc-500 text-sm max-w-sm mx-auto">
									Create a visit to assign
									technicians to this job.
								</p>
							</div>
						</div>
					) : visits.every(
							(v) =>
								!v.visit_techs ||
								v.visit_techs.length === 0
					  ) ? (
						<div className="text-center py-12">
							<Users
								size={48}
								className="mx-auto text-zinc-600 mb-3"
							/>
							<h3 className="text-zinc-400 text-lg font-medium mb-2">
								No Technicians Assigned
							</h3>
							<p className="text-zinc-500 text-sm max-w-sm mx-auto">
								Edit a visit to assign technicians
								to the job.
							</p>
						</div>
					) : (
						<div className="space-y-3">
							{sortedVisits
								.filter(
									(visit) =>
										visit.visit_techs &&
										visit.visit_techs
											.length > 0
								)
								.map((visit) => (
									<div
										key={visit.id}
										className="space-y-2"
									>
										{/* Visit Header */}
										<div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
											<Calendar
												size={
													12
												}
											/>
											<span>
												{
													formatDateTime(
														visit.scheduled_start_at
													).split(
														" at "
													)[0]
												}{" "}
												•{" "}
												{formatTime(
													visit.scheduled_start_at
												)}{" "}
												-{" "}
												{formatTime(
													visit.scheduled_end_at
												)}
											</span>
											<span
												className={`ml-auto px-2 py-0.5 rounded ${
													visit.status ===
													"Scheduled"
														? "bg-blue-500/20 text-blue-400"
														: visit.status ===
															  "InProgress"
															? "bg-amber-500/20 text-amber-400"
															: visit.status ===
																  "Completed"
																? "bg-green-500/20 text-green-400"
																: "bg-zinc-500/20 text-zinc-400"
												}`}
											>
												{
													visit.status
												}
											</span>
										</div>

										{/* Technician Cards */}
										{visit.visit_techs.map(
											(vt) => (
												<button
													key={
														vt.tech_id
													}
													onClick={() =>
														navigate(
															`/dispatch/technicians/${vt.tech_id}`
														)
													}
													className="w-full bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 hover:border-zinc-600 rounded-lg p-3 transition-all cursor-pointer text-left group"
												>
													<div className="flex items-center gap-3">
														{/* Profile Picture / Avatar */}
														<div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm">
															{vt.tech.name
																.split(
																	" "
																)
																.map(
																	(
																		n
																	) =>
																		n[0]
																)
																.join(
																	""
																)
																.toUpperCase()
																.slice(
																	0,
																	2
																)}
														</div>

														{/* Tech Info */}
														<div className="flex-1 min-w-0">
															<div className="flex items-center gap-2 mb-1">
																<h4 className="text-white font-medium text-sm truncate group-hover:text-blue-400 transition-colors">
																	{
																		vt
																			.tech
																			.name
																	}
																</h4>
															</div>
															<div className="flex items-center gap-2 text-xs text-zinc-400">
																<span className="truncate">
																	{
																		vt
																			.tech
																			.title
																	}
																</span>
																{vt
																	.tech
																	.phone && (
																	<>
																		<span>
																			•
																		</span>
																		<span className="truncate">
																			{
																				vt
																					.tech
																					.phone
																			}
																		</span>
																	</>
																)}
															</div>
														</div>

														{/* Status Badge */}
														<div className="flex items-center gap-2 flex-shrink-0">
															<span
																className={`px-2 py-1 rounded text-xs font-medium ${
																	vt
																		.tech
																		.status ===
																	"Available"
																		? "bg-green-500/20 text-green-400 border border-green-500/30"
																		: vt
																					.tech
																					.status ===
																			  "Busy"
																			? "bg-red-500/20 text-red-400 border border-red-500/30"
																			: vt
																						.tech
																						.status ===
																				  "Offline"
																				? "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30"
																				: "bg-blue-500/20 text-blue-400 border border-blue-500/30"
																}`}
															>
																{
																	vt
																		.tech
																		.status
																}
															</span>
															<ChevronLeft
																size={
																	16
																}
																className="text-zinc-400 rotate-180 group-hover:translate-x-1 transition-transform"
															/>
														</div>
													</div>
												</button>
											)
										)}
									</div>
								))}
						</div>
					)}
				</Card>

				<Card title="Technician Location" className="h-fit">
					<div className="text-center py-12">
						<Map
							size={48}
							className="mx-auto text-zinc-600 mb-3"
						/>
						<h3 className="text-zinc-400 text-lg font-medium mb-2">
							GPS Tracking
						</h3>
						<p className="text-zinc-500 text-sm max-w-sm mx-auto mb-4">
							Real-time GPS tracking will display
							technician locations on an interactive map.
						</p>
						<div className="flex items-center justify-center gap-2 text-xs text-zinc-500 mt-4">
							<MapPin size={14} />
							<span>Live GPS tracking coming soon</span>
						</div>
						<div className="mt-4 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
							<p className="text-xs text-zinc-400">
								Job Address:{" "}
								<span className="text-white">
									{job.address}
								</span>
							</p>
						</div>
					</div>
				</Card>
			</div>

			{/* Job Notes - Full Width at Bottom */}
			<JobNoteManager jobId={jobId!} visits={visits} />

			{job && (
				<EditJob
					isModalOpen={isEditModalOpen}
					setIsModalOpen={setIsEditModalOpen}
					job={job}
				/>
			)}

			<CreateJobVisit
				isModalOpen={isCreateVisitModalOpen}
				setIsModalOpen={setIsCreateVisitModalOpen}
				jobId={jobId!}
				createVisit={createJobVisitMutation}
			/>

			{editingVisitId && editingVisit && (
				<EditJobVisit
					isModalOpen={true}
					setIsModalOpen={(open) => !open && setEditingVisitId(null)}
					visit={editingVisit}
					jobId={jobId!}
				/>
			)}
		</div>
	);
}
