import { useState, useEffect, useRef } from "react";
import type { ZodError } from "zod";
import { Trash2 } from "lucide-react";
import LoadSvg from "../../assets/icons/loading.svg?react";
import Button from "../ui/Button";
import FullPopup from "../ui/FullPopup";
import { useUpdateRequestMutation, useDeleteRequestMutation } from "../../hooks/useRequests";
import {
	RequestStatusValues,
	RequestPriorityValues,
	UpdateRequestSchema,
	type Request,
	type UpdateRequestInput,
} from "../../types/requests";
import type { GeocodeResult } from "../../types/location";
import AddressForm from "../ui/AddressForm";
import Dropdown from "../ui/Dropdown";
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

	const titleRef = useRef<HTMLInputElement>(null);
	const descRef = useRef<HTMLTextAreaElement>(null);
	const priorityRef = useRef<HTMLSelectElement>(null);
	const statusRef = useRef<HTMLSelectElement>(null);
	const sourceRef = useRef<HTMLInputElement>(null);
	const sourceReferenceRef = useRef<HTMLInputElement>(null);
	const requiresQuoteRef = useRef<HTMLInputElement>(null);
	const estimatedValueRef = useRef<HTMLInputElement>(null);
	const cancellationReasonRef = useRef<HTMLTextAreaElement>(null);

	const [geoData, setGeoData] = useState<GeocodeResult>();
	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState<ZodError | null>(null);
	const [deleteConfirm, setDeleteConfirm] = useState(false);
	const [showCancellationReason, setShowCancellationReason] = useState(false);

	// Reset form data when modal opens with new request
	useEffect(() => {
		if (isModalOpen) {
			setGeoData(
				request.address && request.coords
					? {
							address: request.address,
							coords: request.coords,
						}
					: undefined
			);
			setShowCancellationReason(request.status === "Cancelled");
			setDeleteConfirm(false);
			setErrors(null);
		}
	}, [isModalOpen, request]);

	const handleChangeAddress = (result: GeocodeResult) => {
		setGeoData(() => ({
			address: result.address,
			coords: result.coords,
		}));
	};

	const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setShowCancellationReason(e.target.value === "Cancelled");
	};

	const handleUpdate = async () => {
		if (
			titleRef.current &&
			descRef.current &&
			priorityRef.current &&
			statusRef.current &&
			!isLoading
		) {
			const titleValue = titleRef.current.value.trim();
			const descValue = descRef.current.value.trim();
			const priorityValue = priorityRef.current.value.trim();
			const statusValue = statusRef.current.value.trim();
			const sourceValue = sourceRef.current?.value.trim() || undefined;
			const sourceReferenceValue =
				sourceReferenceRef.current?.value.trim() || undefined;
			const requiresQuoteValue = requiresQuoteRef.current?.checked || false;
			const estimatedValueValue = estimatedValueRef.current?.value
				? parseFloat(estimatedValueRef.current.value)
				: undefined;
			const cancellationReasonValue =
				cancellationReasonRef.current?.value.trim() || undefined;

			const updates: UpdateRequestInput = {
				title: titleValue,
				description: descValue,
				address: geoData?.address,
				coords: geoData?.coords,
				priority: priorityValue as
					| "Low"
					| "Medium"
					| "High"
					| "Urgent"
					| "Emergency",
				status: statusValue as (typeof RequestStatusValues)[number],
				source: sourceValue,
				source_reference: sourceReferenceValue,
				requires_quote: requiresQuoteValue,
				estimated_value: estimatedValueValue,
				cancellation_reason:
					statusValue === "Cancelled"
						? cancellationReasonValue
						: undefined,
			};

			const parseResult = UpdateRequestSchema.safeParse(updates);

			if (!parseResult.success) {
				setErrors(parseResult.error);
				console.error("Validation errors:", parseResult.error);
				return;
			}

			setErrors(null);
			setIsLoading(true);

			try {
				await updateRequest.mutateAsync({
					id: request.id,
					data: updates,
				});

				setIsLoading(false);
				setIsModalOpen(false);
			} catch (error) {
				console.error("Failed to update request:", error);
				setIsLoading(false);
			}
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

	// Error display component
	const ErrorDisplay = ({ path }: { path: string }) => {
		if (!errors) return null;
		const fieldErrors = errors.issues.filter((err) => err.path[0] === path);
		if (fieldErrors.length === 0) return null;
		return (
			<div className="mt-1 space-y-1">
				{fieldErrors.map((err, idx) => (
					<p key={idx} className="text-red-300 text-sm">
						{err.message}
					</p>
				))}
			</div>
		);
	};

	const priorityEntries = (
		<>
			{RequestPriorityValues.map((v) => (
				<option key={v} value={v} className="text-black">
					{v}
				</option>
			))}
		</>
	);

	const statusEntries = (
		<>
			{RequestStatusValues.map((v) => (
				<option key={v} value={v} className="text-black">
					{v}
				</option>
			))}
		</>
	);

	const content = (
		<>
			<h2 className="text-2xl font-bold mb-4">Edit Request</h2>

			<p className="mb-1 hover:color-accent">Title *</p>
			<input
				type="text"
				placeholder="Request Title"
				defaultValue={request.title}
				className="border border-zinc-800 p-2 w-full rounded-sm bg-zinc-900 text-white"
				disabled={isLoading}
				ref={titleRef}
			/>
			<ErrorDisplay path="title" />

			<p className="mb-1 mt-3 hover:color-accent">Client</p>
			<div className="border border-zinc-800 p-2 w-full rounded-sm bg-zinc-800/50 text-zinc-400">
				{request.client?.name || "Unknown Client"}
			</div>
			<p className="text-xs text-zinc-500 mt-1">
				Client assignment cannot be changed
			</p>

			<p className="mb-1 mt-3 hover:color-accent">Description *</p>
			<textarea
				placeholder="Request Description"
				defaultValue={request.description}
				className="border border-zinc-800 p-2 w-full h-24 rounded-sm bg-zinc-900 text-white resize-none"
				disabled={isLoading}
				ref={descRef}
			></textarea>
			<ErrorDisplay path="description" />

			<p className="mb-1 mt-3 hover:color-accent">Address (Optional)</p>
			<AddressForm handleChange={handleChangeAddress} />
			{geoData?.address && (
				<p className="text-xs text-zinc-400 mt-1">
					Current: {geoData.address}
				</p>
			)}
			<ErrorDisplay path="address" />
			<ErrorDisplay path="coords" />

			<div className="grid grid-cols-2 gap-4 mt-3">
				<div>
					<p className="mb-1 hover:color-accent">Priority *</p>
					<div className="border border-zinc-800 rounded-sm">
						<Dropdown
							refToApply={priorityRef}
							defaultValue={request.priority}
							entries={priorityEntries}
						/>
					</div>
					<ErrorDisplay path="priority" />
				</div>

				<div>
					<p className="mb-1 hover:color-accent">Status *</p>
					<div className="border border-zinc-800 rounded-sm">
						<Dropdown
							refToApply={statusRef}
							defaultValue={request.status}
							entries={statusEntries}
							onChange={(value) => {
								setShowCancellationReason(
									value === "Cancelled"
								);
							}}
						/>
					</div>
					<ErrorDisplay path="status" />
				</div>
			</div>

			{showCancellationReason && (
				<div className="mt-3">
					<p className="mb-1 hover:color-accent">
						Cancellation Reason
					</p>
					<textarea
						placeholder="Reason for cancellation..."
						defaultValue={request.cancellation_reason || ""}
						className="border border-zinc-800 p-2 w-full h-20 rounded-sm bg-zinc-900 text-white resize-none"
						disabled={isLoading}
						ref={cancellationReasonRef}
					></textarea>
					<ErrorDisplay path="cancellation_reason" />
				</div>
			)}

			<p className="mb-1 mt-3 hover:color-accent">Source (Optional)</p>
			<input
				type="text"
				placeholder="e.g., Phone Call, Website, Email"
				defaultValue={request.source || ""}
				className="border border-zinc-800 p-2 w-full rounded-sm bg-zinc-900 text-white"
				disabled={isLoading}
				ref={sourceRef}
			/>
			<ErrorDisplay path="source" />

			<p className="mb-1 mt-3 hover:color-accent">Source Reference (Optional)</p>
			<input
				type="text"
				placeholder="e.g., Ticket #12345, Email ID"
				defaultValue={request.source_reference || ""}
				className="border border-zinc-800 p-2 w-full rounded-sm bg-zinc-900 text-white"
				disabled={isLoading}
				ref={sourceReferenceRef}
			/>
			<ErrorDisplay path="source_reference" />

			<div className="mt-3 flex items-center gap-2">
				<input
					type="checkbox"
					id="requires_quote"
					defaultChecked={request.requires_quote}
					className="w-4 h-4 rounded border-zinc-800"
					disabled={isLoading}
					ref={requiresQuoteRef}
				/>
				<label htmlFor="requires_quote" className="text-sm cursor-pointer">
					Requires Quote
				</label>
			</div>

			<p className="mb-1 mt-3 hover:color-accent">Estimated Value (Optional)</p>
			<div className="relative">
				<span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
					$
				</span>
				<input
					type="number"
					step="0.01"
					min="0"
					placeholder="0.00"
					defaultValue={request.estimated_value || ""}
					className="border border-zinc-800 p-2 w-full rounded-sm bg-zinc-900 text-white pl-7"
					disabled={isLoading}
					ref={estimatedValueRef}
				/>
			</div>
			<ErrorDisplay path="estimated_value" />

			<div className="flex gap-3 pt-4 mt-4 border-t border-zinc-700">
				{isLoading || updateRequest.isPending || deleteRequest.isPending ? (
					<LoadSvg className="w-10 h-10" />
				) : (
					<>
						<button
							type="button"
							onClick={handleUpdate}
							disabled={
								isLoading || updateRequest.isPending
							}
							className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-md transition-colors"
						>
							{isLoading || updateRequest.isPending
								? "Saving..."
								: "Save Changes"}
						</button>
						<button
							type="button"
							onClick={handleDelete}
							onMouseLeave={() => setDeleteConfirm(false)}
							disabled={
								isLoading || deleteRequest.isPending
							}
							className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
								deleteConfirm
									? "bg-red-600 hover:bg-red-700 text-white"
									: "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
							} disabled:opacity-50 disabled:cursor-not-allowed`}
						>
							<Trash2 size={16} />
							{isLoading || deleteRequest.isPending
								? "Deleting..."
								: deleteConfirm
									? "Confirm Delete"
									: "Delete"}
						</button>
					</>
				)}
			</div>
		</>
	);

	return (
		<FullPopup
			content={content}
			isModalOpen={isModalOpen}
			onClose={() => setIsModalOpen(false)}
		/>
	);
}
