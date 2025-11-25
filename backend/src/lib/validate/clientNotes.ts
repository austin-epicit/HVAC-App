// model client_note {
//   id         String @unique @id @default(uuid())
//   client_id  String
//   tech_id          String? 
//   dispatcher_id    String?
//   content    String
//   created_at DateTime @default(now())
//   updated_at DateTime?
//   client     client @relation(fields: [client_id], references: [id])
// }
import z from "zod";

export const createNoteSchema = z.object({
	content: z.string().min(1, "Note content is required"),
});

export const updateNoteSchema = z.object({
	content: z.string().min(1, "Note content is required"),
});
