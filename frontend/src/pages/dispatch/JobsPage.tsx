import AdaptableTable from "../../components/AdaptableTable";
import { useAllJobsQuery, useCreateJobMutation } from "../../hooks/useJobs";
import { useClientByIdQuery } from "../../hooks/useClients";
import { JobStatusValues } from "../../types/jobs";
import { useState, useMemo, useEffect } from "react";
import { Search, Plus, MoreHorizontal, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import CreateJob from "../../components/jobs/CreateJob";
import { addSpacesToCamelCase } from "../../util/util";

export default function JobsPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const { data: jobs, isLoading: isFetchLoading, error: fetchError } = useAllJobsQuery();
	const { mutateAsync: createJob } = useCreateJobMutation();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [searchInput, setSearchInput] = useState("");

	const queryParams = new URLSearchParams(location.search);
	const clientFilter = queryParams.get("client");
	const searchFilter = queryParams.get("search");

	const { data: filterClient } = useClientByIdQuery(clientFilter);

	useEffect(() => {
		setSearchInput(searchFilter || "");
	}, [searchFilter]);

	const display = useMemo(() => {
		if (!jobs) return [];

		const activeSearch = searchInput || searchFilter;

		let filtered = jobs;

		if (clientFilter) {
			filtered = jobs.filter((j) => j.client_id === clientFilter);
		}

		if (activeSearch) {
			filtered = filtered.filter((j) => {
				const searchLower = activeSearch.toLowerCase();
				const clientName = j.client?.name?.toLowerCase() || "";
				const jobName = j.name?.toLowerCase() || "";
				const status = j.status?.toLowerCase() || "";
				const address = j.address?.toLowerCase() || "";

				return (
					jobName.includes(searchLower) ||
					clientName.includes(searchLower) ||
					status.includes(searchLower) ||
					address.includes(searchLower)
				);
			});
		}

		return filtered
			.map((j) => {
				const scheduledVisits = (j.visits || [])
					.filter((v) => v.status === "Scheduled")
					.sort(
						(a, b) =>
							new Date(a.scheduled_start_at).getTime() -
							new Date(b.scheduled_start_at).getTime()
					);

				const nextVisit = scheduledVisits[0];

				// Get assigned technicians from next visit
				const techNames =
					nextVisit?.visit_techs
						?.map((vt) => vt.tech.name)
						.join(", ") || "Unassigned";

				return {
					id: j.id,
					name: j.name,
					technicians: techNames,
					client: j.client?.name || "Unknown Client",
					nextVisit: nextVisit
						? new Date(
								nextVisit.scheduled_start_at
							).toLocaleDateString("en-US", {
								month: "short",
								day: "numeric",
								year: "numeric",
							})
						: "No visits scheduled",
					visits: `${j.visits?.length || 0} visit${(j.visits?.length || 0) !== 1 ? "s" : ""}`,
					status: addSpacesToCamelCase(j.status),
					_rawStatus: j.status, // Keep raw status for sorting
				};
			})
			.sort(
				(a, b) =>
					JobStatusValues.indexOf(a._rawStatus) -
					JobStatusValues.indexOf(b._rawStatus)
			)
			.map(({ _rawStatus, ...rest }) => rest); // Remove _rawStatus from display
	}, [jobs, searchInput, searchFilter, clientFilter]);

	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const newParams = new URLSearchParams(location.search);

		if (searchInput.trim()) {
			newParams.set("search", searchInput.trim());
		} else {
			newParams.delete("search");
		}

		navigate(`/dispatch/jobs?${newParams.toString()}`);
	};

	const removeFilter = (filterType: "client" | "search") => {
		const newParams = new URLSearchParams(location.search);
		newParams.delete(filterType);

		if (filterType === "search") {
			setSearchInput("");
		}

		navigate(`/dispatch/jobs${newParams.toString() ? `?${newParams.toString()}` : ""}`);
	};

	const clearAllFilters = () => {
		setSearchInput("");
		navigate("/dispatch/jobs");
	};

	const hasFilters = clientFilter || searchFilter;

	return (
		<div className="text-white">
			<div className="flex flex-wrap items-center justify-between gap-4 mb-2">
				<h2 className="text-2xl font-semibold">Jobs</h2>

				<div className="flex gap-2 text-nowrap">
					<form
						onSubmit={handleSearchSubmit}
						className="relative w-full"
					>
						<Search
							size={18}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
						/>
						<input
							type="text"
							placeholder="Search jobs..."
							value={searchInput}
							onChange={(e) =>
								setSearchInput(e.target.value)
							}
							className="w-full pl-11 pr-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm 
							text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 
							focus:ring-blue-500"
						/>
					</form>

					<button
						className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors"
						onClick={() => setIsModalOpen(true)}
					>
						<Plus size={16} className="text-white" />
						New Job
					</button>

					<button className="flex items-center justify-center w-10 h-10 bg-zinc-700 hover:bg-zinc-600 rounded-md transition-colors">
						<MoreHorizontal size={20} className="text-white" />
					</button>
				</div>
			</div>

			{/* Single Filter Bar with Multiple Filters */}
			{hasFilters && (
				<div className="mb-2 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 flex-wrap">
							<span className="text-sm text-zinc-400">
								Active filters:
							</span>

							{/* Client Filter Chip */}
							{clientFilter && filterClient && (
								<div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 rounded-md">
									<span className="text-sm text-blue-300">
										Client:{" "}
										<span className="font-medium text-white">
											{
												filterClient.name
											}
										</span>
									</span>
									<button
										onClick={() =>
											removeFilter(
												"client"
											)
										}
										className="text-blue-300 hover:text-white transition-colors"
										aria-label="Remove client filter"
									>
										<X size={14} />
									</button>
								</div>
							)}

							{/* Search Filter Chip */}
							{searchFilter && (
								<div className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 border border-purple-500/30 rounded-md">
									<span className="text-sm text-purple-300">
										Search:{" "}
										<span className="font-medium text-white">
											"
											{
												searchFilter
											}
											"
										</span>
									</span>
									<button
										onClick={() =>
											removeFilter(
												"search"
											)
										}
										className="text-purple-300 hover:text-white transition-colors"
										aria-label="Remove search filter"
									>
										<X size={14} />
									</button>
								</div>
							)}

							{/* Results Count */}
							<span className="text-sm text-zinc-500">
								• {display.length}{" "}
								{display.length === 1
									? "result"
									: "results"}
							</span>
						</div>

						{/* Clear All Button */}
						<button
							onClick={clearAllFilters}
							className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-zinc-700/50 rounded-md transition-colors"
						>
							Clear All
							<X size={14} />
						</button>
					</div>
				</div>
			)}

			<div className="shadow-sm border border-zinc-800 p-3 bg-zinc-900 rounded-lg overflow-hidden text-left">
				<AdaptableTable
					data={display}
					loadListener={isFetchLoading}
					errListener={fetchError}
					onRowClick={(row) => navigate(`/dispatch/jobs/${row.id}`)}
				/>
			</div>

			<CreateJob
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				createJob={async (input) => {
					const newJob = await createJob(input);

					if (!newJob?.id)
						throw new Error(
							"Job creation failed: no ID returned"
						);

					return newJob.id;
				}}
			/>
		</div>
	);
}
