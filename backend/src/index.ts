import "dotenv/config";
import cors from "cors";
import {
	getAllJobs,
	getJobById,
	insertJob,
} from "./controllers/jobsController.js";
import express from "express";
import {
	ClientInsertResult,
	ClientResponse,
	JobInsertResult,
	JobResponse,
} from "./types/responses.js";
import {
	getAllClients,
	getClientById,
	insertClient,
} from "./controllers/clientsController.js";

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

// JOBS

app.get("/jobs", async (req, res) => {
	try {
		const jobs = await getAllJobs();
		const resp: JobResponse = { err: "", data: jobs };
		res.json(resp);
	} catch (err) {
		console.error(err);
		res.status(500).json({ err: "Failed to fetch jobs", data: [] });
	}
});

app.get("/jobs/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const job = await getJobById(id);

		if (!job)
			return res.status(404).json({ err: "Job not found", data: [] });

		const resp: JobResponse = { err: "", data: [job] };
		res.json(resp);
	} catch (err) {
		console.error(err);
		res.status(500).json({ err: "Failed to fetch job", data: [] });
	}
});

app.post("/jobs", async (req, res) => {
	const result: JobInsertResult = await insertJob(req.body);
	if (result.err) {
		return res.status(400).json({ err: result.err, data: [] });
	}

	return res.status(201).json({ err: "", data: [result.item] });
});

// CLIENTS

app.get("/clients", async (req, res) => {
	try {
		const clients = await getAllClients();
		const resp: ClientResponse = { err: "", data: clients };
		res.json(resp);
	} catch (err) {
		console.error(err);
		res.status(500).json({ err: "Failed to fetch clients", data: [] });
	}
});

app.get("/clients/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const client = await getClientById(id);

		if (!client)
			return res.status(404).json({ err: "Client not found", data: [] });

		const resp: ClientResponse = { err: "", data: [client] };
		res.json(resp);
	} catch (err) {
		console.error(err);
		res.status(500).json({ err: "Failed to fetch client", data: [] });
	}
});

app.post("/clients", async (req, res) => {
	const result: ClientInsertResult = await insertClient(req.body);
	if (result.err) {
		return res.status(400).json({ err: result.err, data: [] });
	}

	return res.status(201).json({ err: "", data: [result.item] });
});

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
