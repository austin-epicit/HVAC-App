import { Job } from "../types/jobs";
import { db } from "../db.js";

export const getAllJobs = async () => {
	return await db.job.findMany();
};

export const getJobById = async (id: string) => {
	return await db.job.findFirst({ where: { id: id } });
};

export const getJobsByClientId = async (clientId: string) => {
	return await db.job.findMany({
		where: { client_id: clientId },
		include: { job_tech: true },
	});
};
