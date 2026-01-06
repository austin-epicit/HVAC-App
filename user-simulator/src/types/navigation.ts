export type NavigationResponse = { code: string; routes: NavigationRoute[] };

export type NavigationRoute = {
	distance: number;
	duration: number;
	legs: NavigationLeg[];
};

export type NavigationLeg = { steps: NavigationStep[] };

export type NavigationStep = { maneuver: { location: number[] } };
