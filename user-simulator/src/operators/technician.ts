import http from "../services/httpService.js";
import { getDirections } from "../services/mapboxService.js";
import { Job } from "../types/jobs.js";
import { Coordinates } from "../types/location.js";
import { NavigationRoute } from "../types/navigation.js";
import {
	Technician,
	TechnicianStartingPointValues,
} from "../types/technicians.js";

export class TechnicianOperator {
	private BACKEND_URL = process.env.BACKEND_URL;
	private lastRoute: NavigationRoute | null = null;
	private nextCoordinate: Coordinates | null = null;
	public tech: Technician;
	public activeJob: Job | null = null;

	private updateLocation(to: Coordinates) {
		http.post(`${this.BACKEND_URL}/technicians/${this.tech.id}/ping`, {
			coords: to,
		}).then((p) => {
			if (p.status == 200) {
				this.tech.coords = to;
			}
		});
	}

	private stepIndex = 0;

	public async advanceLocation() {
		if (!this.lastRoute) {
			const resp = await getDirections(
				this.tech.coords,
				this.activeJob!.coords
			);

			if (!resp || resp.code != "Ok")
				throw new Error("Failed to advance location.");

			this.lastRoute = resp.routes[0];
			this.stepIndex = 0;
		}

		const steps = this.lastRoute.legs[0].steps;

		if (this.stepIndex >= steps.length) return; // arrived

		const maneuver = steps[this.stepIndex].maneuver;

		this.nextCoordinate = {
			lat: maneuver.location[1],
			lon: maneuver.location[0],
		};

		this.updateLocation(this.nextCoordinate);

		this.stepIndex++;

		// console.log(this.lastRoute.distance);
	}

	public tick() {
		if (this.activeJob) this.advanceLocation();
	}

	constructor(id: string, name?: string, startingPoint?: Coordinates) {
		if (!this.BACKEND_URL) console.error("Backend URL not provided!");

		this.tech = {
			id: id,
			name: name || id,
			title: "Technician",
			email: "test@test.com",
			description: "Testing",
			phone: "000",
			coords: startingPoint || TechnicianStartingPointValues[0],
			status: "Available",
			hire_date: new Date(),
			last_login: new Date(),
		};
	}
}
