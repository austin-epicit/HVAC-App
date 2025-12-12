import "dotenv/config";
import cors from "cors";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import {
	ErrorCodes,
	createSuccessResponse,
	createErrorResponse,
} from "./types/responses.js";
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
import { logAction } from "./services/logger.js";
import { auditLog, calculateChanges } from "./services/auditLogger.js";

export interface UserContext {
	techId?: string;
	dispatcherId?: string;
	ipAddress?: string;
	userAgent?: string;
}

// ============================================
// MIDDLEWARE
// ============================================

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
	console.error(`[ERROR] ${req.method} ${req.path}:`, err);
	
	// Default to 500 if no status code is set
	const statusCode = err.statusCode || 500;
	
	res.status(statusCode).json(
		createErrorResponse(
			err.code || ErrorCodes.SERVER_ERROR,
			err.message || 'An unexpected error occurred',
			process.env.NODE_ENV === 'development' ? err.stack : undefined
		)
	);
};

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
	const timestamp = new Date().toISOString();
	console.log(`[${timestamp}] ${req.method} ${req.path}`);
	next();
};

const notFoundHandler = (req: Request, res: Response) => {
	res.status(404).json(
		createErrorResponse(
			ErrorCodes.NOT_FOUND,
			`Route ${req.method} ${req.path} not found`
		)
	);
};

// ============================================
// HELPER
// ============================================

const getUserContext = (req: Request): UserContext => {
	const userId = req.headers['x-user-id'] as string;
	const userType = req.headers['x-user-type'] as 'tech' | 'dispatcher';
	/*
	const ipAddress = 
		(req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
		req.socket.remoteAddress ||
		undefined;
	*/
	const userAgent = req.headers['user-agent'] || undefined;
	
	return {
		techId: userType === 'tech' ? userId : undefined,
		dispatcherId: userType === 'dispatcher' ? userId : undefined,
		ipAddress: undefined,
		userAgent,
	};
};

// ============================================
// APP SETUP
// ============================================

const app = express();

app.use(express.json());
app.use(requestLogger);

let frontend: string | undefined = process.env["FRONTEND_URL"];
if (!frontend) {
	console.warn("No frontend url configured. Defaulting...");
	frontend = "http://localhost:5173";
}

// CORS configuration
app.use(cors({
	origin: process.env.NODE_ENV === 'production' 
		? frontend 
		: '*', // Allow all origins in development
	credentials: true,
}));

let port: string | undefined = process.env["SERVER_PORT"];
if (!port) {
	console.warn("No port configured. Defaulting...");
	port = "3000";
}

// ============================================
// JOBS
// ============================================

app.get("/jobs", async (req, res, next) => {
	try {
		const jobs = await getAllJobs();
		res.json(createSuccessResponse(jobs, { count: jobs.length }));
	} catch (err) {
		next(err);
	}
});

app.get("/jobs/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		const job = await getJobById(id);

		if (!job) {
			return res.status(404).json(
				createErrorResponse(ErrorCodes.NOT_FOUND, 'Job not found')
			);
		}

		res.json(createSuccessResponse(job));
	} catch (err) {
		next(err);
	}
});

app.post("/jobs", async (req, res, next) => {
	try {
		const context = getUserContext(req);
		const result = await insertJob(req.body, context);
		
		if (result.err) {
			return res.status(400).json(
				createErrorResponse(ErrorCodes.VALIDATION_ERROR, result.err)
			);
		}

		res.status(201).json(createSuccessResponse(result.item));
	} catch (err) {
		next(err);
	}
});

app.patch("/jobs/:id", async (req, res, next) => {
	try {
		const context = getUserContext(req);
		const result = await updateJob(req, context);
		
		if (result.err) {
			return res.status(400).json(
				createErrorResponse(ErrorCodes.VALIDATION_ERROR, result.err)
			);
		}
		
		res.json(createSuccessResponse(result.item));
	} catch (err) {
		next(err);
	}
});

