import AdaptableTable from "../../components/AdaptableTable";
import { useState } from "react";
import { Search, Plus, Share } from "lucide-react";
import { useAllClientsQuery, useCreateClientMutation } from "../../hooks/useClients";

export default function JobsPage() {
	const {
		data: clients,
		isLoading: isFetchLoading,
		error: fetchError,
	} = useAllClientsQuery();
	const { mutateAsync: createJob } = useCreateClientMutation();
	const [search, setSearch] = useState("");
	// const [isModalOpen, setIsModalOpen] = useState(false);
	const display = clients
		?.map((c) => ({
			name: c.name,
			address: c.address,
			status: c.isActive,
		}))
		.sort((a, b) => Number(a.status) - Number(b.status));

	return (
		<div className="text-white">
			<div className="flex flex-wrap items-center justify-between gap-4 mb-2">
				<h2 className="text-2xl font-semibold">Clients</h2>

				<div className="flex gap-2 text-nowrap">
					<div className="relative w-full">
						<Search
							size={18}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
						/>
						<input
							type="text"
							placeholder="Search clients..."
							className="w-full pl-11 pr-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm 
							text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 
							focus:ring-blue-500"
						/>
					</div>

					<button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium">
						<Plus size={16} className="text-white" />
						New Client
					</button>

					<button className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-md text-sm font-medium">
						<Share size={16} className="text-white" />
						Export Clients
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
		</div>
	);
}
