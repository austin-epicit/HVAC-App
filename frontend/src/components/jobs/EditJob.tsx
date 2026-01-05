import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, Trash2 } from "lucide-react";
import { useUpdateJobMutation, useDeleteJobMutation } from "../../hooks/useJobs";
import { JobPriorityValues, JobStatusValues, type Job, type JobStatus } from "../../types/jobs";
import type { GeocodeResult } from "../../types/location";
import AddressForm from "../ui/AddressForm";
import { addSpacesToCamelCase } from "../../util/util";

interface EditJobProps {
	isModalOpen: boolean;
	setIsModalOpen: (isOpen: boolean) => void;
	job: Job;
}

export default function EditJob({ isModalOpen, setIsModalOpen, job }: EditJobProps) {
	const navigate = useNavigate();
	const updateJob = useUpdateJobMutation();
	const deleteJob = useDeleteJobMutation();

	const [formData, setFormData] = useState({
		name: job.name,
		description: job.description,
		address: job.address,
		coords: job.coords,
		priority: job.priority || "normal",
		status: job.status,
	});
	const [deleteConfirm, setDeleteConfirm] = useState(false);
	const mouseDownOnBackdrop = useRef(false);

	// Reset form data when modal opens with new job
	useEffect(() => {
		if (isModalOpen) {
			setFormData({
				name: job.name,
				description: job.description,
				address: job.address,
				coords: job.coords,
				priority: job.priority || "normal",
				status: job.status,
			});
			setDeleteConfirm(false);
		}
	}, [isModalOpen, job]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const updates: Partial<Job> = {
				name: formData.name,
				description: formData.description,
				address: formData.address,
				coords: formData.coords,
				priority: formData.priority,
				status: formData.status as JobStatus,
			};

			await updateJob.mutateAsync({
				id: job.id,
				updates,
			});

			setIsModalOpen(false);
		} catch (error) {
			console.error("Failed to update job:", error);
		}
	};

	const handleDelete = async () => {
		if (!deleteConfirm) {
			setDeleteConfirm(true);
			return;
		}

		try {
			await deleteJob.mutateAsync(job.id);
			setIsModalOpen(false);
			navigate("/dispatch/jobs");
		} catch (error) {
			console.error("Failed to delete job:", error);
		}
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
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
					<h2 className="text-2xl font-bold text-white">Edit Job</h2>
					<button
						onClick={() => setIsModalOpen(false)}
						className="text-zinc-400 hover:text-white transition-colors"
					>
						<X size={24} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<p className="mb-1">Job Name</p>
						<input
							type="text"
							name="name"
							value={formData.name}
							onChange={handleChange}
							placeholder="Job Name"
							className="border border-zinc-800 p-2 w-full rounded-sm bg-zinc-900 text-white"
							required
						/>
					</div>

					<div>
						<p className="mb-1">Client</p>
						<div className="border border-zinc-800 p-2 w-full rounded-sm bg-zinc-800/50 text-zinc-400">
							{job.client?.name || "Unknown Client"}
						</div>
						<p className="text-xs text-zinc-500 mt-1">
							Client assignment cannot be changed
						</p>
					</div>

					<div>
						<p className="mb-1">Priority</p>
						<select
							name="priority"
							value={formData.priority}
							onChange={handleChange}
							className="border border-zinc-800 p-2 w-full rounded-sm bg-zinc-900 text-white"
							required
						>
							{JobPriorityValues.map((v) => (
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
							{JobStatusValues.map((v) => (
								<option value={v} key={v}>
									{addSpacesToCamelCase(v)}
								</option>
							))}
						</select>
					</div>

					<div>
						<p className="mb-1">Address</p>
						<AddressForm handleChange={handleChangeAddress} />
					</div>

					<div>
						<p className="mb-1">Description</p>
						<textarea
							name="description"
							value={formData.description || ""}
							onChange={handleChange}
							placeholder="Brief description or notes..."
							rows={3}
							className="border border-zinc-800 p-2 w-full rounded-sm bg-zinc-900 text-white h-20 resize-none"
						/>
					</div>

					<div className="flex gap-3 pt-4">
						<button
							type="submit"
							disabled={updateJob.isPending}
							className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-md transition-colors"
						>
							{updateJob.isPending
								? "Saving..."
								: "Save Changes"}
						</button>
						<button
							type="button"
							onClick={handleDelete}
							onMouseLeave={() => setDeleteConfirm(false)}
							disabled={deleteJob.isPending}
							className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
								deleteConfirm
									? "bg-red-600 hover:bg-red-700 text-white"
									: "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
							} disabled:opacity-50 disabled:cursor-not-allowed`}
						>
							<Trash2 size={16} />
							{deleteJob.isPending
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
