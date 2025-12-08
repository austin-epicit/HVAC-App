import "dotenv/config";
import cors from "cors";
import express from "express";
import {
	getAllJobs,
	getJobById,
	insertJob,
	updateJob,
	deleteJob,
	getJobsByClientId
} from "./controllers/jobsController.js";
import { 
	getJobNotes,
	getJobNotesByVisitId,
	insertJobNote, 
	updateJobNote, 
	deleteJobNote 
} from "./controllers/jobNotesController.js";
import {
	getAllJobVisits,
	getJobVisitById,
	getJobVisitsByJobId,
	getJobVisitsByTechId,
	getJobVisitsByDateRange,
	insertJobVisit,
	updateJobVisit,
	assignTechniciansToVisit,
	deleteJobVisit,
} from "./controllers/jobVisitsController.js";
import {
	ClientInsertResult,
	ClientResponse,
	JobInsertResult,
	JobResponse,
	JobVisitInsertResult,
	JobVisitResponse,
	ContactInsertResult,
	ContactResponse,
	NoteInsertResult,
	NoteResponse,
	TechnicianInsertResult,
	TechnicianResponse,
	DeleteResult,
} from "./types/responses.js";
import {
	getAllClients,
	getClientById,
	insertClient,
	updateClient,
	deleteClient,
} from "./controllers/clientsController.js";
import {
	getClientContacts,
	getContactById,
	insertContact,
	updateContact,
	deleteContact,
} from "./controllers/contactsController.js";
import {
	getClientNotes,
	getNoteById,
	insertNote,
	updateNote,
	deleteNote,
} from "./controllers/clientNotesController.js";
import {
	getAllTechnicians,
	getTechnicianById,
	insertTechnician,
	updateTechnician,
	deleteTechnician,
} from "./controllers/techniciansController.js";

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

// ============================================
// HELPER: Extract user info from request
// TODO: Replace with actual auth middleware
// ============================================
const extractUserInfo = (req: express.Request): { userId?: string; userType?: 'tech' | 'dispatcher' } => {
	const userId = req.headers['x-user-id'] as string;
	const userType = req.headers['x-user-type'] as 'tech' | 'dispatcher';
	
	// Return undefined if not provided
	return { 
		userId: userId || undefined, 
		userType: userType || undefined 
	};
};

// ============================================
// JOBS
// ============================================

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

app.patch("/jobs/:id", async (req, res) => {
	try {
		const result = await updateJob(req);
		if (result.err) {
			return res.status(400).json({ err: result.err, data: [] });
		}
		return res.json({ err: "", data: [result.item] });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ err: "Failed to update job", data: [] });
	}
});
app.delete("/jobs/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const result = await deleteJob(id);

		if (result.err) {
			return res.status(400).json({ err: result.err, data: [] });
		}

		return res.json({ err: "", message: "Job deleted", id });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ err: "Failed to delete job", data: [] });
	}
});

// ============================================
// JOB VISITS
// ============================================

app.get("/job-visits", async (req, res) => {
	try {
		const visits = await getAllJobVisits();
		const resp: JobVisitResponse = { err: "", data: visits };
		res.json(resp);
	} catch (err) {
		console.error(err);
		res.status(500).json({ err: "Failed to fetch job visits", data: [] });
	}
});

app.get("/job-visits/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const visit = await getJobVisitById(id);

		if (!visit)
			return res.status(404).json({ err: "Job visit not found", data: [] });

		res.json({ err: "", data: [visit] });
	} catch (err) {
		console.error(err);
		res.status(500).json({ err: "Failed to fetch job visit", data: [] });
	}
});

app.get("/jobs/:jobId/visits", async (req, res) => {
	try {
		const { jobId } = req.params;
		const visits = await getJobVisitsByJobId(jobId);
		res.json({ err: "", data: visits });
	} catch (err) {
		console.error(err);
		res.status(500).json({ err: "Failed to fetch job visits", data: [] });
	}
});

