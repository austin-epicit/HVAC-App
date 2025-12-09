import { ZodError } from "zod";
import { db } from "../db.js";
import {
	createTechnicianSchema,
	updateTechnicianSchema,
} from "../lib/validate/technicians.js";

export const getAllTechnicians = async () => {
	return await db.technician.findMany({
		include: {
			visit_techs: {
				include: {
					visit: {
						include: {
							job: {
								include: {
									client: true,
								},
							},
						},
					},
				},
			},
		},
	});
};

export const getTechnicianById = async (id: string) => {
	return await db.technician.findUnique({
		where: { id },
		include: {
			visit_techs: {
				include: {
					visit: {
						include: {
							job: {
								include: {
									client: true,
								},
							},
						},
					},
				},
			},
		},
	});
};

export const insertTechnician = async (data: unknown) => {
	try {
		const parsed = createTechnicianSchema.parse(data);

		// Check if email already exists
		const existing = await db.technician.findUnique({
			where: { email: parsed.email },
		});

		if (existing) {
			return { err: "Email already exists" };
		}

		const created = await db.technician.create({
			data: {
				name: parsed.name,
				email: parsed.email,
				phone: parsed.phone,
				password: parsed.password,
				title: parsed.title,
				description: parsed.description,
				status: parsed.status,
				hire_date: parsed.hire_date,
				coords: parsed.coords,
			},
			include: {
				visit_techs: {
					include: {
						visit: {
							include: {
								job: {
									include: {
										client: true,
									},
								},
							},
						},
					},
				},
			},
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
		console.error("Error inserting technician:", e);
		return { err: "Internal server error" };
	}
};

export const updateTechnician = async (id: string, data: unknown) => {
	try {
		const parsed = updateTechnicianSchema.parse(data);

		// Verify technician exists
		const existing = await db.technician.findUnique({
			where: { id },
		});

		if (!existing) {
			return { err: "Technician not found" };
		}

		// If updating email, check if new email is already taken
		if (parsed.email && parsed.email !== existing.email) {
			const emailTaken = await db.technician.findUnique({
				where: { email: parsed.email },
			});

			if (emailTaken) {
				return { err: "Email already exists" };
			}
		}

		const updateData: any = {};

		// Only update provided fields
		if (parsed.name !== undefined) updateData.name = parsed.name;
		if (parsed.email !== undefined) updateData.email = parsed.email;
		if (parsed.phone !== undefined) updateData.phone = parsed.phone;
		if (parsed.password !== undefined)
			updateData.password = parsed.password;
		if (parsed.title !== undefined) updateData.title = parsed.title;
		if (parsed.description !== undefined)
			updateData.description = parsed.description;
		if (parsed.status !== undefined) updateData.status = parsed.status;
		if (parsed.hire_date !== undefined)
			updateData.hire_date = parsed.hire_date;

		const updated = await db.technician.update({
			where: { id },
			data: updateData,
			include: {
				visit_techs: {
					include: {
						visit: {
							include: {
								job: {
									include: {
										client: true,
									},
								},
							},
						},
					},
				},
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
		console.error("Error updating technician:", e);
		return { err: "Internal server error" };
	}
};

export const deleteTechnician = async (id: string) => {
	try {
		// Verify technician exists
		const existing = await db.technician.findUnique({
			where: { id },
		});

		if (!existing) {
			return { err: "Technician not found" };
		}

		// Check if technician has any scheduled visits
		const upcomingVisits = await db.job_visit_technician.count({
			where: {
				tech_id: id,
				visit: {
					status: {
						in: ["Scheduled", "InProgress"],
					},
				},
			},
		});

		if (upcomingVisits > 0) {
			return {
				err: `Cannot delete technician with ${upcomingVisits} scheduled or in-progress visits`,
			};
		}

		await db.$transaction(async (tx) => {
			// Delete visit assignments
			await tx.job_visit_technician.deleteMany({
				where: { tech_id: id },
			});

			// Delete the technician
			await tx.technician.delete({
				where: { id },
			});
		});

		return { err: "", message: "Technician deleted successfully" };
	} catch (error) {
		console.error("Error deleting technician:", error);
		return { err: "Internal server error" };
	}
};
