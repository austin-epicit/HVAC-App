import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import type { StaticMarker } from "../../../types/location";
import "mapbox-gl/dist/mapbox-gl.css";
import CreateMarker from "./MarkerFactory";

interface DynamicMapProps {
	containerRef: React.RefObject<HTMLDivElement>;
	staticMarkers?: StaticMarker[];
}

const DynamicMap = ({ containerRef, staticMarkers = [] }: DynamicMapProps) => {
	const MAPBOX_KEY = import.meta.env.VITE_MAPBOX_TOKEN;
	if (!MAPBOX_KEY) console.error("Issue loading Mapbox public key!");

	const mapRef = useRef<mapboxgl.Map | null>(null);

	useEffect(() => {
		mapboxgl.accessToken = MAPBOX_KEY;

		mapRef.current = new mapboxgl.Map({
			container: containerRef.current,
			center: [-91.22, 43.85],
			zoom: 10,
			style: "mapbox://styles/mapbox/standard",
			minZoom: 5,
			maxZoom: 22,
			config: {
				basemap: {
					lightPreset: "dusk",
					showPointOfInterestLabels: false,
				},
			},
		});

		if (staticMarkers.length && mapRef.current)
			staticMarkers.forEach((m) => {
				new mapboxgl.Marker({ element: CreateMarker(m) })
					.setLngLat(m.coords)
					.addTo(mapRef.current!);
			});
	}, [MAPBOX_KEY, containerRef, staticMarkers, staticMarkers.length]);

	return null;
};

export default DynamicMap;
