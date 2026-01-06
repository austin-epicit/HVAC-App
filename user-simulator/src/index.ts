import "dotenv/config";
import { TechnicianOperator } from "./operators/technician.js";

const t = new TechnicianOperator("c210d18a-ef8a-4a85-a3bb-bdecc853fb7c", "Me");
t.activeJob = {
	id: "0",
	name: "Job",
	client_id: "0",
	address: "0",
	description: "0",
	status: "InProgress",
	created_at: new Date(),
	priority: "Medium",
	coords: { lat: 43.904125, lon: -91.223579 },
};

setInterval(() => {
	t.tick();
}, 3000);
