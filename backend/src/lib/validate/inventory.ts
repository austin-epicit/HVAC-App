import z from "zod";

export const updateThresholdSchema = z.object({
    low_stock_threshold: z.number().int().min(0, "Threshold must not be negative").nullable().optional(),
});

export type UpdateThresholdInput = z.infer<typeof updateThresholdSchema>;
