import { useState, useEffect, useRef } from "react";
import { X, Trash2 } from "lucide-react";
import { useUpdateRequestMutation, useDeleteRequestMutation } from "../../hooks/useRequests";
import { RequestStatusValues, RequestPriorityValues, type Request } from "../../types/requests";
import type { GeocodeResult } from "../../types/location";
import AddressForm from "../ui/AddressForm";
import { useNavigate } from "react-router-dom";

interface EditRequestProps {
	isModalOpen: boolean;
	setIsModalOpen: (isOpen: boolean) => void;
	request: Request;
}

export default function EditRequest({ isModalOpen, setIsModalOpen, request }: EditRequestProps) {
	const navigate = useNavigate();
	const updateRequest = useUpdateRequestMutation();
	const deleteRequest = useDeleteRequestMutation();

	const [formData, setFormData] = useState({
		title: request.title,
		description: request.description,
		address: request.address || "",
		coords: request.coords,
		priority: request.priority || "Medium",
		status: request.status,
		estimated_value: request.estimated_value ? String(request.estimated_value) : "",
		source: request.source || "",
		source_reference: request.source_reference || "",
		requires_quote: request.requires_quote || false,
		cancellation_reason: request.cancellation_reason || "",
	});
	const [deleteConfirm, setDeleteConfirm] = useState(false);
	const mouseDownOnBackdrop = useRef(false);

	// Reset form data when modal opens with new request
	useEffect(() => {
		if (isModalOpen) {
			setFormData({
				title: request.title,
				description: request.description,
				address: request.address || "",
				coords: request.coords,
				priority: request.priority || "Medium",
				status: request.status,
				estimated_value: request.estimated_value
					? String(request.estimated_value)
					: "",
				source: request.source || "",
				source_reference: request.source_reference || "",
				requires_quote: request.requires_quote || false,
				cancellation_reason: request.cancellation_reason || "",
			});
			setDeleteConfirm(false);
		}
	}, [isModalOpen, request]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const updates = {
				title: formData.title,
				description: formData.description,
				address: formData.address || undefined,
				...(formData.coords && { coords: formData.coords }),
				priority: formData.priority as (typeof RequestPriorityValues)[number],
				status: formData.status as (typeof RequestStatusValues)[number],
				estimated_value: formData.estimated_value
					? parseFloat(formData.estimated_value)
					: undefined,
				source: formData.source || undefined,
				source_reference: formData.source_reference || undefined,
				requires_quote: formData.requires_quote,
				cancellation_reason:
					formData.status === "Cancelled"
						? formData.cancellation_reason || undefined
						: undefined,
				cancelled_at:
					formData.status === "Cancelled" &&
					request.status !== "Cancelled"
						? new Date()
						: request.cancelled_at || undefined,
			};

			await updateRequest.mutateAsync({
				id: request.id,
				data: updates,
			});

			setIsModalOpen(false);
		} catch (error) {
			console.error("Failed to update request:", error);
		}
	};

	const handleDelete = async () => {
		if (!deleteConfirm) {
			setDeleteConfirm(true);
			return;
		}

		try {
			await deleteRequest.mutateAsync({
				id: request.id,
				clientId: request.client_id,
			});
			setIsModalOpen(false);
			navigate("/dispatch/requests");
		} catch (error) {
			console.error("Failed to delete request:", error);
		}
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		const { name, value, type } = e.target;

		if (type === "checkbox") {
			const checked = (e.target as HTMLInputElement).checked;
			setFormData((prev) => ({
				...prev,
				[name]: checked,
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		}
	};

	const handleChangeAddress = (geoData: GeocodeResult) => {
		setFormData((prev) => ({
			...prev,
			address: geoData.address,
			coords: geoData.coords,
		}));
	};

	const handleBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) {
			mouseDownOnBackdrop.current = true;
		}
	};

	const handleBackdropMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget && mouseDownOnBackdrop.current) {
			setIsModalOpen(false);
		}
		mouseDownOnBackdrop.current = false;
	};

	if (!isModalOpen) return null;

	return (
		<div
			className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
			onMouseDown={handleBackdropMouseDown}
			onMouseUp={handleBackdropMouseUp}
		>
			<div
				className="bg-zinc-900 rounded-xl p-6 w-full max-w-md border border-zinc-800 max-h-[90vh] overflow-y-auto"
				style={{
					scrollbarWidth: "none", // Firefox
					msOverflowStyle: "none", // IE/Edge
				}}
			>
				<style>{`
					.bg-zinc-900::-webkit-scrollbar {
						display: none; /* Chrome, Safari, Opera */
					}
				`}</style>
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-2xl font-bold text-white">
						Edit Request
					</h2>
					<button
						onClick={() => setIsModalOpen(false)}
						className="text-zinc-400 hover:text-white transition-colors"
					>
						<X size={24} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<p className="mb-1">Title</p>
						<input
							type="text"
							name="title"
							value={formData.title}
							onChange={handleChange}
							placeholder="Request Title"
							className="border border-zinc-800 p-2 w-full rounded-sm bg-zinc-900 text-white"
							required
						/>
					</div>

					<div>
						<p className="mb-1">Client</p>
						<div className="border border-zinc-800 p-2 w-full rounded-sm bg-zinc-800/50 text-zinc-400">
							{request.client?.name || "Unknown Client"}
						</div>
						<p className="text-xs text-zinc-500 mt-1">
							Client assignment cannot be changed
						</p>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="mb-1">Priority</p>
							<select
								name="priority"
								value={formData.priority}
								onChange={handleChange}
								className="border border-zinc-800 p-2 w-full rounded-sm bg-zinc-900 text-white"
								required
							>
								{RequestPriorityValues.map((v) => (
									<option value={v} key={v}>
										{v}
									</option>
								))}
							</select>
						</div>

						<div>
							<p className="mb-1">Status</p>
							<select
								name="status"
								value={formData.status}
								onChange={handleChange}
								className="border border-zinc-800 p-2 w-full rounded-sm bg-zinc-900 text-white"
								required
							>
								{RequestStatusValues.map((v) => (
									<option value={v} key={v}>
										{v}
									</option>
								))}
							</select>
						</div>
					</div>

					{formData.status === "Cancelled" && (
						<div>
							<p className="mb-1">Cancellation Reason</p>
							<textarea
								name="cancellation_reason"
								value={formData.cancellation_reason}
								onChange={handleChange}
								placeholder="Reason for cancellation..."
								rows={2}
								className="border border-zinc-800 p-2 w-full rounded-sm bg-zinc-900 text-white resize-none"
							/>
						</div>
					)}

					<div>
						<p className="mb-1">Address</p>
						<AddressForm handleChange={handleChangeAddress} />
					</div>

					<div>
						<p className="mb-1">Estimated Value</p>
						<div className="relative">
							<span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
								$
							</span>
							<input
								type="number"
								name="estimated_value"
								value={formData.estimated_value}
								onChange={handleChange}
								placeholder="0.00"
								step="0.01"
								min="0"
								className="border border-zinc-800 p-2 w-full rounded-sm bg-zinc-900 text-white pl-7"
							/>
						</div>
					</div>

					<div>
						<p className="mb-1">Source</p>
						<select
							name="source"
							value={formData.source}
							onChange={handleChange}
							className="border border-zinc-800 p-2 w-full rounded-sm bg-zinc-900 text-white"
						>
							<option value="">Select Source</option>
							<option value="phone">Phone</option>
							<option value="email">Email</option>
							<option value="web">Web</option>
						</select>
					</div>

					{formData.source && (
						<div>
							<p className="mb-1">Source Reference</p>
							<input
								type="text"
								name="source_reference"
								value={formData.source_reference}
								onChange={handleChange}
								placeholder="e.g., ticket #, email subject, etc."
								className="border border-zinc-800 p-2 w-full rounded-sm bg-zinc-900 text-white"
							/>
						</div>
					)}

					<div className="flex items-center gap-2">
						<input
							type="checkbox"
							name="requires_quote"
							checked={formData.requires_quote}
							onChange={handleChange}
							className="w-4 h-4 rounded bg-zinc-900 border-zinc-800"
						/>
						<label htmlFor="requires_quote" className="text-sm">
							Requires Quote
						</label>
					</div>

					<div>
						<p className="mb-1">Description</p>
						<textarea
							name="description"
							value={formData.description}
							onChange={handleChange}
							placeholder="Request details..."
							rows={4}
							className="border border-zinc-800 p-2 w-full rounded-sm bg-zinc-900 text-white resize-none"
							required
						/>
					</div>

					<div className="flex gap-3 pt-4">
						<button
							type="submit"
							disabled={updateRequest.isPending}
							className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-md transition-colors"
						>
							{updateRequest.isPending
								? "Saving..."
								: "Save Changes"}
						</button>
						<button
							type="button"
							onClick={handleDelete}
							onMouseLeave={() => setDeleteConfirm(false)}
							disabled={deleteRequest.isPending}
							className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
								deleteConfirm
									? "bg-red-600 hover:bg-red-700 text-white"
									: "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
							} disabled:opacity-50 disabled:cursor-not-allowed`}
						>
							<Trash2 size={16} />
							{deleteRequest.isPending
								? "Deleting..."
								: deleteConfirm
									? "Confirm Delete"
									: "Delete"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
