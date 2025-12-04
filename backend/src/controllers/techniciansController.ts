import { ZodError } from "zod";
import { db } from "../db.js";
import { createTechnicianSchema, updateTechnicianSchema } from "../lib/validate/technicians.js";

export const getAllTechnicians = async () => {
	return await db.technician.findMany({
		include: {
			job_tech: {
				include: {
					job: true,
				},
			},
			logs: true,
			audit_logs: true,
			created_client_notes: true,
			last_edited_client_notes: true,
			created_job_notes: true,
			last_edited_job_notes: true,
		},
	});
};

export const getTechnicianById = async (id: string) => {
	return await db.technician.findFirst({
		where: { id: id },
		include: {
			job_tech: {
				include: {
					job: true,
				},
			},
			logs: true,
			audit_logs: true,
			created_client_notes: true,
			last_edited_client_notes: true,
			created_job_notes: true,
			last_edited_job_notes: true,
		},
	});
};

export const insertTechnician = async (data: unknown) => {
	try {
		const parsed = createTechnicianSchema.parse(data);

		const created = await db.$transaction(async (tx) => {
			// Check if email already exists
			const existingTech = await tx.technician.findUnique({
				where: { email: parsed.email },
			});
			if (existingTech) {
				throw new Error("Email already exists");
			}

			const technician = await tx.technician.create({
				data: {
					name: parsed.name,
					email: parsed.email,
					phone: parsed.phone,
					password: parsed.password, 
					title: parsed.title,
					description: parsed.description,
					status: parsed.status,
					hire_date: parsed.hire_date,
					last_login: new Date(),
				} as any,
			});

			return tx.technician.findUnique({
				where: { id: technician.id },
				include: {
					job_tech: {
						include: {
							job: true,
						},
					},
					logs: true,
					audit_logs: true,
					created_client_notes: true,
					last_edited_client_notes: true,
					created_job_notes: true,
					last_edited_job_notes: true,
				},
			});
		});

		return { err: "", item: created };
	} catch (e) {
		console.error("Insert technician error:", e);
		if (e instanceof ZodError) {
			return {
				err: `Validation failed: ${e.issues
					.map((err) => err.message)
					.join(", ")}`,
			};
		}
		if (e instanceof Error && e.message === "Email already exists") {
			return { err: "Email already exists" };
		}
		return { err: "Internal server error" };
	}
};

export const updateTechnician = async (id: string, data: unknown) => {
	try {
		const parsed = updateTechnicianSchema.parse(data);

		const existing = await db.technician.findUnique({ where: { id } });
		if (!existing) {
			return { err: "Technician not found" };
		}

		// Check email uniqueness if email is being updated
		if (parsed.email && parsed.email !== existing.email) {
			const emailExists = await db.technician.findUnique({
				where: { email: parsed.email },
			});
			if (emailExists) {
				return { err: "Email already exists" };
			}
		}

		const updated = await db.$transaction(async (tx) => {
			const technician = await tx.technician.update({
				where: { id },
				data: {
					...(parsed.name !== undefined && { name: parsed.name }),
					...(parsed.email !== undefined && { email: parsed.email }),
					...(parsed.phone !== undefined && { phone: parsed.phone }),
					...(parsed.password !== undefined && { password: parsed.password }), 
					...(parsed.title !== undefined && { title: parsed.title }),
					...(parsed.description !== undefined && { description: parsed.description }),
					...(parsed.status !== undefined && { status: parsed.status }),
					...(parsed.hire_date !== undefined && { hire_date: parsed.hire_date }),
					...(parsed.last_login !== undefined && { last_login: parsed.last_login }),
				},
			});

			return tx.technician.findUnique({
				where: { id: technician.id },
				include: {
					job_tech: {
						include: {
							job: true,
						},
					},
					logs: true,
					audit_logs: true,
					created_client_notes: true,
					last_edited_client_notes: true,
					created_job_notes: true,
					last_edited_job_notes: true,
				},
			});
		});

		return { err: "", item: updated ?? undefined };
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

export const deleteTechnician = async (id: string) => {
	try {
		const existing = await db.technician.findUnique({ where: { id } });
		if (!existing) {
			return { err: "Technician not found" };
		}

		await db.$transaction(async (tx) => {
			// Note: We cannot delete job_technician records as jobs may still need to exist, remove the technician from jobs instead
			await tx.job_technician.deleteMany({ where: { tech_id: id } });
			
			// Update notes to remove technician references (set to null)
			await tx.client_note.updateMany({
				where: { 
					OR: [
						{ creator_tech_id: id },
						{ last_editor_tech_id: id }
					]
				},
				data: {
					creator_tech_id: null,
					last_editor_tech_id: null,
				},
			});

			await tx.job_note.updateMany({
				where: { 
					OR: [
						{ creator_tech_id: id },
						{ last_editor_tech_id: id }
					]
				},
				data: {
					creator_tech_id: null,
					last_editor_tech_id: null,
				},
			});

			// Delete Log but Keep audit_logs for compliance but they'll be orphaned
			await tx.log.deleteMany({ where: { tech_id: id } });
		
			await tx.technician.delete({ where: { id } });
		});
		return { err: "", message: "Technician deleted successfully" };
	} catch (error) {
		console.error("Delete technician error:", error);
		return { err: "Failed to delete technician. It may have related records." };
	}
};