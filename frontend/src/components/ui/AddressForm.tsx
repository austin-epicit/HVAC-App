import { Geocoder } from "@mapbox/search-js-react";
import type { GeocodeResult } from "../../types/location";

interface AddressFormProps {
	handleChange: (result: GeocodeResult) => void;
}

const AddressForm = ({ handleChange }: AddressFormProps) => {
	const MAPBOX_KEY = import.meta.env.VITE_MAPBOX_TOKEN;
	if (!MAPBOX_KEY) console.error("Issue loading Mapbox public key!");

	// unfortunately necessary for overriding default styles
	const theme = {
		variables: {
			// Typography
			fontFamily: "Inter",
			unit: "14px",
			lineHeight: "1.4",
			fontWeight: "400",
			fontWeightSemibold: "600",
			fontWeightBold: "700",

			// Layout / sizing
			minWidth: "100%",
			padding: "0.5rem 0.75rem",
			spacing: "0.25rem",
			borderRadius: "6px",

			// Colors
			colorBackground: "#27272a", // bg-zinc-800
			colorBackgroundHover: "#3f3f46", // bg-zinc-700
			colorBackgroundActive: "#3f3f46",
			colorText: "#ffffffff", // text-white
			colorPrimary: "#3b82f6", // blue-500
			colorSecondary: "#3f3f46",

			// Border
			border: "1px solid #3f3f46", // border-zinc-700

			// Modal / listbox padding
			paddingModal: "0.5rem",
			paddingFooterLabel: "0.25rem",
		},
	};

	return (
		<Geocoder
			accessToken={MAPBOX_KEY}
			options={{
				language: "en",
				country: "US",
				types: "address",
			}}
			theme={theme}
			onRetrieve={(d) => {
				const geoData = {
					address: d.properties.full_address,
					coords: {
						lat: d.properties.coordinates.latitude,
						lon: d.properties.coordinates.longitude,
					},
				} as GeocodeResult;

				handleChange(geoData);
			}}
		/>
	);
};

export default AddressForm;
