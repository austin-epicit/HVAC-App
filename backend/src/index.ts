import "dotenv/config";
import cors from "cors";
import { getAllJobs } from "./controllers/jobsController.js";
import express from "express";
import { JobResponse } from "./types/jobs.js";

const app = express();

app.use(express.json());

let frontend: string | undefined = process.env["FRONTEND_URL"];
if (!frontend) {
	console.warn("No frontend url configured. Defaulting...");
	frontend = "http://localhost:5173";
}

// app.use(
// 	cors({
// 		origin: frontend,
// 		credentials: true,
// 	})
// );

app.use(cors());

let port: string | undefined = process.env["SERVER_PORT"];
if (!port) {
	console.warn("No port configured. Defaulting...");
	port = "3000";
}

app.get("/jobs", (req, res) => {
	const jobs = getAllJobs();
	const resp: JobResponse = { err: "", jobs };
	res.send(resp);
});

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
