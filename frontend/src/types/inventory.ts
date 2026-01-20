export type StockStatus = 'sufficient' | 'low' | 'out_of_stock' | null;

export interface InventoryItem {
	id: string;
	name: string;
	description: string;
	location: string;
	quantity: number;
	low_stock_threshold: number | null;
	stock_status?: StockStatus;
}
