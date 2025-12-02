import { ZodError } from "zod";
import { db } from "../db.js";
import { createJobNoteSchema, updateJobNoteSchema } from "../lib/validate/jobNotes.js";

export const getJobNotes = async (jobId: string) => {
	return await db.job_note.findMany({
		where: { job_id: jobId },
		orderBy: { created_at: 'desc' }
	});
};

export const getNoteById = async (jobId: string, noteId: string) => {
	return await db.job_note.findFirst({
		where: { 
			id: noteId,
			job_id: jobId 
		}
	});
};

export const insertJobNote = async (jobId: string, data: unknown) => {
	try {
		const parsed = createJobNoteSchema.parse(data);

		// Verify job exists
		const job = await db.job.findUnique({ where: { id: jobId } });
		if (!job) {
			return { err: "Job not found" };
		}

		const created = await db.job_note.create({
			data: {
				job_id: jobId,
				content: parsed.content,
			}
		});

		return { err: "", item: created };
	} catch (e) {
		if (e instanceof ZodError) {
			return {
				err: `Validation failed: ${e.issues
					.map((err) => err.message)
					.join(", ")}`,
			};
		}
		return { err: "Internal server error" };
	}
};

export const updateJobNote = async (jobId: string, noteId: string, data: unknown) => {
	try {
		const parsed = updateJobNoteSchema.parse(data);

		// Check if note exists and belongs to job
		const existing = await db.job_note.findFirst({
			where: { 
				id: noteId,
				job_id: jobId 
			}
		});

		if (!existing) {
			return { err: "Note not found" };
		}

		const updated = await db.job_note.update({
			where: { id: noteId },
			data: {
				content: parsed.content,
			},
		});

		return { err: "", item: updated };
	} catch (e) {
		if (e instanceof ZodError) {
			return {
				err: `Validation failed: ${e.issues
					.map((err) => err.message)
					.join(", ")}`,
			};
		}
		return { err: "Internal server error" };
	}
};

export const deleteJobNote = async (jobId: string, noteId: string) => {
	try {
		// Check if note exists and belongs to job
		const existing = await db.job_note.findFirst({
			where: { 
				id: noteId,
				job_id: jobId 
			}
		});

		if (!existing) {
			return { err: "Note not found" };
		}

		await db.job_note.delete({
			where: { id: noteId }
		});

		return { err: "", message: "Note deleted successfully" };
	} catch (error) {
		return { err: "Internal server error" };
	}
};