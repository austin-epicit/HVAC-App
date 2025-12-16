// import Card from "../../components/ui/Card";
import DynamicMap from "../../components/ui/maps/DynamicMap";
import { useRef } from "react";
import { useAllClientsQuery } from "../../hooks/useClients";
import type { StaticMarker } from "../../types/location";

export default function FullMapPage() {
	const mapContainerRef = useRef<HTMLDivElement>(null!);
	const staticMarkers: StaticMarker[] = [];

	const { data: clients } = useAllClientsQuery();

	if (clients)
		clients.forEach((c) => {
			staticMarkers.push({ coords: c.coords, type: "CLIENT", label: c.name });
		});

	return (
		<div
			ref={mapContainerRef!}
			className="absolute top-0 left-0 w-screen h-screen overflow-hidden text-white"
		>
			<DynamicMap containerRef={mapContainerRef} staticMarkers={staticMarkers} />
		</div>
	);
}