app.delete("/jobs/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		const context = getUserContext(req);
		const result = await deleteJob(id, context);

		if (result.err) {
			return res.status(400).json(
				createErrorResponse(ErrorCodes.DELETE_ERROR, result.err)
			);
		}

		res.status(200).json(createSuccessResponse({ message: 'Job deleted successfully', id }));
	} catch (err) {
		next(err);
	}
});

// ============================================
// JOB VISITS
// ============================================

app.get("/job-visits", async (req, res, next) => {
	try {
		const visits = await getAllJobVisits();
		res.json(createSuccessResponse(visits, { count: visits.length }));
	} catch (err) {
		next(err);
	}
});

app.get("/job-visits/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		const visit = await getJobVisitById(id);

		if (!visit) {
			return res.status(404).json(
				createErrorResponse(ErrorCodes.NOT_FOUND, 'Job visit not found')
			);
		}

		res.json(createSuccessResponse(visit));
	} catch (err) {
		next(err);
	}
});

app.get("/jobs/:jobId/visits", async (req, res, next) => {
	try {
		const { jobId } = req.params;
		const visits = await getJobVisitsByJobId(jobId);
		res.json(createSuccessResponse(visits, { count: visits.length }));
	} catch (err) {
		next(err);
	}
});

app.get("/technicians/:techId/visits", async (req, res, next) => {
	try {
		const { techId } = req.params;
		const visits = await getJobVisitsByTechId(techId);
		res.json(createSuccessResponse(visits, { count: visits.length }));
	} catch (err) {
		next(err);
	}
});

app.get("/job-visits/date-range/:startDate/:endDate", async (req, res, next) => {
	try {
		const { startDate, endDate } = req.params;
		const start = new Date(startDate);
		const end = new Date(endDate);

		if (isNaN(start.getTime()) || isNaN(end.getTime())) {
			return res.status(400).json(
				createErrorResponse(ErrorCodes.INVALID_INPUT, 'Invalid date format. Use YYYY-MM-DD')
			);
		}

		const visits = await getJobVisitsByDateRange(start, end);
		res.json(createSuccessResponse(visits, { count: visits.length }));
	} catch (err) {
		next(err);
	}
});

app.post("/job-visits", async (req, res, next) => {
	try {
		const context = getUserContext(req);
		const result = await insertJobVisit(req, context);
		
		if (result.err) {
			return res.status(400).json(
				createErrorResponse(ErrorCodes.VALIDATION_ERROR, result.err)
			);
		}
		
		res.status(201).json(createSuccessResponse(result.item));
	} catch (err) {
		next(err);
	}
});

app.put("/job-visits/:id", async (req, res, next) => {
	try {
		const context = getUserContext(req);
		const result = await updateJobVisit(req, context);
		
		if (result.err) {
			return res.status(400).json(
				createErrorResponse(ErrorCodes.VALIDATION_ERROR, result.err)
			);
		}
		
		res.json(createSuccessResponse(result.item));
	} catch (err) {
		next(err);
	}
});

app.put("/job-visits/:id/technicians", async (req, res, next) => {
	try {
		const { id } = req.params;
		const { tech_ids } = req.body;
		const context = getUserContext(req);

		if (!Array.isArray(tech_ids)) {
			return res.status(400).json(
				createErrorResponse(ErrorCodes.INVALID_INPUT, 'tech_ids must be an array', null, 'tech_ids')
			);
		}

		const result = await assignTechniciansToVisit(id, tech_ids, context);
		
		if (result.err) {
			return res.status(400).json(
				createErrorResponse(ErrorCodes.VALIDATION_ERROR, result.err)
			);
		}
		
		res.json(createSuccessResponse(result.item));
	} catch (err) {
		next(err);
	}
});

