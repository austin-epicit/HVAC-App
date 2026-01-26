import { Geocoder } from "@mapbox/search-js-react";
import type { GeocodeResult } from "../../types/location";
import { useState, useRef } from "react";

interface AddressFormProps {
	handleChange: (result: GeocodeResult) => void;
}

const AddressForm = ({ handleChange }: AddressFormProps) => {
	const MAPBOX_KEY = import.meta.env.VITE_MAPBOX_TOKEN;
	if (!MAPBOX_KEY) console.error("Issue loading Mapbox public key!");

	const [inputValue, setInputValue] = useState("");
	const geocoderRef = useRef<HTMLDivElement>(null);

	// unfortunately necessary for overriding default styles
	const theme = {
		variables: {
			fontFamily: "Inter",
			unit: "14px",
			lineHeight: "1.4",
			fontWeight: "400",
			fontWeightSemibold: "600",
			fontWeightBold: "700",

			minWidth: "100%",
			padding: "0.5rem 0.75rem",
			spacing: "0.25rem",
			borderRadius: "6px",

			colorBackground: "#17171aff", // bg-zinc-800
			colorBackgroundHover: "#3f3f46", // bg-zinc-700
			colorBackgroundActive: "#3f3f46",
			colorText: "#ffffffff", // popup text-white
			colorPrimary: "#3b82f6", // blue-500
			colorSecondary: "#3f3f46",

			border: "1px solid #2b2b30ff", // border-zinc-700

			paddingModal: "0.5rem",
			paddingFooterLabel: "0.25rem",
		},
		cssText: `
		input {
			color: #ffffff !important; // input text-white
		}
	`,
	};

	return (
		<div ref={geocoderRef} className="w-full">
			<Geocoder
				accessToken={MAPBOX_KEY}
				options={{
					language: "en",
					country: "US",
					types: "address",
				}}
				theme={theme}
				value={inputValue}
				onChange={(value) => setInputValue(value)}
				onRetrieve={(d) => {
					const selectedAddress = d.properties.full_address;
					const geoData = {
						address: selectedAddress,
						coords: {
							lat: d.properties.coordinates.latitude,
							lon: d.properties.coordinates.longitude,
						},
					} as GeocodeResult;

					setInputValue(selectedAddress);
					handleChange(geoData);
				}}
			/>
		</div>
	);
};

export default AddressForm;
