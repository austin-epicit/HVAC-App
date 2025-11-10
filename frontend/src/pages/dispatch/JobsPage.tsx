import AdaptableTable from "../../components/AdaptableTable";
import { useAllJobsQuery, useCreateJobMutation } from "../../hooks/useJobs";
import { JobStatusValues } from "../../types/jobs";
import { useState } from "react";
import { Search, Plus, Share } from "lucide-react";
// import CreateJob from "../../components/jobs/CreateJob";

export default function JobsPage() {
	const { data: jobs, isLoading: isFetchLoading, error: fetchError } = useAllJobsQuery();
	const { mutateAsync: createJob } = useCreateJobMutation();
	const [search, setSearch] = useState("");
	// const [isModalOpen, setIsModalOpen] = useState(false);
	const display = jobs
		?.map((j) => ({
			name: j.name,
			technicians: j.tech_ids,
			client: j.client_id,
			status: j.status,
		}))
		.sort(
			(a, b) =>
				JobStatusValues.indexOf(a.status) -
				JobStatusValues.indexOf(b.status)
		);

	return (
		<div className="text-white">
			<div className="flex flex-wrap items-center justify-between gap-4 mb-2">
				<h2 className="text-2xl font-semibold">Jobs</h2>

				<div className="flex gap-2 text-nowrap">
					<div className="relative w-full">
						<Search
							size={18}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
						/>
						<input
							type="text"
							placeholder="Search jobs..."
							className="w-full pl-11 pr-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm 
							text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 
							focus:ring-blue-500"
						/>
					</div>

					<button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium">
						<Plus size={16} className="text-white" />
						New Job
					</button>

					<button className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-md text-sm font-medium">
						<Share size={16} className="text-white" />
						Export Jobs
					</button>
				</div>
			</div>

			<div className="shadow-sm border border-zinc-800 p-3 bg-zinc-900 rounded-lg overflow-hidden text-left">
				<AdaptableTable
					data={display || []}
					loadListener={isFetchLoading}
					errListener={fetchError}
				/>
			</div>

			{/* <CreateJob
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				createJob={async (label, dataDuration) => {
					const newJob = await createJob({
						label,
						userId: user.id,
						dataDuration,
					});

					if (!newJob?.id)
						throw new Error(
							"Job creation failed: no ID returned"
						);

					return newJob.id;
				}}
			/> */}
		</div>
	);
}