app.delete("/job-visits/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		const context = getUserContext(req);
		const result = await deleteJobVisit(id, context);
		
		if (result.err) {
			return res.status(400).json(
				createErrorResponse(ErrorCodes.DELETE_ERROR, result.err)
			);
		}
		
		res.status(200).json(createSuccessResponse({ message: result.message || 'Job visit deleted successfully', id }));
	} catch (err) {
		next(err);
	}
});

// ============================================
// JOB NOTES
// ============================================

app.get("/jobs/:jobId/notes", async (req, res, next) => {
	try {
		const { jobId } = req.params;
		const notes = await getJobNotes(jobId);
		res.json(createSuccessResponse(notes, { count: notes.length }));
	} catch (err) {
		next(err);
	}
});

app.get("/jobs/:jobId/visits/:visitId/notes", async (req, res, next) => {
	try {
		const { jobId, visitId } = req.params;
		const notes = await getJobNotesByVisitId(jobId, visitId);
		res.json(createSuccessResponse(notes, { count: notes.length }));
	} catch (err) {
		next(err);
	}
});

app.post("/jobs/:jobId/notes", async (req, res, next) => {
	try {
		const { jobId } = req.params;
		const context = getUserContext(req);
		const result = await insertJobNote(jobId, req.body, context);
		
		if (result.err) {
			return res.status(400).json(
				createErrorResponse(ErrorCodes.VALIDATION_ERROR, result.err)
			);
		}

		res.status(201).json(createSuccessResponse(result.item));
	} catch (err) {
		next(err);
	}
});

app.put("/jobs/:jobId/notes/:noteId", async (req, res, next) => {
	try {
		const { jobId, noteId } = req.params;
		const context = getUserContext(req);
		const result = await updateJobNote(jobId, noteId, req.body, context);
		
		if (result.err) {
			return res.status(400).json(
				createErrorResponse(ErrorCodes.VALIDATION_ERROR, result.err)
			);
		}

		res.json(createSuccessResponse(result.item));
	} catch (err) {
		next(err);
	}
});

app.delete("/jobs/:jobId/notes/:noteId", async (req, res, next) => {
	try {
		const { jobId, noteId } = req.params;
		const context = getUserContext(req);
		const result = await deleteJobNote(jobId, noteId, context);
		
		if (result.err) {
			return res.status(400).json(
				createErrorResponse(ErrorCodes.DELETE_ERROR, result.err)
			);
		}

		res.status(200).json(createSuccessResponse({ message: result.message || 'Note deleted successfully' }));
	} catch (err) {
		next(err);
	}
});

// ============================================
// CLIENTS
// ============================================

app.get("/clients", async (req, res, next) => {
	try {
		const clients = await getAllClients();
		res.json(createSuccessResponse(clients, { count: clients.length }));
	} catch (err) {
		next(err);
	}
});

app.get("/clients/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		const client = await getClientById(id);

		if (!client) {
			return res.status(404).json(
				createErrorResponse(ErrorCodes.NOT_FOUND, 'Client not found')
			);
		}

		res.json(createSuccessResponse(client));
	} catch (err) {
		next(err);
	}
});

app.post("/clients", async (req, res, next) => {
	try {
		const context = getUserContext(req);
		const result = await insertClient(req.body, context);
		
		if (result.err) {
			const isDuplicate = result.err.toLowerCase().includes('already exists');
			return res.status(isDuplicate ? 409 : 400).json(
				createErrorResponse(
					isDuplicate ? ErrorCodes.CONFLICT : ErrorCodes.VALIDATION_ERROR,
					result.err
				)
			);
		}

		res.status(201).json(createSuccessResponse(result.item));
	} catch (err) {
		next(err);
	}
});

app.put("/clients/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		const context = getUserContext(req);
		const result = await updateClient(id, req.body, context);
		
		if (result.err) {
			const isDuplicate = result.err.toLowerCase().includes('already exists');
			return res.status(isDuplicate ? 409 : 400).json(
				createErrorResponse(
					isDuplicate ? ErrorCodes.CONFLICT : ErrorCodes.VALIDATION_ERROR,
					result.err
				)
			);
		}

		res.json(createSuccessResponse(result.item));
	} catch (err) {
		next(err);
	}
});