app.get("/technicians/:techId/visits", async (req, res) => {
	try {
		const { techId } = req.params;
		const visits = await getJobVisitsByTechId(techId);
		res.json({ err: "", data: visits });
	} catch (err) {
		console.error(err);
		res.status(500).json({ err: "Failed to fetch technician visits", data: [] });
	}
});

app.get("/job-visits/date-range/:startDate/:endDate", async (req, res) => {
	try {
		const { startDate, endDate } = req.params;
		const start = new Date(startDate);
		const end = new Date(endDate);

		if (isNaN(start.getTime()) || isNaN(end.getTime())) {
			return res.status(400).json({ err: "Invalid date format", data: [] });
		}

		const visits = await getJobVisitsByDateRange(start, end);
		res.json({ err: "", data: visits });
	} catch (err) {
		console.error(err);
		res.status(500).json({ err: "Failed to fetch job visits", data: [] });
	}
});

app.post("/job-visits", async (req, res) => {
	try {
		const result: JobVisitInsertResult = await insertJobVisit(req);
		if (result.err) {
			return res.status(400).json({ err: result.err, data: [] });
		}
		res.status(201).json({ err: "", data: [result.item] });
	} catch (err) {
		console.error(err);
		res.status(500).json({ err: "Failed to create job visit", data: [] });
	}
});

app.put("/job-visits/:id", async (req, res) => {
	try {
		const result = await updateJobVisit(req);
		if (result.err) {
			return res.status(400).json({ err: result.err, data: [] });
		}
		res.json({ err: "", data: [result.item] });
	} catch (err) {
		console.error(err);
		res.status(500).json({ err: "Failed to update job visit", data: [] });
	}
});

app.put("/job-visits/:id/technicians", async (req, res) => {
	try {
		const { id } = req.params;
		const { tech_ids } = req.body;

		if (!Array.isArray(tech_ids)) {
			return res.status(400).json({ err: "tech_ids must be an array", data: [] });
		}

		const result = await assignTechniciansToVisit(id, tech_ids);
		if (result.err) {
			return res.status(400).json({ err: result.err, data: [] });
		}
		res.json({ err: "", data: [result.item] });
	} catch (err) {
		console.error(err);
		res.status(500).json({ err: "Failed to assign technicians", data: [] });
	}
});

app.delete("/job-visits/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const result = await deleteJobVisit(id);
		if (result.err) {
			return res.status(400).json(result);
		}
		res.json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({ err: "Failed to delete job visit" });
	}
});

// ============================================
// JOB NOTES
// ============================================

app.get("/jobs/:jobId/notes", async (req, res) => {
	try {
		const { jobId } = req.params;
		const notes = await getJobNotes(jobId);
		return res.json({ err: "", data: notes });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ err: "Failed to fetch notes", data: [] });
	}
});

app.get("/jobs/:jobId/visits/:visitId/notes", async (req, res) => {
	try {
		const { jobId, visitId } = req.params;
		const notes = await getJobNotesByVisitId(jobId, visitId);
		return res.json({ err: "", data: notes });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ err: "Failed to fetch visit notes", data: [] });
	}
});

app.post("/jobs/:jobId/notes", async (req, res) => {
	try {
		const { jobId } = req.params;
		const { userId, userType } = extractUserInfo(req);
		
		const result = await insertJobNote(jobId, req.body, userId, userType);
		
		if (result.err) {
			return res.status(400).json({ err: result.err });
		}

		return res.status(201).json({ err: "", item: result.item });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ err: "Failed to create note" });
	}
});

app.put("/jobs/:jobId/notes/:noteId", async (req, res) => {
	try {
		const { jobId, noteId } = req.params;
		const { userId, userType } = extractUserInfo(req);
		
		const result = await updateJobNote(jobId, noteId, req.body, userId, userType);
		
		if (result.err) {
			return res.status(400).json({ err: result.err });
		}

		return res.json({ err: "", item: result.item });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ err: "Failed to update note" });
	}
});

