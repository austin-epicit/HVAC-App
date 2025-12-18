import { renderToStaticMarkup } from "react-dom/server";
import type { StaticMarker } from "../../../types/location";
import { Users } from "lucide-react";

const CreateMarker = (m: StaticMarker) => {
	const reactElement = (
		<div className="flex flex-col">
			<div className="relative mx-auto">
				<div className="w-8 h-8 rounded-full bg-blue-500 shadow-md border-3 border-white"></div>
				<div className="absolute top-0 left-0 w-8 h-8">
					<Users className="m-auto h-full text-white" size={20} />
				</div>
			</div>

			<h1 className="font-bold text-shadow-lg">{m.label}</h1>
		</div>
	);

	const output = document.createElement("div");
	const staticElement = renderToStaticMarkup(reactElement);
	output.innerHTML = staticElement;

	return output;
};

export default CreateMarker;
