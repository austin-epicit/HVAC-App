import InventoryCard from "../../components/inventory/InventoryCard";
import type { InventoryItem } from "../../types/inventory";

export default function InventoryPage() {
	const dummyDesc =
		"At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident";

	const items: InventoryItem[] = [
		{
			id: "4",
			name: "24in PVC Elbow",
			description: dummyDesc,
			location: "A42 - 325",
			quantity: 14,
		},
		{
			id: "5",
			name: "Industrial Tape Roll",
			description: dummyDesc,
			location: "A42 - 326",
			quantity: 57,
		},
		{
			id: "6",
			name: "Metal Bracket L-Shape",
			description: dummyDesc,
			location: "A42 - 327",
			quantity: 240,
		},
		{
			id: "7",
			name: "Rubber Gasket 4in",
			description: dummyDesc,
			location: "A42 - 328",
			quantity: 96,
		},
		{
			id: "8",
			name: "Steel Coupling 2in",
			description: dummyDesc,
			location: "A42 - 329",
			quantity: 33,
		},
		{
			id: "9",
			name: "Silicone Sealant Tube",
			description: dummyDesc,
			location: "A42 - 330",
			quantity: 18,
		},
		{
			id: "10",
			name: "Hex Bolts (1/4in)",
			description: dummyDesc,
			location: "A42 - 331",
			quantity: 520,
		},
		{
			id: "11",
			name: "Plastic End Cap 8in",
			description: dummyDesc,
			location: "A42 - 332",
			quantity: 41,
		},
		{
			id: "12",
			name: "Brake Cleaner Spray",
			description: dummyDesc,
			location: "A42 - 333",
			quantity: 27,
		},
		{
			id: "13",
			name: "Threadlocker Blue",
			description: dummyDesc,
			location: "A42 - 334",
			quantity: 11,
		},
	];

	return (
		<div className="text-white">
			<div className="flex flex-wrap items-center justify-between gap-4 mb-2">
				<h2 className="text-2xl font-semibold">Inventory</h2>
				<div className="w-full flex flex-wrap gap-3">
					{items.map((i) => (
						<InventoryCard key={i.id} item={i} />
					))}
				</div>
			</div>
		</div>
	);
}
