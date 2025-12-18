import Card from "../../components/ui/Card";
import DynamicMap from "../../components/ui/maps/DynamicMap";
import { useRef } from "react";
import { useAllClientsQuery } from "../../hooks/useClients";
import type { StaticMarker } from "../../types/location";
import { Expand } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MapPage() {
	const nav = useNavigate();
	const mapContainerRef = useRef<HTMLDivElement>(null!);
	const staticMarkers: StaticMarker[] = [];

	const { data: clients } = useAllClientsQuery();

	if (clients)
		clients.forEach((c) => {
			staticMarkers.push({ coords: c.coords, type: "CLIENT", label: c.name });
		});

	return (
		<Card title="Map View" className="h-fit relative">
			<button
				className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium cursor-pointer transition-colors"
				onClick={() => {
					nav("/map");
				}}
			>
				<Expand size={16} className="text-white" />
				View Fullscreen
			</button>
			<div className="space-y-4">
				<div
					ref={mapContainerRef!}
					className="w-full h-175 bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden"
				>
					<DynamicMap
						containerRef={mapContainerRef}
						staticMarkers={staticMarkers}
					/>
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between text-sm">
						<span className="text-zinc-400">Last Updated:</span>
						<span className="text-white">
							{new Date().toLocaleTimeString("en-US", {
								hour: "numeric",
								minute: "2-digit",
							})}
						</span>
					</div>
				</div>
			</div>
		</Card>
	);
}
