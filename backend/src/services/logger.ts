import { db } from "../db.js";

/**
 * Simple activity logger - records high-level user actions
 * Uses the 'log' table for basic activity tracking
 */

export interface LogOptions {
	description: string;
	techId?: string;
	dispatcherId?: string;
}

/**
 * Log a user action
 * @example await logAction({ description: "Created client 'ACME Corp'", dispatcherId: "123" })
 */
export const logAction = async (options: LogOptions): Promise<void> => {
	try {
		await db.log.create({
			data: {
				description: options.description,
				tech_id: options.techId || null,
				dispatcher_id: options.dispatcherId || null,
				created_at: new Date(),
			},
		});
	} catch (error) {
		console.error('[LOGGER] Failed to log action:', error);
	}
};

export const getRecentLogs = async (limit: number = 50) => {
	return await db.log.findMany({
		take: limit,
		orderBy: { created_at: 'desc' },
		include: {
			tech: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
			dispatcher: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
		},
	});
};

export const getUserLogs = async (userId: string, userType: 'tech' | 'dispatcher') => {
	return await db.log.findMany({
		where: userType === 'tech' 
			? { tech_id: userId }
			: { dispatcher_id: userId },
		orderBy: { created_at: 'desc' },
		take: 100,
	});
};