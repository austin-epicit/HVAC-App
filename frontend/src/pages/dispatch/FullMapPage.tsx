import DynamicMap from "../../components/ui/maps/DynamicMap";
import { useMemo, useRef } from "react";
import { useAllClientsQuery } from "../../hooks/useClients";
import { useLiveTechnicians } from "../../hooks/useTechnicianMarkers";

export default function FullMapPage() {
	const mapContainerRef = useRef<HTMLDivElement>(null!);
	const { markers } = useLiveTechnicians();
	const { data: clients } = useAllClientsQuery();

	const allMarkers = useMemo(() => {
		const clientMarkers =
			clients?.map((c) => ({
				coords: c.coords,
				type: "CLIENT" as const,
				label: c.name,
			})) || [];
		return [...clientMarkers, ...markers];
	}, [clients, markers]);

	return (
		<div
			ref={mapContainerRef!}
			className="absolute top-0 left-0 w-screen h-screen overflow-hidden text-white"
		>
			<DynamicMap containerRef={mapContainerRef} staticMarkers={allMarkers} />
		</div>
	);
}
