/*model job_note {
  id               String      @id @default(uuid())
  job_id           String
  tech_id          String?
  dispatcher_id    String?
  content          String      @db.Text
  created_at       DateTime    @default(now())
  updated_at       DateTime    @updatedAt
  job              job         @relation(fields: [job_id], references: [id], onDelete: Cascade)
  tech             technician? @relation(fields: [tech_id], references: [id])
  dispatcher       dispatcher? @relation(fields: [dispatcher_id], references: [id])
  @@index([job_id])
  @@index([tech_id])
  @@index([dispatcher_id])
}*/
import z from "zod";

export const createJobNoteSchema = z.object({
	content: z.string().min(1, "Note content is required"),
	tech_id: z.string().uuid().nullable().optional(),
	dispatcher_id: z.string().uuid().nullable().optional(),
  visit_id: z.string().uuid("Invalid visit ID").optional(),
});

export const updateJobNoteSchema = z.object({
	content: z.string().min(1, "Note content is required"),
	tech_id: z.string().uuid().nullable().optional(),
	dispatcher_id: z.string().uuid().nullable().optional(),
  visit_id: z.string().uuid("Invalid visit ID").optional().nullable(),
});