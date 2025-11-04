import "dotenv/config";
import { getAllJobs } from "./controllers/jobsController.js";
import express from "express";

const app = express();
app.use(express.json());

let port: string | undefined = process.env["SERVER_PORT"];
if (!port) {
	console.warn("No port configured. Defaulting...");
	port = "3000";
}

app.get("/jobs", (req, res) => {
	res.send(getAllJobs());
});

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