app.delete("/clients/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		const context = getUserContext(req);
		const result = await deleteClient(id, context);
		
		if (result.err) {
			return res.status(400).json(
				createErrorResponse(ErrorCodes.DELETE_ERROR, result.err)
			);
		}

		res.status(200).json(createSuccessResponse({ message: result.message || 'Client deleted successfully', id }));
	} catch (err) {
		next(err);
	}
});

// ============================================
// CLIENT CONTACTS
// ============================================

app.get("/clients/:clientId/contacts", async (req, res, next) => {
	try {
		const { clientId } = req.params;
		const contacts = await getClientContacts(clientId);
		res.json(createSuccessResponse(contacts, { count: contacts.length }));
	} catch (err) {
		next(err);
	}
});

app.get("/clients/:clientId/contacts/:contactId", async (req, res, next) => {
	try {
		const { clientId, contactId } = req.params;
		const contact = await getContactById(clientId, contactId);

		if (!contact) {
			return res.status(404).json(
				createErrorResponse(ErrorCodes.NOT_FOUND, 'Contact not found')
			);
		}

		res.json(createSuccessResponse(contact));
	} catch (err) {
		next(err);
	}
});

app.post("/clients/:clientId/contacts", async (req, res, next) => {
	try {
		const { clientId } = req.params;
		const context = getUserContext(req);
		const result = await insertContact(clientId, req.body, context);
		
		if (result.err) {
			return res.status(400).json(
				createErrorResponse(ErrorCodes.VALIDATION_ERROR, result.err)
			);
		}

		res.status(201).json(createSuccessResponse(result.item));
	} catch (err) {
		next(err);
	}
});

app.put("/clients/:clientId/contacts/:contactId", async (req, res, next) => {
	try {
		const { clientId, contactId } = req.params;
		const context = getUserContext(req);
		const result = await updateContact(clientId, contactId, req.body, context);
		
		if (result.err) {
			return res.status(400).json(
				createErrorResponse(ErrorCodes.VALIDATION_ERROR, result.err)
			);
		}

		res.json(createSuccessResponse(result.item));
	} catch (err) {
		next(err);
	}
});

app.delete("/clients/:clientId/contacts/:contactId", async (req, res, next) => {
	try {
		const { clientId, contactId } = req.params;
		const context = getUserContext(req);
		const result = await deleteContact(clientId, contactId, context);
		
		if (result.err) {
			return res.status(400).json(
				createErrorResponse(ErrorCodes.DELETE_ERROR, result.err)
			);
		}

		res.status(200).json(createSuccessResponse({ message: result.message || 'Contact deleted successfully' }));
	} catch (err) {
		next(err);
	}
});

// ============================================
// CLIENT NOTES
// ============================================

app.get("/clients/:clientId/notes", async (req, res, next) => {
	try {
		const { clientId } = req.params;
		const notes = await getClientNotes(clientId);
		res.json(createSuccessResponse(notes, { count: notes.length }));
	} catch (err) {
		next(err);
	}
});

app.get("/clients/:clientId/notes/:noteId", async (req, res, next) => {
	try {
		const { clientId, noteId } = req.params;
		const note = await getNoteById(clientId, noteId);

		if (!note) {
			return res.status(404).json(
				createErrorResponse(ErrorCodes.NOT_FOUND, 'Note not found')
			);
		}

		res.json(createSuccessResponse(note));
	} catch (err) {
		next(err);
	}
});

