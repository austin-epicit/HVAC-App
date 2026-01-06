import { Coordinates } from "../types/location.js";
import { NavigationResponse } from "../types/navigation.js";
import http from "./httpService.js";

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;
if (!MAPBOX_TOKEN) console.error("Mapbox Token not found!");

export const getDirections = async (from: Coordinates, to: Coordinates) => {
	const resp = await http.get(
		`https://api.mapbox.com/directions/v5/mapbox/driving/${from.lon},${from.lat};${to.lon},${to.lat}?steps=true&access_token=${MAPBOX_TOKEN}`
	);

	if (resp.status == 200) {
		console.log();
		return resp.data as NavigationResponse;
	} else {
		console.log(resp.statusText);
	}
};
