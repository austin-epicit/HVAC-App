import AdaptableTable from "../../components/AdaptableTable";
import { useNavigate } from "react-router-dom";
import { useAllJobsQuery, useCreateJobMutation } from "../../hooks/useJobs";
import { JobStatusValues } from "../../types/jobs";
import { useState, useMemo } from "react";
import { Search, Plus, Share, Eye } from "lucide-react";
import CreateJob from "../../components/jobs/CreateJob";

export default function JobsPage() {
	const navigate = useNavigate();
	const { data: jobs, isLoading: isFetchLoading, error: fetchError } = useAllJobsQuery();
	const { mutateAsync: createJob } = useCreateJobMutation();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [search, setSearch] = useState("");

	// --- Filter + map + sort ---
	const display = useMemo(() => {
		if (!jobs) return [];

		const filtered = jobs.filter((j) => {
			const term = search.toLowerCase();
			return (
				j.name.toLowerCase().includes(term) ||
				j.client?.name?.toLowerCase().includes(term) ||
				j.status.toLowerCase().includes(term)
			);
		});

		return filtered
			.map((j) => ({
				id: j.id,
				name: j.name,
				technicians: Array.isArray(j.tech_ids) ? j.tech_ids.join(", ") : j.tech_ids,
				client: j.client?.name || "Unknown Client",
				date: new Date(j.start_date).toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
					year: "numeric",
				}),
				status: j.status,
			}))
			.sort(
				(a, b) =>
					JobStatusValues.indexOf(a.status) -
					JobStatusValues.indexOf(b.status)
			);
	}, [jobs, search]);

	return (
		<div className="text-white">
			<div className="flex flex-wrap items-center justify-between gap-4 mb-2">
				<h2 className="text-2xl font-semibold">Jobs</h2>

				<div className="flex gap-2 text-nowrap">
					<div className="relative w-full min-w-[250px]">
						<Search
							size={18}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
						/>
						<input
							type="text"
							placeholder="Search jobs..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full pl-11 pr-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm 
							text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 
							focus:ring-blue-500"
						/>
					</div>

					<button
						className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors"
						onClick={() => setIsModalOpen(true)}
					>
						<Plus size={16} className="text-white" />
						New Job
					</button>

					<button className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-md text-sm font-medium transition-colors">
						<Share size={16} className="text-white" />
						Export Jobs
					</button>
				</div>
			</div>

			<div className="shadow-sm border border-zinc-800 p-3 bg-zinc-900 rounded-lg overflow-hidden text-left">
				<AdaptableTable
					data={display}
					loadListener={isFetchLoading}
					errListener={fetchError}
					actionColumn={{
						header: "Actions",
						cell: (row) => (
							<button
								onClick={(e) => {
									e.stopPropagation();
									navigate(`/dispatch/jobs/${row.id}`);
								}}
								className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-md text-xs font-medium transition-colors"
							>
								<Eye size={14} />
								View Details
							</button>
						)
					}}
				/>
			</div>

			<CreateJob
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				createJob={async (input) => {
					const newJob = await createJob(input);

					if (!newJob?.id)
						throw new Error("Job creation failed: no ID returned");

					return newJob.id;
				}}
			/>
		</div>
	);
}