app.post("/clients/:clientId/notes", async (req, res, next) => {
	try {
		const { clientId } = req.params;
		const context = getUserContext(req);	
		const result = await insertNote(clientId, req.body, context);
		
		if (result.err) {
			return res.status(400).json(
				createErrorResponse(ErrorCodes.VALIDATION_ERROR, result.err)
			);
		}

		res.status(201).json(createSuccessResponse(result.item));
	} catch (err) {
		next(err);
	}
});

app.put("/clients/:clientId/notes/:noteId", async (req, res, next) => {
	try {
		const { clientId, noteId } = req.params;
		const context = getUserContext(req);
		const result = await updateNote(clientId, noteId, req.body, context);
		
		if (result.err) {
			return res.status(400).json(
				createErrorResponse(ErrorCodes.VALIDATION_ERROR, result.err)
			);
		}

		res.json(createSuccessResponse(result.item));
	} catch (err) {
		next(err);
	}
});

app.delete("/clients/:clientId/notes/:noteId", async (req, res, next) => {
	try {
		const { clientId, noteId } = req.params;
		const context = getUserContext(req);
		const result = await deleteNote(clientId, noteId, context);
		
		if (result.err) {
			return res.status(400).json(
				createErrorResponse(ErrorCodes.DELETE_ERROR, result.err)
			);
		}

		res.status(200).json(createSuccessResponse({ message: result.message || 'Note deleted successfully' }));
	} catch (err) {
		next(err);
	}
});

// ============================================
// CLIENT JOBS (Read-only)
// ============================================

app.get("/clients/:clientId/jobs", async (req, res, next) => {
	try {
		const { clientId } = req.params;
		const jobs = await getJobsByClientId(clientId);
		res.json(createSuccessResponse(jobs, { count: jobs.length }));
	} catch (err) {
		next(err);
	}
});

// ============================================
// TECHNICIANS
// ============================================

app.get("/technicians", async (req, res, next) => {
	try {
		const technicians = await getAllTechnicians();
		res.json(createSuccessResponse(technicians, { count: technicians.length }));
	} catch (err) {
		next(err);
	}
});

app.get("/technicians/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		const technician = await getTechnicianById(id);

		if (!technician) {
			return res.status(404).json(
				createErrorResponse(ErrorCodes.NOT_FOUND, 'Technician not found')
			);
		}

		res.json(createSuccessResponse(technician));
	} catch (err) {
		next(err);
	}
});

app.post("/technicians", async (req, res, next) => {
	try {
		const context = getUserContext(req);
		const result = await insertTechnician(req.body, context);
		
		if (result.err) {
			const isDuplicate = result.err.toLowerCase().includes('already exists');
			return res.status(isDuplicate ? 409 : 400).json(
				createErrorResponse(
					isDuplicate ? ErrorCodes.CONFLICT : ErrorCodes.VALIDATION_ERROR,
					result.err
				)
			);
		}

		res.status(201).json(createSuccessResponse(result.item));
	} catch (err) {
		next(err);
	}
});

app.put("/technicians/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		const context = getUserContext(req);
		const result = await updateTechnician(id, req.body, context);
		
		if (result.err) {
			const isDuplicate = result.err.toLowerCase().includes('already exists');
			return res.status(isDuplicate ? 409 : 400).json(
				createErrorResponse(
					isDuplicate ? ErrorCodes.CONFLICT : ErrorCodes.VALIDATION_ERROR,
					result.err
				)
			);
		}

		res.json(createSuccessResponse(result.item));
	} catch (err) {
		next(err);
	}
});

app.delete("/technicians/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		const context = getUserContext(req);
		const result = await deleteTechnician(id, context);
		
		if (result.err) {
			return res.status(400).json(
				createErrorResponse(ErrorCodes.DELETE_ERROR, result.err)
			);
		}

		res.status(200).json(createSuccessResponse({ message: result.message || 'Technician deleted successfully', id }));
	} catch (err) {
		next(err);
	}
});

// ============================================
// ERROR HANDLERS (Must be last)
// ============================================

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
	console.log(`✓ Server running on http://localhost:${port}`);
});