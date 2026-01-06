import { useState, useEffect, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { useAllTechniciansQuery } from "../hooks/useTechnicians";
import type { Technician } from "../types/technicians";
import type { StaticMarker } from "../types/location";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL;
if (!SOCKET_URL) console.error("Failed to load socket URL!");

export function useLiveTechnicians() {
	const [technicians, setTechnicians] = useState<Technician[]>([]);
	const { data: initialData, isLoading } = useAllTechniciansQuery();

	useEffect(() => {
		if (initialData) setTechnicians(initialData);
	}, [initialData]);

	useEffect(() => {
		const socket: Socket = io(SOCKET_URL, { transports: ["websocket"] });

		socket.on("technician-update", (updatedTech: Technician) => {
			setTechnicians((prev) =>
				prev.map((t) => (t.id === updatedTech.id ? updatedTech : t))
			);
		});

		return () => {
			socket.off("technician-update");
			socket.disconnect();
		};
	}, []);

	const markers = useMemo((): StaticMarker[] => {
		return technicians
			.filter((t) => t.status !== "Offline" && t.status !== "Break")
			.map((t) => ({
				coords: t.coords,
				type: "TECHNICIAN",
				label: t.name,
			}));
	}, [technicians]);

	return { markers, technicians, isLoading };
}
