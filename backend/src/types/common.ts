export type LineItemToCreate = {
	name: string;
	description: string | null;
	quantity: number;
	unit_price: number;
	total: number;
	source: "quote" | "job" | "manual" | "field_addition";
	item_type: string | null;
};
//for logging
export type ChangeSet = Record<string, { old: any; new: any }>;
