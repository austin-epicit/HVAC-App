import { db } from "../db.js";
import type { Prisma } from "../../generated/prisma/client.js";

/**
 * Detailed audit logger - records what changed, who changed it, and when
 * Uses the 'audit_log' table for comprehensive audit trails
 */

export type AuditAction = 'created' | 'updated' | 'deleted';
export type EntityType = 
	| 'client' 
	| 'client_note' 
	| 'client_contact'
	| 'job' 
	| 'job_note' 
	| 'job_visit'
	| 'technician';

export interface AuditLogOptions {
	entityType: EntityType;
	entityId: string;
	action: AuditAction;
	changes?: Record<string, { old: any; new: any }>;
	actorTechId?: string;
	actorDispatcherId?: string;
	reason?: string;
	ipAddress?: string;
	userAgent?: string;
}

/**
 * Create an audit log entry
 * @example 
 * await auditLog({
 *   entityType: 'client',
 *   entityId: client.id,
 *   action: 'updated',
 *   changes: { name: { old: 'ACME', new: 'ACME Corp' } },
 *   actorDispatcherId: '123'
 * })
 */
export const auditLog = async (options: AuditLogOptions): Promise<void> => {
	try {
		await db.audit_log.create({
			data: {
				entity_type: options.entityType,
				entity_id: options.entityId,
				action: options.action,
				actor_tech_id: options.actorTechId || null,
				actor_dispatcher_id: options.actorDispatcherId || null,
				changes: (options.changes || {}) as Prisma.JsonObject,
				reason: options.reason || null,
				ip_address: options.ipAddress || null,
				user_agent: options.userAgent || null,
				timestamp: new Date(),
			},
		});
	} catch (error) {
		console.error('[AUDIT] Failed to create audit log:', error);
	}
};

/**
 * Helper: Calculate changes between old and new objects
 * @example 
 * const changes = calculateChanges(
 *   { name: 'ACME', address: '123 Main' },
 *   { name: 'ACME Corp', address: '123 Main' }
 * )
 * // Returns: { name: { old: 'ACME', new: 'ACME Corp' } }
 */
export const calculateChanges = <T extends Record<string, any>>(
	oldObj: T,
	newObj: Partial<T>
): Record<string, { old: any; new: any }> => {
	const changes: Record<string, { old: any; new: any }> = {};
	
	for (const key in newObj) {
		if (newObj[key] !== undefined && oldObj[key] !== newObj[key]) {
			// Skip if values are equal (handles primitives)
			if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
				changes[key] = {
					old: oldObj[key],
					new: newObj[key],
				};
			}
		}
	}
	
	return changes;
};

export const getEntityAuditHistory = async (
	entityType: EntityType,
	entityId: string
) => {
	return await db.audit_log.findMany({
		where: {
			entity_type: entityType,
			entity_id: entityId,
		},
		orderBy: { timestamp: 'desc' },
		include: {
			actor_tech: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
			actor_dispatcher: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
		},
	});
};

export const getRecentAuditLogs = async (limit: number = 50) => {
	return await db.audit_log.findMany({
		take: limit,
		orderBy: { timestamp: 'desc' },
		include: {
			actor_tech: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
			actor_dispatcher: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
		},
	});
};

export const getUserAuditLogs = async (
	userId: string,
	userType: 'tech' | 'dispatcher'
) => {
	return await db.audit_log.findMany({
		where: userType === 'tech'
			? { actor_tech_id: userId }
			: { actor_dispatcher_id: userId },
		orderBy: { timestamp: 'desc' },
		take: 100,
	});
};