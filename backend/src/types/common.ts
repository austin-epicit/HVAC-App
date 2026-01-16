export type LineItemToCreate = {
	name: string;
	description: string | null;
	quantity: number;
	unit_price: number;
	total: number;
	source: "quote" | "recurring_plan" | "manual" | "field_addition";
	item_type: "labor" | "material" | "equipment" | "other" | null;
};
//for logging
export type ChangeSet = Record<string, { old: any; new: any }>;
