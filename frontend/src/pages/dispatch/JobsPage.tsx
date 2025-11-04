import AdaptableTable from "../../components/AdaptableTable";
import { useAllJobsQuery } from "../../hooks/useJobs";
import { JobStatusValues } from "../../types/jobs";

export default function JobsPage() {
	const { data: jobs, isLoading: isGetLoading, isError: isGetError } = useAllJobsQuery();
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
		<div>
			<h2 className="text-2xl font-semibold mb-4">Active Jobs</h2>
			<div className="shadow-sm border border-zinc-800 p-3 bg-zinc-900 rounded-lg overflow-hidden text-left">
				<AdaptableTable data={display || []} />
			</div>
		</div>
	);
}
