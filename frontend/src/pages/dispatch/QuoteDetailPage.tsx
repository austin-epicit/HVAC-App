import { useParams, useNavigate } from "react-router-dom";
import {
	Edit2,
	User,
	Calendar,
	MapPin,
	MoreVertical,
	FileText,
	Phone,
	Mail,
	Package,
	Briefcase,
} from "lucide-react";
import { useQuoteByIdQuery } from "../../hooks/useQuotes";
import { useCreateJobMutation } from "../../hooks/useJobs";
import Card from "../../components/ui/Card";
import EditQuote from "../../components/quotes/EditQuote";
import ConvertToJob from "../../components/quotes/ConvertToJob";
import { useState, useRef, useEffect } from "react";
import { QuoteStatusColors, QuotePriorityColors } from "../../types/quotes";

export default function QuoteDetailPage() {
	const { quoteId } = useParams<{ quoteId: string }>();
	const navigate = useNavigate();
	const { data: quote, isLoading } = useQuoteByIdQuery(quoteId!);
	const { mutateAsync: createJob } = useCreateJobMutation();
	const [showActionsMenu, setShowActionsMenu] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isConvertToJobModalOpen, setIsConvertToJobModalOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setShowActionsMenu(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-white text-lg">Loading quote details...</div>
			</div>
		);
	}

	if (!quote) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-white text-lg">Quote not found</div>
			</div>
		);
	}

	// Get primary contact from client
	const primaryContact = quote.client?.contacts?.find((cc: any) => cc.is_primary)?.contact;

	const getStatusColor = (status: string) => {
		return (
			QuoteStatusColors[status as keyof typeof QuoteStatusColors] ||
			QuoteStatusColors.Draft
		);
	};

	const getPriorityColor = (priority: string) => {
		return (
			QuotePriorityColors[priority as keyof typeof QuotePriorityColors] ||
			QuotePriorityColors.Medium
		);
	};

	const formatCurrency = (amount: number | string) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(Number(amount));
	};

	const formatDate = (date: Date | string | null) => {
		if (!date) return "Not set";
		return new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	return (
		<div className="text-white space-y-6">
			{/* Header */}
			<div className="grid grid-cols-2 gap-4 mb-6 items-center">
				<div>
					<h1 className="text-3xl font-bold text-white">
						{quote.title}
					</h1>
					<p className="text-sm text-zinc-400 mt-1 font-mono">
						{quote.quote_number}
					</p>
				</div>

				<div className="justify-self-end flex items-center gap-3">
					<span
						className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(
							quote.status
						)}`}
					>
						{quote.status}
					</span>

					<span
						className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${getPriorityColor(
							quote.priority
						)}`}
					>
						{quote.priority}
					</span>

					{/* Actions Menu */}
					<div className="relative" ref={menuRef}>
						<button
							onClick={() =>
								setShowActionsMenu(!showActionsMenu)
							}
							className="p-2 hover:bg-zinc-800 rounded-md transition-colors"
						>
							<MoreVertical size={20} />
						</button>

						{showActionsMenu && (
							<div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50">
								<div className="py-1">
									<button
										onClick={() => {
											setShowActionsMenu(
												false
											);
											setIsEditModalOpen(
												true
											);
										}}
										className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-800 transition-colors flex items-center gap-2"
									>
										<Edit2 size={16} />
										Edit Quote
									</button>
									<button
										onClick={() => {
											console.log(
												"Send quote"
											);
											setShowActionsMenu(
												false
											);
										}}
										className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-800 transition-colors flex items-center gap-2"
									>
										<Mail size={16} />
										Send to Client
									</button>
									<button
										onClick={() => {
											console.log(
												"Approve quote"
											);
											setShowActionsMenu(
												false
											);
										}}
										className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-800 transition-colors flex items-center gap-2"
									>
										<FileText
											size={16}
										/>
										Mark as Approved
									</button>
									<button
										onClick={() => {
											setShowActionsMenu(
												false
											);
											setIsConvertToJobModalOpen(
												true
											);
										}}
										className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-800 transition-colors flex items-center gap-2"
									>
										<Briefcase
											size={16}
										/>
										Convert to Job
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Quote Information (2/3) and Client Details (1/3) */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Quote Information - 2/3 width */}
				<div className="lg:col-span-2">
					<Card title="Quote Information" className="h-full">
						<div className="space-y-4">
							<div>
								<h3 className="text-zinc-400 text-sm mb-1">
									Description
								</h3>
								<p className="text-white break-words">
									{quote.description ||
										"No description provided"}
								</p>
							</div>

							{quote.address && (
								<div>
									<h3 className="text-zinc-400 text-sm mb-1 flex items-center gap-2">
										<MapPin size={14} />
										Property Address
									</h3>
									<p className="text-white break-words">
										{quote.address}
									</p>
								</div>
							)}

							<div className="grid grid-cols-2 gap-4">
								<div>
									<h3 className="text-zinc-400 text-sm mb-1 flex items-center gap-2">
										<Calendar
											size={14}
										/>
										Created
									</h3>
									<p className="text-white">
										{formatDate(
											quote.created_at
										)}
									</p>
								</div>
								{quote.sent_at && (
									<div>
										<h3 className="text-zinc-400 text-sm mb-1">
											Sent
										</h3>
										<p className="text-white">
											{formatDate(
												quote.sent_at
											)}
										</p>
									</div>
								)}
							</div>

							{quote.valid_until && (
								<div>
									<h3 className="text-zinc-400 text-sm mb-1">
										Valid Until
									</h3>
									<p className="text-white">
										{formatDate(
											quote.valid_until
										)}
									</p>
								</div>
							)}

							{quote.expires_at && (
								<div>
									<h3 className="text-zinc-400 text-sm mb-1">
										Expires At
									</h3>
									<p className="text-white">
										{formatDate(
											quote.expires_at
										)}
									</p>
								</div>
							)}

							{quote.version > 1 && (
								<div>
									<h3 className="text-zinc-400 text-sm mb-1">
										Version
									</h3>
									<p className="text-white">
										Version{" "}
										{quote.version}
									</p>
								</div>
							)}

							{quote.rejection_reason && (
								<div className="pt-4 border-t border-zinc-700">
									<h3 className="text-zinc-400 text-sm mb-2">
										Rejection Reason
									</h3>
									<p className="text-sm text-zinc-300">
										{
											quote.rejection_reason
										}
									</p>
								</div>
							)}
						</div>
					</Card>
				</div>

				{/* Client Details - 1/3 width */}
				<div className="lg:col-span-1">
					<Card
						title="Client Details"
						headerAction={
							quote.client?.is_active !== undefined && (
								<span
									className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
										quote.client
											.is_active
											? "bg-green-500/20 text-green-400 border-green-500/30"
											: "bg-red-500/20 text-red-400 border-red-500/30"
									}`}
								>
									{quote.client.is_active
										? "Active"
										: "Inactive"}
								</span>
							)
						}
						className="h-full"
					>
						<div className="space-y-4">
							<div>
								<h3 className="text-zinc-400 text-sm mb-2 flex items-center gap-2">
									<User size={14} />
									Client Name
								</h3>
								<p>
									{quote.client?.name ||
										"Unknown Client"}
								</p>
							</div>

							{quote.client?.address && (
								<div>
									<h3 className="text-zinc-400 text-sm mb-1">
										Address
									</h3>
									<p className="text-white text-sm break-words">
										{
											quote.client
												.address
										}
									</p>
								</div>
							)}

							{/* Primary Contact */}
							{primaryContact && (
								<div className="pt-4 border-t border-zinc-700">
									<div className="flex items-center justify-between mb-3">
										<h3 className="text-zinc-400 text-sm">
											Primary
											Contact
										</h3>
										{primaryContact.title && (
											<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
												{
													primaryContact.title
												}
											</span>
										)}
									</div>
									<div className="space-y-2">
										<p className="text-white font-medium">
											{
												primaryContact.name
											}
										</p>

										{primaryContact.email && (
											<div className="flex items-center gap-2 text-sm">
												<Mail
													size={
														14
													}
													className="text-zinc-400 flex-shrink-0"
												/>
												<a
													href={`mailto:${primaryContact.email}`}
													className="text-blue-400 hover:text-blue-300 transition-colors truncate"
												>
													{
														primaryContact.email
													}
												</a>
											</div>
										)}

										{primaryContact.phone && (
											<div className="flex items-center gap-2 text-sm">
												<Phone
													size={
														14
													}
													className="text-zinc-400 flex-shrink-0"
												/>
												<a
													href={`tel:${primaryContact.phone}`}
													className="text-blue-400 hover:text-blue-300 transition-colors"
												>
													{
														primaryContact.phone
													}
												</a>
											</div>
										)}
									</div>
								</div>
							)}

							<button
								onClick={() =>
									navigate(
										`/dispatch/clients/${quote.client_id}`
									)
								}
								className="w-full mt-4 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-md text-sm font-medium transition-colors"
							>
								View Full Client Profile
							</button>
						</div>
					</Card>
				</div>
			</div>

			{/* Line Items - Full Width */}
			<Card title="Line Items">
				{!quote.line_items || quote.line_items.length === 0 ? (
					<div className="text-center py-12">
						<Package
							size={48}
							className="mx-auto text-zinc-600 mb-3"
						/>
						<h3 className="text-zinc-400 text-lg font-medium mb-2">
							No Line Items
						</h3>
						<p className="text-zinc-500 text-sm max-w-sm mx-auto">
							This quote doesn't have any line items yet.
						</p>
					</div>
				) : (
					<div className="space-y-6">
						{/* Line Items Table */}
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b border-zinc-700">
										<th className="text-left py-3 px-4 text-sm font-semibold text-zinc-400">
											Item
										</th>
										<th className="text-left py-3 px-4 text-sm font-semibold text-zinc-400">
											Type
										</th>
										<th className="text-right py-3 px-4 text-sm font-semibold text-zinc-400">
											Quantity
										</th>
										<th className="text-right py-3 px-4 text-sm font-semibold text-zinc-400">
											Unit Price
										</th>
										<th className="text-right py-3 px-4 text-sm font-semibold text-zinc-400">
											Total
										</th>
									</tr>
								</thead>
								<tbody>
									{quote.line_items.map(
										(item) => (
											<tr
												key={
													item.id
												}
												className="border-b border-zinc-800"
											>
												<td className="py-3 px-4">
													<div className="text-white font-medium">
														{
															item.name
														}
													</div>
													{item.description && (
														<div className="text-sm text-zinc-400 mt-1">
															{
																item.description
															}
														</div>
													)}
												</td>
												<td className="py-3 px-4">
													{item.item_type ? (
														<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700 capitalize">
															{
																item.item_type
															}
														</span>
													) : (
														<span className="text-zinc-500 text-sm">
															-
														</span>
													)}
												</td>
												<td className="py-3 px-4 text-right text-white">
													{Number(
														item.quantity
													).toFixed(
														2
													)}
												</td>
												<td className="py-3 px-4 text-right text-white">
													{formatCurrency(
														item.unit_price
													)}
												</td>
												<td className="py-3 px-4 text-right text-white font-semibold">
													{formatCurrency(
														item.total
													)}
												</td>
											</tr>
										)
									)}
								</tbody>
							</table>
						</div>

						{/* Financial Summary */}
						<div className="flex justify-end">
							<div className="w-full md:w-1/2 lg:w-1/3 space-y-3 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
								<div className="flex items-center justify-between text-sm pb-3 border-b border-zinc-700">
									<span className="text-zinc-400">
										Subtotal:
									</span>
									<span className="font-semibold text-white">
										{formatCurrency(
											quote.subtotal
										)}
									</span>
								</div>

								{quote.tax_rate > 0 && (
									<div className="flex items-center justify-between text-sm">
										<span className="text-zinc-400">
											Tax (
											{(
												Number(
													quote.tax_rate
												) *
												100
											).toFixed(
												2
											)}
											%):
										</span>
										<span className="text-white">
											{formatCurrency(
												quote.tax_amount
											)}
										</span>
									</div>
								)}

								{quote.discount_amount > 0 && (
									<div className="flex items-center justify-between text-sm">
										<span className="text-zinc-400">
											Discount:
										</span>
										<span className="text-white">
											-
											{formatCurrency(
												quote.discount_amount
											)}
										</span>
									</div>
								)}

								<div className="flex items-center justify-between text-lg font-bold pt-3 border-t border-zinc-700">
									<span className="text-white">
										Total:
									</span>
									<span className="text-green-400">
										{formatCurrency(
											quote.total
										)}
									</span>
								</div>
							</div>
						</div>
					</div>
				)}
			</Card>

			{/* Related Request */}
			{quote.request && (
				<Card title="Related Request">
					<button
						onClick={() =>
							navigate(
								`/dispatch/requests/${quote.request_id}`
							)
						}
						className="min-w-[300px] max-w-md p-4 bg-zinc-800 hover:bg-zinc-750 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-all cursor-pointer text-left group"
					>
						<div className="flex items-start justify-between gap-3 mb-3">
							<div className="flex-1 min-w-0">
								<h4 className="text-white font-medium text-sm mb-1 group-hover:text-blue-400 transition-colors">
									{quote.request.title}
								</h4>
								<div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
									<Calendar size={12} />
									<span>
										{new Date(
											quote
												.request
												.created_at
										).toLocaleDateString(
											"en-US",
											{
												month: "short",
												day: "numeric",
												year: "numeric",
											}
										)}
									</span>
								</div>
							</div>
							<span
								className={`flex-shrink-0 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
									quote.request.status
								)}`}
							>
								{quote.request.status}
							</span>
						</div>
					</button>
				</Card>
			)}

			{/* Related Job */}
			{quote.job && (
				<Card title="Related Job">
					<button
						onClick={() =>
							navigate(`/dispatch/jobs/${quote.job?.id}`)
						}
						className="min-w-[300px] max-w-md p-4 bg-zinc-800 hover:bg-zinc-750 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-all cursor-pointer text-left group"
					>
						<div className="flex items-start justify-between gap-3 mb-3">
							<div className="flex-1 min-w-0">
								<h4 className="text-white font-medium text-sm mb-1 group-hover:text-blue-400 transition-colors">
									{quote.job?.name}
								</h4>
								<div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
									<Calendar size={12} />
									<span>
										{new Date(
											quote.job
												.created_at
										).toLocaleDateString(
											"en-US",
											{
												month: "short",
												day: "numeric",
												year: "numeric",
											}
										)}
									</span>
								</div>
							</div>
							<span
								className={`flex-shrink-0 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
									quote.job?.status || ""
								)}`}
							>
								{quote.job?.status}
							</span>
						</div>
					</button>
				</Card>
			)}

			{quote && (
				<>
					<EditQuote
						isModalOpen={isEditModalOpen}
						setIsModalOpen={setIsEditModalOpen}
						quote={quote}
					/>

					<ConvertToJob
						isModalOpen={isConvertToJobModalOpen}
						setIsModalOpen={setIsConvertToJobModalOpen}
						quote={quote}
						onConvert={async (jobData) => {
							const newJob = await createJob(jobData);
							if (!newJob?.id) {
								throw new Error(
									"Job creation failed: no ID returned"
								);
							}
							navigate(`/dispatch/jobs/${newJob.id}`);
							return newJob.id;
						}}
					/>
				</>
			)}
		</div>
	);
}
