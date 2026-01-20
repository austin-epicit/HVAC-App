import { useState } from "react";
import InventoryCard from "../../components/inventory/InventoryCard";
import LowStockList from "../../components/inventory/LowStockList";
import EditInventory from "../../components/inventory/EditInventory";
import { useAllInventoryQuery } from "../../hooks/useInventory";
import type { InventoryItem } from "../../types/inventory";
import LoadSvg from "../../assets/icons/loading.svg?react";

// Dummy Data
const dummyDesc = "";
const DUMMY_ITEMS: InventoryItem[] = [
		{
			id: "4",
			name: "24in PVC Elbow",
			description: dummyDesc,
			location: "A42 - 325",
			quantity: 14,
			low_stock_threshold: 10,
		},
		{
			id: "5",
			name: "Industrial Tape Roll",
			description: dummyDesc,
			location: "A42 - 326",
			quantity: 57,
			low_stock_threshold: 10,
		},
		{
			id: "6",
			name: "Metal Bracket L-Shape",
			description: dummyDesc,
			location: "A42 - 327",
			quantity: 240,
			low_stock_threshold: 10,
		},
		{
			id: "7",
			name: "Rubber Gasket 4in",
			description: dummyDesc,
			location: "A42 - 328",
			quantity: 96,
			low_stock_threshold: 10,
		},
		{
			id: "8",
			name: "Steel Coupling 2in",
			description: dummyDesc,
			location: "A42 - 329",
			quantity: 33,
			low_stock_threshold: 10,
		},
		{
			id: "9",
			name: "Silicone Sealant Tube",
			description: dummyDesc,
			location: "A42 - 330",
			quantity: 0,
			low_stock_threshold: 10,
		},
		{
			id: "10",
			name: "Hex Bolts (1/4in)",
			description: dummyDesc,
			location: "A42 - 331",
			quantity: 4,
			low_stock_threshold: 10,
		},
		{
			id: "11",
			name: "Plastic End Cap 8in",
			description: dummyDesc,
			location: "A42 - 332",
			quantity: 0,
			low_stock_threshold: 10,
		},
		{
			id: "12",
			name: "Brake Cleaner Spray",
			description: dummyDesc,
			location: "A42 - 333",
			quantity: 11,
			low_stock_threshold: 15,
		},
		{
			id: "13",
			name: "Threadlocker Blue",
			description: dummyDesc,
			location: "A42 - 334",
			quantity: 9,
			low_stock_threshold: 10,
		},
	];

export default function InventoryPage() {
	const {
		data: _inventoryItems = [],
		isLoading,
		error,
	} = useAllInventoryQuery();

	// Use Dummy Data to show for right now use this const items = _inventoryItems and remove underscore on apiItems;
	const items = DUMMY_ITEMS;

	const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-full">
				<LoadSvg className="w-12 h-12 animate-spin text-blue-500" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center h-full text-red-400">
				Failed to load inventory: {error.message}
			</div>
		);
	}

	return (
		<div className="flex h-full text-white">
			{/* Main content*/}
			<div className="flex-1 overflow-auto p-4 mr-14">
				<div className="flex flex-wrap items-center justify-between gap-4 mb-2">
					<h2 className="text-2xl font-semibold">Inventory</h2>
					<div className="w-full flex flex-wrap gap-3">
						{items.map((item) => (
							<InventoryCard
								key={item.id}
								item={item}
								onEditThreshold={() => setEditingItem(item)}
							/>
						))}
					</div>
				</div>
			</div>

			{/* Low Stock Sidebar */}
			<LowStockList items={items} />

			{/* Edit Threshold Modal */}
			{editingItem && (
				<EditInventory
					isOpen={!!editingItem}
					onClose={() => setEditingItem(null)}
					item={editingItem}
				/>
			)}
		</div>
	);
}
