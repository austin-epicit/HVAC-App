import AdaptableTable from "../../components/AdaptableTable";

const clients = [
	{ id: 1, name: "Jim Miller", job: "A/C Repair", status: "In Progress" },
	{ id: 2, name: "Sarah Johnson", job: "Heater Installation", status: "Scheduled" },
	{ id: 3, name: "Robert Davis", job: "Duct Cleaning", status: "Complete" },
];

export default function JobsPage() {
	return (
		<div>
			<h2 className="text-2xl font-semibold mb-4">Active Jobs</h2>
			<div className="shadow-sm border border-zinc-800 p-3 bg-zinc-900 rounded-lg overflow-hidden text-left">
				<AdaptableTable data={clients} />
			</div>
		</div>
	);
}
