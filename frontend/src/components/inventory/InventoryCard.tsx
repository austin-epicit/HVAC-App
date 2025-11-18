import type { InventoryItem } from "../../types/inventory";

interface InventoryCardProps {
	item: InventoryItem;
}

const InventoryCard = ({ item }: InventoryCardProps) => {
	return (
		<div className="p-5 w-70 bg-zinc-900 rounded-xl shadow-md border border-[#3a3a3f]">
			<img
				src={"./"}
				className="h-30 w-full border border-[#3a3a3f] mb-2 rounded-md"
			/>
			<h1 className="font-bold text-lg">{item.name}</h1>
			<p className="line-clamp-2 text-zinc-300">{item.description}</p>
			<hr className="my-2 text-zinc-600"></hr>
			<div className="flex">
				<div>
					<h2 className="font-semibold">Location</h2>
					<h3 className="text-zinc-300">{item.location}</h3>
				</div>
				<div className="flex-1 mx-3"></div>
				<div>
					<h2 className="font-semibold">Quantity</h2>
					<h3 className="text-zinc-300">{item.quantity}</h3>
				</div>
			</div>
		</div>
	);
};

export default InventoryCard;
