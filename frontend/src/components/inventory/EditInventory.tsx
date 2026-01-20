import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { InventoryItem } from "../../types/inventory";
import { useUpdateItemThresholdMutation } from "../../hooks/useInventory";

interface EditInventoryProps {
	isOpen: boolean;
	onClose: () => void;
	item: InventoryItem;
}

export default function EditInventory({isOpen,onClose,item,}: EditInventoryProps) {
	const [threshold, setThreshold] = useState<number | null>(
		item.low_stock_threshold);
	const updateThreshold = useUpdateItemThresholdMutation();

	useEffect(() => {
		if (isOpen) {
			setThreshold(item.low_stock_threshold);
		}
	}, [isOpen, item]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			await updateThreshold.mutateAsync({
				itemId: item.id,
				threshold: threshold,
			});
			onClose();
		} catch (error) {
			console.error("Failed to update threshold:", error);
		}
	};

	const handleClearThreshold = () => {
		setThreshold(null);
	};

	const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
			onClick={handleBackdropClick}
		>
			<div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md border border-zinc-800 max-h-[90vh] overflow-y-auto scrollbar-hide">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-2xl font-bold text-white">
						Set Low Stock Threshold
					</h2>
					<button
						onClick={onClose}
						className="text-zinc-400 hover:text-white transition-colors"
					>
						<X size={24} />
					</button>
				</div>

				<div className="mb-4">
					<h3 className="text-lg font-semibold text-white mb-2">
						{item.name}
					</h3>
					<p className="text-sm text-zinc-400">
						Current Quantity: <span className="text-white font-medium">{item.quantity}</span>
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
   					    <label htmlFor="threshold" className="block mb-1 text-zinc-300">Low Stock Threshold</label>
						<p className="text-xs text-zinc-500 mb-2">
							You'll be notified when quantity falls below this value
						</p>
						<input
							id = "threshold"
							type="number"
							min="0"
							value={threshold ?? ""}
							onChange={(e) =>
								setThreshold(
									e.target.value
										? Number(e.target.value)
										: null
								)
							}
							placeholder="Enter threshold value"
							className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<button
						type="button"
						onClick={handleClearThreshold}
						className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md transition-colors text-sm"
					>
						Clear Threshold (No Alerts)
					</button>

					<div className="flex gap-3 pt-4">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={updateThreshold.isPending}
							className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-md transition-colors"
						>
							{updateThreshold.isPending
								? "Saving..."
								: "Save Threshold"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
