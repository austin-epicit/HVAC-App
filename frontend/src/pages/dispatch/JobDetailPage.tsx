import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Edit2, User, Calendar, MapPin, Clock, Users, TrendingUp, Map } from "lucide-react";
import { useJobByIdQuery } from "../../hooks/useJobs";
import JobNoteManager from "../../components/jobs/JobNoteManager";
import Card from "../../components/ui/Card";
import EditJob from "../../components/jobs/EditJob";
import { useState } from "react";

export default function JobDetailPage() {
	const { jobId } = useParams<{ jobId: string }>();
	const navigate = useNavigate();
	const { data: job, isLoading } = useJobByIdQuery(jobId!);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

	const formatScheduleType = (type: string) => {
		switch (type) {
			case "all_day":
				return "All Day";
			case "exact":
				return "Exact Time";
			case "window":
				return "Time Window";
			default:
				return type;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "Completed":
				return "bg-green-500/20 text-green-400 border-green-500/30";
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

	return (
		<div className="text-white space-y-6">
			{/* Header */}
			<div className="grid grid-cols-3 items-center gap-4 mb-6">
				<Link
					to="/dispatch/jobs"
					className="justify-self-start flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
				>
					<ChevronLeft size={20} />
					<span>Back to Jobs</span>
				</Link>

				<h1 className="text-3xl font-bold text-white text-center">{job.name}</h1>

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
								onClick={() => setIsEditModalOpen(true)}
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
								<h3 className="text-zinc-400 text-sm mb-1">Description</h3>
								<p className="text-white break-words">{job.description || "No description provided"}</p>
							</div>

							<div>
								<h3 className="text-zinc-400 text-sm mb-1 flex items-center gap-2">
									<MapPin size={14} />
									Address
								</h3>
								<p className="text-white break-words">{job.address}</p>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<h3 className="text-zinc-400 text-sm mb-1 flex items-center gap-2">
										<Calendar size={14} />
										Start Date
									</h3>
									<p className="text-white">
										{new Date(job.start_date).toLocaleDateString("en-US", {
											year: "numeric",
											month: "short",
											day: "numeric",
										})}
									</p>
								</div>
								<div>
									<h3 className="text-zinc-400 text-sm mb-1 flex items-center gap-2">
										<Clock size={14} />
										Schedule Type
									</h3>
									<p className="text-white">{formatScheduleType(job.schedule_type)}</p>
								</div>
							</div>

							{job.duration && (
								<div>
									<h3 className="text-zinc-400 text-sm mb-1">Duration</h3>
									<p className="text-white">{job.duration} minutes</p>
								</div>
							)}

							{job.window_end && (
								<div>
									<h3 className="text-zinc-400 text-sm mb-1">Window End</h3>
									<p className="text-white">
										{new Date(job.window_end).toLocaleDateString("en-US", {
											year: "numeric",
											month: "short",
											day: "numeric",
										})}
									</p>
								</div>
							)}
						</div>
					</Card>
				</div>

				{/* Client Details - 1/3 width */}
				<div className="lg:col-span-1">
					<Card title="Client Details" className="h-full">
						<div className="space-y-4">
							<div>
								<h3 className="text-zinc-400 text-sm mb-2 flex items-center gap-2">
									<User size={14} />
									Client Name
								</h3>
								<p>
									{job.client?.name || "Unknown Client"}
								</p>
							</div>

							<div>
								<h3 className="text-zinc-400 text-sm mb-1">Address</h3>
								<p className="text-white text-sm break-words">
									{job.client?.address || "No address available"}
								</p>
							</div>

							<div>
								<h3 className="text-zinc-400 text-sm mb-2">Status</h3>
								{job.client?.is_active !== undefined && (
									<span
										className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
											job.client.is_active
												? "bg-green-500/20 text-green-400 border border-green-500/30"
												: "bg-red-500/20 text-red-400 border border-red-500/30"
										}`}
									>
										{job.client.is_active ? "Active Client" : "Inactive Client"}
									</span>
								)}
							</div>

							<button
								onClick={() => navigate(`/dispatch/clients/${job.client_id}`)}
								className="w-full mt-4 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-md text-sm font-medium transition-colors"
							>
								View Full Client Profile
							</button>
						</div>
					</Card>
				</div>
			</div>

			{/* Status Timeline - Full Width */}
			<Card title="Status Timeline" className="h-fit">
				<div className="py-8">
					<div className="max-w-4xl mx-auto">
						<div className="flex items-center justify-center mb-6">
							<TrendingUp size={48} className="text-zinc-600" />
						</div>
						<h3 className="text-zinc-400 text-lg font-medium mb-2 text-center">Job Timeline</h3>
						<p className="text-zinc-500 text-sm text-center max-w-2xl mx-auto mb-6">
							Track status changes and key milestones throughout the job lifecycle.
						</p>
						<div className="flex items-center justify-center gap-8 mt-8">
							<div className="flex items-center gap-3">
								<div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></div>
								<div>
									<p className="text-zinc-400 text-xs">Current Status</p>
									<p className="text-white text-sm font-medium">{job.status}</p>
								</div>
							</div>
							<div className="flex items-center gap-3 opacity-50">
								<div className="w-3 h-3 rounded-full bg-zinc-600 flex-shrink-0"></div>
								<div>
									<p className="text-zinc-500 text-xs">Timeline tracking coming soon</p>
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
						<button
							disabled
							className="flex items-center gap-2 px-3 py-2 bg-zinc-700 text-zinc-400 rounded-md text-sm font-medium cursor-not-allowed"
						>
							<Users size={14} />
							Assign
						</button>
					}
					className="h-fit"
				>
					<div className="text-center py-12">
						<Users size={48} className="mx-auto text-zinc-600 mb-3" />
						<h3 className="text-zinc-400 text-lg font-medium mb-2">Technician Assignment</h3>
						<p className="text-zinc-500 text-sm max-w-sm mx-auto">
							Technician management will be available soon. Assign and track technicians for this
							job.
						</p>
						<div className="mt-4 px-4 py-2 bg-zinc-800 rounded-md inline-block">
							<p className="text-xs text-zinc-400">
								Tech IDs: {job.tech_ids?.length > 0 ? job.tech_ids.join(", ") : "None assigned"}
							</p>
						</div>
					</div>
				</Card>

				<Card title="Technician Location" className="h-fit">
					<div className="text-center py-12">
						<Map size={48} className="mx-auto text-zinc-600 mb-3" />
						<h3 className="text-zinc-400 text-lg font-medium mb-2">GPS Tracking</h3>
						<p className="text-zinc-500 text-sm max-w-sm mx-auto mb-4">
							Real-time GPS tracking will display technician locations on an interactive map.
						</p>
						<div className="flex items-center justify-center gap-2 text-xs text-zinc-500 mt-4">
							<MapPin size={14} />
							<span>Live GPS tracking coming soon</span>
						</div>
						<div className="mt-4 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
							<p className="text-xs text-zinc-400">
								Job Address: <span className="text-white">{job.address}</span>
							</p>
						</div>
					</div>
				</Card>
			</div>

			{/* Job Notes - Full Width at Bottom */}
			<JobNoteManager jobId={jobId!} />

			<EditJob
				isModalOpen={isEditModalOpen}
				setIsModalOpen={setIsEditModalOpen}
				job={job}
			/>
		</div>
	);
}