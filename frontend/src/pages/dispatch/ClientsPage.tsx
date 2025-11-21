import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Share } from "lucide-react";
import { useAllClientsQuery, useCreateClientMutation } from "../../hooks/useClients";
import CreateClient from "../../components/clients/CreateClient";
import ClientCard from "../../components/ui/ClientCard";
import LoadSvg from "../../assets/icons/loading.svg?react";
import BoxSvg from "../../assets/icons/box.svg?react";
import ErrSvg from "../../assets/icons/error.svg?react";

export default function ClientsPage() {
	const navigate = useNavigate();
	const {
		data: clients,
		isLoading: isFetchLoading,
		error: fetchError,
	} = useAllClientsQuery();
	const { mutateAsync: createClient } = useCreateClientMutation();
	const [search, setSearch] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);

	const filteredClients = clients
		?.filter((c) =>
			c.name.toLowerCase().includes(search.toLowerCase()) ||
			c.address?.toLowerCase().includes(search.toLowerCase())
		)
		.sort((a, b) => {
			// Sort active clients first
			if (a.is_active === b.is_active) return 0;
			return a.is_active ? -1 : 1;
		});

	return (
		<div className="text-white">
			<div className="flex flex-wrap items-center justify-between gap-4 mb-6">
				<h2 className="text-2xl font-semibold">Clients</h2>

				<div className="flex gap-2 text-nowrap">
					<div className="relative w-full min-w-[250px]">
						<Search
							size={18}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
						/>
						<input
							type="text"
							placeholder="Search clients..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full pl-11 pr-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm 
							text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 
							focus:ring-blue-500"
						/>
					</div>

					<button
						className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium cursor-pointer transition-colors"
						onClick={() => setIsModalOpen(true)}
					>
						<Plus size={16} className="text-white" />
						New Client
					</button>

					<button className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-md text-sm font-medium transition-colors">
						<Share size={16} className="text-white" />
						Export
					</button>
				</div>
			</div>

			{/* Loading State */}
			{isFetchLoading && (
				<div className="w-full h-[400px] flex flex-col justify-center items-center">
					<LoadSvg className="w-12 h-12 mb-3" />
					<h1 className="text-center text-xl mt-3">Please wait...</h1>
				</div>
			)}

			{/* Error State */}
			{fetchError && !isFetchLoading && (
				<div className="w-full h-[400px] flex flex-col justify-center items-center">
					<ErrSvg className="w-15 h-15 mb-1" />
					<h1 className="text-center text-xl mt-1">
						An error has occurred.
					</h1>
					<h2 className="text-center text-zinc-500 mt-1">
						{fetchError.message}
					</h2>
				</div>
			)}

			{/* Empty State */}
			{!isFetchLoading && !fetchError && filteredClients?.length === 0 && (
				<div className="w-full h-[400px] flex flex-col justify-center items-center">
					<BoxSvg className="w-15 h-15 mb-1" />
					<h1 className="text-center text-xl mt-1">
						{search ? "No clients found." : "No clients yet."}
					</h1>
					{search && (
						<p className="text-center text-zinc-500 mt-2">
							Try adjusting your search terms
						</p>
					)}
				</div>
			)}

			{/* Client Cards Grid */}
			{!isFetchLoading && !fetchError && filteredClients && filteredClients.length > 0 && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center">
					{filteredClients.map((client) => (
						<ClientCard
							key={client.id}
							client={client}
							onClick={() => {
								navigate(`/dispatch/clients/${client.id}`, {
									state: { client }
								});
							}}
						/>
					))}
				</div>
			)}

			<CreateClient
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				createClient={async (input) => {
					const newClient = await createClient(input);

					if (!newClient?.id)
						throw new Error(
							"Client creation failed: no ID returned"
						);

					return newClient.id;
				}}
			/>
		</div>
	);
}