app.delete("/jobs/:jobId/notes/:noteId", async (req, res) => {
	try {
		const { jobId, noteId } = req.params;
		const { userId, userType } = extractUserInfo(req);
		
		const result = await deleteJobNote(jobId, noteId, userId, userType);
		
		if (result.err) {
			return res.status(400).json({ err: result.err });
		}

		return res.json({ err: "", message: result.message });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ err: "Failed to delete note" });
	}
});

// ============================================
// CLIENTS
// ============================================

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
	try {
		const result: ClientInsertResult = await insertClient(req.body);
		if (result.err) {
			console.error("Create client validation error:", result.err);
			return res.status(400).json({ err: result.err });
		}

		return res.status(201).json({ err: "", item: result.item });
	} catch (err) {
		console.error("Create client error:", err);
		return res.status(500).json({ err: "Failed to create client" });
	}
});

app.put("/clients/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const result = await updateClient(id, req.body);
		
		if (result.err) {
			return res.status(400).json({ err: result.err });
		}

		return res.json({ err: "", item: result.item });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ err: "Failed to update client" });
	}
});

app.delete("/clients/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const result: DeleteResult = await deleteClient(id);
		
		if (result.err) {
			return res.status(400).json({ err: result.err });
		}

		return res.json({ err: "", message: result.message });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ err: "Failed to delete client" });
	}
});

// ============================================
// CLIENT CONTACTS
// ============================================

app.get("/clients/:clientId/contacts", async (req, res) => {
	try {
		const { clientId } = req.params;
		const contacts = await getClientContacts(clientId);
		const resp: ContactResponse = { err: "", data: contacts };
		res.json(resp);
	} catch (err) {
		console.error(err);
		res.status(500).json({ err: "Failed to fetch contacts", data: [] });
	}
});

app.get("/clients/:clientId/contacts/:contactId", async (req, res) => {
	try {
		const { clientId, contactId } = req.params;
		const contact = await getContactById(clientId, contactId);

		if (!contact)
			return res.status(404).json({ err: "Contact not found", data: [] });

		const resp: ContactResponse = { err: "", data: [contact] };
		res.json(resp);
	} catch (err) {
		console.error(err);
		res.status(500).json({ err: "Failed to fetch contact", data: [] });
	}
});

app.post("/clients/:clientId/contacts", async (req, res) => {
	try {
		const { clientId } = req.params;
		const result: ContactInsertResult = await insertContact(clientId, req.body);
		
		if (result.err) {
			return res.status(400).json({ err: result.err });
		}

		return res.status(201).json({ err: "", item: result.item });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ err: "Failed to create contact" });
	}
});

app.put("/clients/:clientId/contacts/:contactId", async (req, res) => {
	try {
		const { clientId, contactId } = req.params;
		const result = await updateContact(clientId, contactId, req.body);
		
		if (result.err) {
			return res.status(400).json({ err: result.err });
		}

		return res.json({ err: "", item: result.item });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ err: "Failed to update contact" });
	}
});

app.delete("/clients/:clientId/contacts/:contactId", async (req, res) => {
	try {
		const { clientId, contactId } = req.params;
		const result: DeleteResult = await deleteContact(clientId, contactId);
		
		if (result.err) {
			return res.status(400).json({ err: result.err });
		}

		return res.json({ err: "", message: result.message });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ err: "Failed to delete contact" });
	}
});

// ============================================
// CLIENT NOTES
// ============================================

app.get("/clients/:clientId/notes", async (req, res) => {
	try {
		const { clientId } = req.params;
		const notes = await getClientNotes(clientId);
		const resp: NoteResponse = { err: "", data: notes };
		res.json(resp);
	} catch (err) {
		console.error(err);
		res.status(500).json({ err: "Failed to fetch notes", data: [] });
	}
});

