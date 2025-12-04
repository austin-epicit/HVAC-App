import { useState, useEffect } from "react";
import { X, Trash2 } from "lucide-react";
import { useUpdateJobMutation } from "../../hooks/useJobs";
import type { Job, JobStatus } from "../../types/jobs";
import DatePicker from "../ui/DatePicker";
import TimePicker from "../ui/TimePicker";
import DurationPicker from "../ui/DurationPicker";

interface EditJobProps {
	isModalOpen: boolean;
	setIsModalOpen: (isOpen: boolean) => void;
	job: Job;
}

export default function EditJob({ isModalOpen, setIsModalOpen, job }: EditJobProps) {
	const updateJob = useUpdateJobMutation();
	
	const [formData, setFormData] = useState({
		name: job.name,
		description: job.description,
		address: job.address,
		status: job.status,
	});

	const [startDate, setStartDate] = useState<Date>(new Date(job.start_date));
	const [when, setWhen] = useState<"all_day" | "exact" | "window">(job.schedule_type);
	const [exactTime, setExactTime] = useState<Date | null>(new Date(job.start_date));
	const [windowStart, setWindowStart] = useState<Date | null>(new Date(job.start_date));
	const [windowEnd, setWindowEnd] = useState<Date | null>(
		job.window_end ? new Date(job.window_end) : null
	);
	const [duration, setDuration] = useState<number>(job.duration || 60);

	useEffect(() => {
		setFormData({
			name: job.name,
			description: job.description,
			address: job.address,
			status: job.status,
		});

		setStartDate(new Date(job.start_date));
		setWhen(job.schedule_type);
		setExactTime(new Date(job.start_date));
		setWindowStart(new Date(job.start_date));
		setWindowEnd(job.window_end ? new Date(job.window_end) : null);
		setDuration(job.duration || 60);
	}, [job]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			let combinedStart = new Date(startDate);
			if (when === "all_day") {
				combinedStart.setHours(6, 0, 0, 0);
			}
			if (when === "exact" && exactTime) {
				combinedStart.setHours(exactTime.getHours());
				combinedStart.setMinutes(exactTime.getMinutes());
			}
			if (when === "window" && windowStart) {
				combinedStart.setHours(windowStart.getHours());
				combinedStart.setMinutes(windowStart.getMinutes());
			}

			const updates: Partial<Job> = {
				name: formData.name,
				description: formData.description,
				address: formData.address,
				status: formData.status as JobStatus,
				schedule_type: when,
				start_date: combinedStart.toISOString(),
				duration: duration,
				window_end: when === "window" && windowEnd ? windowEnd.toISOString() : null,
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

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) {
			setIsModalOpen(false);
		}
	};

	if (!isModalOpen) return null;

	return (
		<div 
			className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
			onClick={handleBackdropClick}
		>
			<div 
				className="bg-zinc-900 rounded-xl p-6 w-full max-w-md border border-zinc-800 max-h-[90vh] overflow-y-auto"
				style={{
					scrollbarWidth: 'none', // Firefox
					msOverflowStyle: 'none', // IE and Edge
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
						<label className="block text-sm font-medium text-zinc-300 mb-2">
							Job Name
						</label>
						<input
							type="text"
							name="name"
							value={formData.name}
							onChange={handleChange}
							className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-zinc-300 mb-2">
							Address
						</label>
						<input
							type="text"
							name="address"
							value={formData.address}
							onChange={handleChange}
							className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-zinc-300 mb-2">
							Client
						</label>
						<div className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-md text-zinc-400">
							{job.client?.name || "Unknown Client"}
						</div>
						<p className="text-xs text-zinc-500 mt-1">
							Client assignment cannot be changed
						</p>
					</div>

					<div>
						<label className="block text-sm font-medium text-zinc-300 mb-2">
							Status
						</label>
						<select
							name="status"
							value={formData.status}
							onChange={handleChange}
							className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
						>
							<option value="Unscheduled">Unscheduled</option>
							<option value="Scheduled">Scheduled</option>
							<option value="In Progress">In Progress</option>
							<option value="Completed">Completed</option>
							<option value="Cancelled">Cancelled</option>
						</select>
					</div>

					<DatePicker label="Start Date" value={startDate} onChange={setStartDate} />

					<div>
						<label className="block text-sm font-medium text-zinc-300 mb-2">
							When
						</label>
						<div className="flex w-full border border-zinc-700 rounded-md overflow-hidden">
							<button
								type="button"
								className={`flex-1 py-2 text-sm ${
									when === "all_day"
										? "bg-blue-600 text-white"
										: "bg-zinc-900 text-gray-300 hover:bg-zinc-800"
								}`}
								onClick={() => setWhen("all_day")}
							>
								All Day
							</button>
							<button
								type="button"
								className={`flex-1 py-2 text-sm ${
									when === "exact"
										? "bg-blue-600 text-white"
										: "bg-zinc-900 text-gray-300 hover:bg-zinc-800"
								}`}
								onClick={() => setWhen("exact")}
							>
								Exact Time
							</button>
							<button
								type="button"
								className={`flex-1 py-2 text-sm ${
									when === "window"
										? "bg-blue-600 text-white"
										: "bg-zinc-900 text-gray-300 hover:bg-zinc-800"
								}`}
								onClick={() => setWhen("window")}
							>
								Arrival Window
							</button>
						</div>
					</div>

					{when === "exact" && (
						<div className="flex gap-4">
							<div className="flex-1">
								<TimePicker label="Start Time" value={exactTime} onChange={setExactTime} />
							</div>
							<div className="flex-1">
								<DurationPicker label="Duration" value={duration} onChange={setDuration} />
							</div>
						</div>
					)}

					{when === "window" && (
						<>
							<div className="flex gap-4">
								<div className="flex-1">
									<TimePicker label="Start Time" value={windowStart} onChange={setWindowStart} />
								</div>
								<div className="flex-1">
									<DurationPicker label="Duration" value={duration} onChange={setDuration} />
								</div>
							</div>
							<div className="flex gap-4">
								<div className="flex-1">
									<TimePicker label="End Time" value={windowEnd} onChange={setWindowEnd} />
								</div>
								<div className="flex-1"></div>
							</div>
						</>
					)}

					<div>
						<label className="block text-sm font-medium text-zinc-300 mb-2">
							Description
						</label>
						<textarea
							name="description"
							value={formData.description}
							onChange={handleChange}
							rows={3}
							className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<div className="flex gap-3 pt-4">
						<button
							type="submit"
							disabled={updateJob.isPending}
							className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-md transition-colors"
						>
							{updateJob.isPending ? "Saving..." : "Save Changes"}
						</button>
						<button
							type="button"
							className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors`}
						>
							<Trash2 size={16} />
							
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}