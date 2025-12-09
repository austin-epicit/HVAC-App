export interface GeocodeResult {
	address: string;
	coords: Coordinates;
}

export type Coordinates = { lat: number; lon: number };
