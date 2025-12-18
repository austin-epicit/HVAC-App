import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Plus, Share, X } from "lucide-react";
import { useAllClientsQuery, useCreateClientMutation } from "../../hooks/useClients";
import CreateClient from "../../components/clients/CreateClient";
import ClientCard from "../../components/clients/ClientCard";
import LoadSvg from "../../assets/icons/loading.svg?react";
import BoxSvg from "../../assets/icons/box.svg?react";
import ErrSvg from "../../assets/icons/error.svg?react";

export default function ClientsPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const {
		data: clients,
		isLoading: isFetchLoading,
		error: fetchError,
	} = useAllClientsQuery();
	const { mutateAsync: createClient } = useCreateClientMutation();
	const [searchInput, setSearchInput] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);

	const queryParams = new URLSearchParams(location.search);
	const searchFilter = queryParams.get("search");
	const statusFilter = queryParams.get("status");

	// Sync search input with URL on mount and when URL changes
	useEffect(() => {
		setSearchInput(searchFilter || "");
	}, [searchFilter]);

	// Use searchInput for instant preview, searchFilter for committed filter
	const activeSearch = searchInput || searchFilter;

	const filteredClients = clients
		?.filter((c) => {
			if (activeSearch) {
				const searchLower = activeSearch.toLowerCase();
				const matchesSearch =
					c.name.toLowerCase().includes(searchLower) ||
					c.address?.toLowerCase().includes(searchLower);
				if (!matchesSearch) return false;
			}

			if (statusFilter === "active") {
				return c.is_active === true;
			}
			if (statusFilter === "inactive") {
				return c.is_active === false;
			}

			return true;
		})
		.sort((a, b) => {
			// Sort active clients first
			if (a.is_active === b.is_active) return 0;
			return a.is_active ? -1 : 1;
		});

	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const newParams = new URLSearchParams(location.search);

		if (searchInput.trim()) {
			newParams.set("search", searchInput.trim());
		} else {
			newParams.delete("search");
		}

		navigate(`/dispatch/clients?${newParams.toString()}`);
	};

	const removeFilter = (filterType: "search" | "status") => {
		const newParams = new URLSearchParams(location.search);
		newParams.delete(filterType);

		if (filterType === "search") {
			setSearchInput("");
		}

		navigate(
			`/dispatch/clients${newParams.toString() ? `?${newParams.toString()}` : ""}`
		);
	};

	const clearAllFilters = () => {
		setSearchInput("");
		navigate("/dispatch/clients");
	};

	const hasFilters = searchFilter || statusFilter;

	return (
		<div className="text-white">
			<div className="flex flex-wrap items-center justify-between gap-4 mb-2">
				<h2 className="text-2xl font-semibold">Clients</h2>

				<div className="flex gap-2 text-nowrap">
					<form
						onSubmit={handleSearchSubmit}
						className="relative w-full min-w-[250px]"
					>
						<Search
							size={18}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
						/>
						<input
							type="text"
							placeholder="Search clients..."
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

			{/* Single Filter Bar with Chips */}
			{hasFilters && (
				<div className="mb-2 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 flex-wrap">
							<span className="text-sm text-zinc-400">
								Active filters:
							</span>

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

							{/* Status Filter Chip */}
							{statusFilter && (
								<div className="flex items-center gap-2 px-3 py-1.5 bg-green-600/20 border border-green-500/30 rounded-md">
									<span className="text-sm text-green-300">
										Status:{" "}
										<span className="font-medium text-white capitalize">
											{
												statusFilter
											}
										</span>
									</span>
									<button
										onClick={() =>
											removeFilter(
												"status"
											)
										}
										className="text-green-300 hover:text-white transition-colors"
										aria-label="Remove status filter"
									>
										<X size={14} />
									</button>
								</div>
							)}

							{/* Results Count */}
							<span className="text-sm text-zinc-500">
								• {filteredClients?.length || 0}{" "}
								{filteredClients?.length === 1
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
						{activeSearch
							? "No clients found."
							: "No clients yet."}
					</h1>
					{activeSearch && (
						<p className="text-center text-zinc-500 mt-2">
							Try adjusting your search terms
						</p>
					)}
				</div>
			)}

			{/* Client Cards - Flex Layout */}
			{!isFetchLoading &&
				!fetchError &&
				filteredClients &&
				filteredClients.length > 0 && (
					<div className="flex flex-wrap gap-4">
						{filteredClients.map((client) => (
							<ClientCard
								key={client.id}
								client={client}
								onClick={() => {
									navigate(
										`/dispatch/clients/${client.id}`
									);
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
