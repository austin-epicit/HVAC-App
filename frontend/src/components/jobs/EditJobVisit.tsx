import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, Trash2 } from "lucide-react";
import {
	useUpdateJobVisitMutation,
	useDeleteJobVisitMutation,
	useAssignTechniciansToVisitMutation,
} from "../../hooks/useJobs";
import { useAllTechniciansQuery } from "../../hooks/useTechnicians";
import type { JobVisit, ScheduleType, UpdateJobVisitInput, VisitStatus } from "../../types/jobs";
import DatePicker from "../ui/DatePicker";
import TimePicker from "../ui/TimePicker";
import DurationPicker from "../ui/DurationPicker";

interface EditJobVisitProps {
	isModalOpen: boolean;
	setIsModalOpen: (isOpen: boolean) => void;
	visit: JobVisit;
	jobId: string;
}

export default function EditJobVisit({
	isModalOpen,
	setIsModalOpen,
	visit,
	jobId,
}: EditJobVisitProps) {
	const navigate = useNavigate();
	const updateVisit = useUpdateJobVisitMutation();
	const deleteVisit = useDeleteJobVisitMutation();
	const assignTechs = useAssignTechniciansToVisitMutation();
	const { data: technicians } = useAllTechniciansQuery();

	// Store original values to revert to when X is clicked
	const originalStartDate = useRef<Date>(new Date(visit.scheduled_start_at));

	const [scheduleType, setScheduleType] = useState<ScheduleType>(visit.schedule_type);
	const [startDate, setStartDate] = useState<Date>(new Date(visit.scheduled_start_at));
	const [startTime, setStartTime] = useState<Date | null>(new Date(visit.scheduled_start_at));
	const [endTime, setEndTime] = useState<Date | null>(new Date(visit.scheduled_end_at));
	const [duration, setDuration] = useState<number>(
		Math.round(
			(new Date(visit.scheduled_end_at).getTime() -
				new Date(visit.scheduled_start_at).getTime()) /
				60000
		)
	);
	const [windowStart, setWindowStart] = useState<Date | null>(
		visit.arrival_window_start ? new Date(visit.arrival_window_start) : null
	);
	const [windowEnd, setWindowEnd] = useState<Date | null>(
		visit.arrival_window_end ? new Date(visit.arrival_window_end) : null
	);
	const [status, setStatus] = useState<VisitStatus>(visit.status);
	const [selectedTechIds, setSelectedTechIds] = useState<string[]>(
		visit.visit_techs.map((vt) => vt.tech_id)
	);
	const [deleteConfirm, setDeleteConfirm] = useState(false);

	// Reset form data when modal opens with new visit
	useEffect(() => {
		if (isModalOpen) {
			const visitStartDate = new Date(visit.scheduled_start_at);
			originalStartDate.current = visitStartDate;

			setScheduleType(visit.schedule_type);
			setStartDate(visitStartDate);
			setStartTime(new Date(visit.scheduled_start_at));
			setEndTime(new Date(visit.scheduled_end_at));
			setDuration(
				Math.round(
					(new Date(visit.scheduled_end_at).getTime() -
						new Date(visit.scheduled_start_at).getTime()) /
						60000
				)
			);
			setWindowStart(
				visit.arrival_window_start
					? new Date(visit.arrival_window_start)
					: null
			);
			setWindowEnd(
				visit.arrival_window_end ? new Date(visit.arrival_window_end) : null
			);
			setStatus(visit.status);
			setSelectedTechIds(visit.visit_techs.map((vt) => vt.tech_id));
			setDeleteConfirm(false);
		}
	}, [isModalOpen, visit]);

	const handleTechSelection = (techId: string) => {
		setSelectedTechIds((prev) =>
			prev.includes(techId)
				? prev.filter((id) => id !== techId)
				: [...prev, techId]
		);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			// Combine date and time
			let combinedStartDate = new Date(startDate);
			let combinedEndDate = new Date(startDate);

			if (scheduleType === "all_day") {
				combinedStartDate.setHours(6, 0, 0, 0);
				combinedEndDate.setHours(18, 0, 0, 0);
			} else if (scheduleType === "exact" && startTime && endTime) {
				combinedStartDate.setHours(
					startTime.getHours(),
					startTime.getMinutes(),
					0,
					0
				);
				combinedEndDate.setHours(
					endTime.getHours(),
					endTime.getMinutes(),
					0,
					0
				);
			} else if (scheduleType === "window" && windowStart && windowEnd) {
				combinedStartDate.setHours(
					windowStart.getHours(),
					windowStart.getMinutes(),
					0,
					0
				);
				combinedEndDate = new Date(
					combinedStartDate.getTime() + duration * 60000
				);
			}

			const updates: UpdateJobVisitInput = {
				schedule_type: scheduleType,
				scheduled_start_at: combinedStartDate.toISOString(),
				scheduled_end_at: combinedEndDate.toISOString(),
				arrival_window_start:
					scheduleType === "window" && windowStart
						? (() => {
								const windowStartDate = new Date(
									startDate
								);
								windowStartDate.setHours(
									windowStart.getHours(),
									windowStart.getMinutes(),
									0,
									0
								);
								return windowStartDate.toISOString();
							})()
						: null,
				arrival_window_end:
					scheduleType === "window" && windowEnd
						? (() => {
								const windowEndDate = new Date(
									startDate
								);
								windowEndDate.setHours(
									windowEnd.getHours(),
									windowEnd.getMinutes(),
									0,
									0
								);
								return windowEndDate.toISOString();
							})()
						: null,
				status: status,
			};

			await updateVisit.mutateAsync({
				id: visit.id,
				data: updates,
			});

			// Update technician assignments separately if changed
			const originalTechIds = visit.visit_techs.map((vt) => vt.tech_id).sort();
			const newTechIds = selectedTechIds.sort();
			if (JSON.stringify(originalTechIds) !== JSON.stringify(newTechIds)) {
				await assignTechs.mutateAsync({
					visitId: visit.id,
					techIds: selectedTechIds,
				});
			}

			setIsModalOpen(false);
		} catch (error) {
			console.error("Failed to update visit:", error);
		}
	};

	const handleDelete = async () => {
		if (!deleteConfirm) {
			setDeleteConfirm(true);
			return;
		}

		try {
			await deleteVisit.mutateAsync(visit.id);
			setIsModalOpen(false);
		} catch (error) {
			console.error("Failed to delete visit:", error);
		}
	};

	const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) {
			setIsModalOpen(false);
		}
	};

	return (
		<div
			className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
			onClick={handleBackdropClick}
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
						Edit Visit
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
						<p className="mb-1">Status</p>
						<select
							value={status}
							onChange={(e) =>
								setStatus(
									e.target
										.value as VisitStatus
								)
							}
							className="border border-zinc-800 p-2 w-full rounded-sm bg-zinc-900 text-white"
						>
							<option value="Scheduled">Scheduled</option>
							<option value="InProgress">
								In Progress
							</option>
							<option value="Completed">Completed</option>
							<option value="Cancelled">Cancelled</option>
						</select>
					</div>

					<div>
						<p className="mb-1">Visit Date</p>
						<DatePicker
							value={startDate}
							onChange={(date) =>
								setStartDate(
									date ||
										originalStartDate.current
								)
							}
							optional={true}
						/>
						{startDate.toDateString() !==
							originalStartDate.current.toDateString() && (
							<p className="text-xs text-blue-400 mt-1">
								Changed from{" "}
								{originalStartDate.current.toLocaleDateString(
									"en-US",
									{
										month: "short",
										day: "numeric",
										year: "numeric",
									}
								)}
							</p>
						)}
					</div>

					<div>
						<p className="mb-1">Schedule Type</p>
						<div className="flex w-full border border-zinc-700 rounded-md overflow-hidden">
							<button
								type="button"
								className={`flex-1 py-2 text-sm ${
									scheduleType === "all_day"
										? "bg-blue-600 text-white"
										: "bg-zinc-900 text-gray-300 hover:bg-zinc-800"
								}`}
								onClick={() =>
									setScheduleType("all_day")
								}
							>
								All Day
							</button>
							<button
								type="button"
								className={`flex-1 py-2 text-sm ${
									scheduleType === "exact"
										? "bg-blue-600 text-white"
										: "bg-zinc-900 text-gray-300 hover:bg-zinc-800"
								}`}
								onClick={() =>
									setScheduleType("exact")
								}
							>
								Exact Time
							</button>
							<button
								type="button"
								className={`flex-1 py-2 text-sm ${
									scheduleType === "window"
										? "bg-blue-600 text-white"
										: "bg-zinc-900 text-gray-300 hover:bg-zinc-800"
								}`}
								onClick={() =>
									setScheduleType("window")
								}
							>
								Arrival Window
							</button>
						</div>
					</div>

					{scheduleType === "exact" && (
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="mb-1">Start Time</p>
								<TimePicker
									value={startTime}
									onChange={setStartTime}
								/>
							</div>
							<div>
								<p className="mb-1">End Time</p>
								<TimePicker
									value={endTime}
									onChange={setEndTime}
								/>
							</div>
						</div>
					)}

					{scheduleType === "window" && (
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="mb-1 text-sm font-medium text-zinc-300">
										Window Start
									</p>
									<TimePicker
										value={windowStart}
										onChange={
											setWindowStart
										}
									/>
								</div>
								<div>
									<p className="mb-1 text-sm font-medium text-zinc-300">
										Window End
									</p>
									<TimePicker
										value={windowEnd}
										onChange={
											setWindowEnd
										}
									/>
								</div>
								<div>
									<p className="mb-1 text-sm font-medium text-zinc-300">
										Duration (min)
									</p>
									<DurationPicker
										value={duration}
										onChange={
											setDuration
										}
									/>
								</div>
							</div>
						</div>
					)}

					<div>
						<p className="mb-1">Assign Technicians</p>
						<div className="border border-zinc-800 rounded-sm p-3 max-h-48 overflow-y-auto bg-zinc-900">
							{technicians && technicians.length > 0 ? (
								<div className="space-y-2">
									{technicians.map((tech) => (
										<label
											key={
												tech.id
											}
											className="flex items-center gap-2 cursor-pointer hover:bg-zinc-800 p-2 rounded transition-colors"
										>
											<input
												type="checkbox"
												checked={selectedTechIds.includes(
													tech.id
												)}
												onChange={() =>
													handleTechSelection(
														tech.id
													)
												}
												className="w-4 h-4 accent-blue-600"
											/>
											<span className="text-white text-sm flex-1">
												{
													tech.name
												}
											</span>
											<span
												className={`text-xs px-2 py-0.5 rounded ${
													tech.status ===
													"Available"
														? "bg-green-500/20 text-green-400"
														: tech.status ===
															  "Busy"
															? "bg-red-500/20 text-red-400"
															: "bg-zinc-500/20 text-zinc-400"
												}`}
											>
												{
													tech.status
												}
											</span>
										</label>
									))}
								</div>
							) : (
								<p className="text-zinc-400 text-sm">
									No technicians available
								</p>
							)}
						</div>
						{selectedTechIds.length > 0 && (
							<p className="text-sm text-zinc-400 mt-2">
								{selectedTechIds.length} selected
							</p>
						)}
					</div>

					<div className="flex gap-3 pt-4">
						<button
							type="submit"
							disabled={updateVisit.isPending}
							className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-md transition-colors"
						>
							{updateVisit.isPending
								? "Saving..."
								: "Save Changes"}
						</button>
						<button
							type="button"
							onClick={handleDelete}
							onMouseLeave={() => setDeleteConfirm(false)}
							disabled={deleteVisit.isPending}
							className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
								deleteConfirm
									? "bg-red-600 hover:bg-red-700 text-white"
									: "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
							} disabled:opacity-50 disabled:cursor-not-allowed`}
						>
							<Trash2 size={16} />
							{deleteVisit.isPending
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