app.get("/clients/:clientId/notes/:noteId", async (req, res) => {
	try {
		const { clientId, noteId } = req.params;
		const note = await getNoteById(clientId, noteId);

		if (!note)
			return res.status(404).json({ err: "Note not found", data: [] });

		const resp: NoteResponse = { err: "", data: [note] };
		res.json(resp);
	} catch (err) {
		console.error(err);
		res.status(500).json({ err: "Failed to fetch note", data: [] });
	}
});

app.post("/clients/:clientId/notes", async (req, res) => {
	try {
		const { clientId } = req.params;
		const { userId, userType } = extractUserInfo(req);
		
		const result: NoteInsertResult = await insertNote(clientId, req.body, userId, userType);
		
		if (result.err) {
			return res.status(400).json({ err: result.err });
		}

		return res.status(201).json({ err: "", item: result.item });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ err: "Failed to create note" });
	}
});

app.put("/clients/:clientId/notes/:noteId", async (req, res) => {
	try {
		const { clientId, noteId } = req.params;
		const { userId, userType } = extractUserInfo(req);
		
		const result = await updateNote(clientId, noteId, req.body, userId, userType);
		
		if (result.err) {
			return res.status(400).json({ err: result.err });
		}

		return res.json({ err: "", item: result.item });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ err: "Failed to update note" });
	}
});

app.delete("/clients/:clientId/notes/:noteId", async (req, res) => {
	try {
		const { clientId, noteId } = req.params;
		const { userId, userType } = extractUserInfo(req);
		
		const result: DeleteResult = await deleteNote(clientId, noteId, userId, userType);
		
		if (result.err) {
			return res.status(400).json({ err: result.err });
		}

		return res.json({ err: "", message: result.message });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ err: "Failed to delete note" });
	}
});

// ============================================
// CLIENT JOBS (Read-only)
// ============================================

app.get("/clients/:clientId/jobs", async (req, res) => {
	try {
		const { clientId } = req.params;
		const jobs = await getJobsByClientId(clientId);
		const resp: JobResponse = { err: "", data: jobs };
		res.json(resp);
	} catch (err) {
		console.error(err);
		res.status(500).json({ err: "Failed to fetch client jobs", data: [] });
	}
});

// ============================================
// TECHNICIANS
// ============================================

app.get("/technicians", async (req, res) => {
	try {
		const technicians = await getAllTechnicians();
		const resp: TechnicianResponse = { err: "", data: technicians };
		res.json(resp);
	} catch (err) {
		console.error(err);
		res.status(500).json({ err: "Failed to fetch technicians", data: [] });
	}
});

app.get("/technicians/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const technician = await getTechnicianById(id);

		if (!technician)
			return res.status(404).json({ err: "Technician not found", data: [] });

		const resp: TechnicianResponse = { err: "", data: [technician] };
		res.json(resp);
	} catch (err) {
		console.error(err);
		res.status(500).json({ err: "Failed to fetch technician", data: [] });
	}
});

app.post("/technicians", async (req, res) => {
	try {
		const result: TechnicianInsertResult = await insertTechnician(req.body);
		if (result.err) {
			console.error("Create technician validation error:", result.err);
			return res.status(400).json({ err: result.err });
		}

		return res.status(201).json({ err: "", item: result.item });
	} catch (err) {
		console.error("Create technician error:", err);
		return res.status(500).json({ err: "Failed to create technician" });
	}
});

app.put("/technicians/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const result = await updateTechnician(id, req.body);
		
		if (result.err) {
			return res.status(400).json({ err: result.err });
		}

		return res.json({ err: "", item: result.item });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ err: "Failed to update technician" });
	}
});

app.delete("/technicians/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const result: DeleteResult = await deleteTechnician(id);
		
		if (result.err) {
			return res.status(400).json({ err: result.err });
		}

		return res.json({ err: "", message: result.message });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ err: "Failed to delete technician" });
	}
});

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
