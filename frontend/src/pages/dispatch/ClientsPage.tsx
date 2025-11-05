import AdaptableTable from "../../components/AdaptableTable";

import { Search, Plus, Share } from "lucide-react";

export default function ClientsPage() {


    //TODO build adaptableTable


	return (
		<div>
		    {/* Top Toolbar */}
			<div className="flex flex-wrap items-center justify-between gap-4 mb-4">
				{/* Left side: Title */}
				<h2 className="text-2xl font-semibold">Clients</h2>

				{/* Center: Search Bar */}
				<div className="relative w-full max-w-sm">
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

				{/* Right side: Buttons */}
				<div className="flex gap-2">
					<button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium">
						<Plus size={16} className="text-white" />
						New Job
					</button>

					<button className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-md text-sm font-medium">
						<Share size={16} className="text-white" />
						Export Job
					</button>
				</div>
			</div>
		</div>
	);
}
