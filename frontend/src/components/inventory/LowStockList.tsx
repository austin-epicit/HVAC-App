import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, AlertTriangle, Package, MapPin } from "lucide-react";
import type { InventoryItem } from "../../types/inventory";

interface LowStockListProps {
	items: InventoryItem[];
}

function getStockConfig(quantity: number) {
	if (quantity === 0) {
		return {
			border: 'border-l-red-500',
			text: 'text-red-400',
		};
	}
	return {
		border: 'border-l-yellow-500',
		text: 'text-yellow-400',
	};
}

export default function LowStockList({ items }: LowStockListProps) {
	const [isCollapsed, setIsCollapsed] = useState(false);

	// Filter and sort by low stock and out of stock as well as quantity
	const lowStockItems = useMemo(() => {
		return items
			.filter(item => {
				if (item.low_stock_threshold === null) return false;
				return item.quantity <= item.low_stock_threshold;
			})
			.sort((a, b) => a.quantity - b.quantity);
	}, [items]);

	const lowStockCount = lowStockItems.length;
	const outOfStockCount = lowStockItems.filter(item => item.quantity === 0).length;

	return (
		<>
			{/* Panel */}
			<div
				className={`
					fixed top-16 right-0 h-[calc(100vh-4rem)] bg-zinc-900/95 backdrop-blur-sm
					border-l border-zinc-700/50 shadow-2xl shadow-black/50
					transition-all duration-300 ease-in-out z-40
					${isCollapsed ? "w-12" : "w-80 sm:w-96"}
				`}
			>
				{/* Toggle Button */}
				<button
					onClick={() => setIsCollapsed(!isCollapsed)}
					className="absolute -left-3 top-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white p-1.5 rounded-full border border-zinc-600 shadow-lg transition-all z-50"
					aria-label={isCollapsed ? "Expand panel" : "Collapse panel"}
				>
					{isCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
				</button>

				{/* Expanded Content */}
				{!isCollapsed && (
					<div className="h-full flex flex-col overflow-hidden">
						{/* Header */}
						<div className="px-5 pt-5 pb-4 border-b border-zinc-800">
							<div className="flex items-center justify-between mb-1">
								<h3 className="text-base font-semibold text-white flex items-center gap-2">
									<AlertTriangle size={18} className="text-yellow-500" />
									Low Stock
								</h3>
								{/* Badges */}
								<div className="flex items-center gap-1.5">
									{outOfStockCount > 0 && (
										<span className="bg-red-500/20 text-red-400 text-xs font-semibold px-2 py-0.5 rounded-full">
											{outOfStockCount} out
										</span>
									)}
									<span className="bg-zinc-700 text-zinc-300 text-xs font-medium px-2 py-0.5 rounded-full">
										{lowStockCount}
									</span>
								</div>
							</div>
							<p className="text-xs text-zinc-500">
								Items requiring restock
							</p>
						</div>

						{/* Items List */}
						<div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin">
							{lowStockCount === 0 ? (
								<div className="flex flex-col items-center justify-center h-full text-center px-4">
									<div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
										<Package size={24} className="text-green-500" />
									</div>
									<p className="text-zinc-300 text-sm font-medium mb-1">
										All stocked up
									</p>
									<p className="text-zinc-500 text-xs">
										No items below threshold
									</p>
								</div>
							) : (
								<div className="space-y-2.5">
									{lowStockItems.map((item) => {
										const config = getStockConfig(item.quantity);

										return (
											<div
												key={item.id}
												className={`
													relative rounded-lg border-l-2 ${config.border}
													bg-zinc-800/60 hover:bg-zinc-800
													transition-colors cursor-pointer group
												`}
											>
												<div className="p-3">
													{/* Top row */}
													<div className="flex items-start gap-3">
														{/* Quantity */}
														<div className={`text-center min-w-[3rem] ${config.text}`}>
															<span className="text-2xl font-bold leading-none">
																{item.quantity}
															</span>
															<span className="block text-[10px] uppercase tracking-wide opacity-70 mt-0.5">
																left
															</span>
														</div>

														{/* Item details */}
														<div className="flex-1 min-w-0">
															<h4 className="text-sm font-medium text-white leading-snug line-clamp-2 mb-1.5">
																{item.name}
															</h4>

															{/* Location */}
															<div className="flex items-center gap-1 text-zinc-500">
																<MapPin size={10} />
																<span className="text-xs truncate">
																	{item.location}
																</span>
															</div>
														</div>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</div>
					</div>
				)}

				{/* Collapsed State */}
				{isCollapsed && (
					<div className="flex flex-col items-center pt-16 gap-3">
						<AlertTriangle
							size={18}
							className={outOfStockCount > 0 ? "text-red-500" : "text-yellow-500"}
						/>
						{lowStockCount > 0 && (
							<span className={`
								text-xs font-bold px-1.5 py-0.5 rounded
								${outOfStockCount > 0
									? 'bg-red-500/20 text-red-400'
									: 'bg-yellow-500/20 text-yellow-400'
								}
							`}>
								{lowStockCount}
							</span>
						)}
					</div>
				)}
			</div>

			{/* Scrollbar */}
			<style>{`
				.scrollbar-thin::-webkit-scrollbar {
					width: 4px;
				}
				.scrollbar-thin::-webkit-scrollbar-track {
					background: transparent;
				}
				.scrollbar-thin::-webkit-scrollbar-thumb {
					background: rgb(63 63 70);
					border-radius: 2px;
				}
				.scrollbar-thin::-webkit-scrollbar-thumb:hover {
					background: rgb(82 82 91);
				}
			`}</style>
		</>
	);
}
