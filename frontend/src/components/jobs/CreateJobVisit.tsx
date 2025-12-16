import LoadSvg from "../../assets/icons/loading.svg?react";
import Button from "../ui/Button";
import { useState, useEffect } from "react";
import type { ZodError } from "zod";
import FullPopup from "../ui/FullPopup";
import { CreateJobVisitSchema, type CreateJobVisitInput, type ScheduleType, type JobVisit } from "../../types/jobs";
import { useAllTechniciansQuery } from "../../hooks/useTechnicians";
import DatePicker from "../ui/DatePicker";
import TimePicker from "../ui/TimePicker";
import DurationPicker from "../ui/DurationPicker";

interface CreateJobVisitProps {
	isModalOpen: boolean;
	setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
	jobId: string;
	createVisit: (input: CreateJobVisitInput) => Promise<JobVisit>;
	preselectedTechId?: string;
	onSuccess?: (visit: JobVisit) => void;
}

const CreateJobVisit = ({ 
	isModalOpen, 
	setIsModalOpen, 
	jobId,
	createVisit,
	preselectedTechId,
	onSuccess
}: CreateJobVisitProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState<ZodError | null>(null);
	const [scheduleType, setScheduleType] = useState<ScheduleType>("exact");
	const [startDate, setStartDate] = useState<Date>(new Date());
	const [startTime, setStartTime] = useState<Date | null>(new Date());
	const [endTime, setEndTime] = useState<Date | null>(() => {
		const time = new Date();
		time.setHours(time.getHours() + 1);
		return time;
	});
	const [duration, setDuration] = useState<number>(60);
	const [windowStart, setWindowStart] = useState<Date | null>(new Date());
	const [windowEnd, setWindowEnd] = useState<Date | null>(null);
	const [selectedTechIds, setSelectedTechIds] = useState<string[]>([]);

	const {
		data: technicians,
	} = useAllTechniciansQuery();

	useEffect(() => {
		if (isModalOpen && preselectedTechId) {
			setSelectedTechIds([preselectedTechId]);
		}
	}, [isModalOpen, preselectedTechId]);

	// Reset form when modal closes
	useEffect(() => {
		if (!isModalOpen) {
			setStartDate(new Date());
			setStartTime(new Date());
			const resetEndTime = new Date();
			resetEndTime.setHours(resetEndTime.getHours() + 1);
			setEndTime(resetEndTime);
			setDuration(60);
			setWindowStart(new Date());
			setWindowEnd(null);
			setScheduleType("exact");
			setSelectedTechIds([]);
			setErrors(null);
		}
	}, [isModalOpen]);

	const handleTechSelection = (techId: string) => {
		setSelectedTechIds(prev => 
			prev.includes(techId) 
				? prev.filter(id => id !== techId)
				: [...prev, techId]
		);
	};

	const invokeCreate = async () => {
		if (!isLoading) {
			setErrors(null);

			// Combine date and time
			let combinedStartDate = new Date(startDate);
			let combinedEndDate = new Date(startDate);

			if (scheduleType === "all_day") {
				combinedStartDate.setHours(6, 0, 0, 0);
				combinedEndDate.setHours(18, 0, 0, 0);
			} else if (scheduleType === "exact" && startTime && endTime) {
				combinedStartDate.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
				combinedEndDate.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);
			} else if (scheduleType === "window" && windowStart && windowEnd) {
				combinedStartDate.setHours(windowStart.getHours(), windowStart.getMinutes(), 0, 0);
				combinedEndDate = new Date(combinedStartDate.getTime() + duration * 60000);
			}

			const newVisit: CreateJobVisitInput = {
				job_id: jobId,
				schedule_type: scheduleType,
				scheduled_start_at: combinedStartDate.toISOString(),
				scheduled_end_at: combinedEndDate.toISOString(),
				arrival_window_start: scheduleType === "window" && windowStart 
					? (() => {
						const windowStartDate = new Date(startDate);
						windowStartDate.setHours(windowStart.getHours(), windowStart.getMinutes(), 0, 0);
						return windowStartDate.toISOString();
					})()
					: null,
				arrival_window_end: scheduleType === "window" && windowEnd 
					? (() => {
						const windowEndDate = new Date(startDate);
						windowEndDate.setHours(windowEnd.getHours(), windowEnd.getMinutes(), 0, 0);
						return windowEndDate.toISOString();
					})()
					: null,
				status: "Scheduled",
				tech_ids: selectedTechIds,
			};

			const parseResult = CreateJobVisitSchema.safeParse(newVisit);

			if (!parseResult.success) {
				setErrors(parseResult.error);
				return;
			}

			setIsLoading(true);

			try {
				const createdVisit = await createVisit(newVisit);

				if (onSuccess) {
					onSuccess(createdVisit);
				} else {
					setIsModalOpen(false);
				}
			} catch (error) {
				console.error("Failed to create visit:", error);
			} finally {
				setIsLoading(false);
			}
		}
	};

	let scheduleTypeErrors;
	let startTimeErrors;
	let endTimeErrors;
	let windowErrors;

	if (errors) {
		scheduleTypeErrors = errors.issues.filter((err) => err.path[0] === "schedule_type");
		startTimeErrors = errors.issues.filter((err) => err.path[0] === "scheduled_start_at");
		endTimeErrors = errors.issues.filter((err) => err.path[0] === "scheduled_end_at");
		windowErrors = errors.issues.filter((err) => 
			err.path[0] === "arrival_window_start" || err.path[0] === "arrival_window_end"
		);
	}

	const content = (
		<>
			<h2 className="text-2xl font-bold mb-4">Create Visit</h2>
			
			{preselectedTechId && (
				<div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-md">
					<p className="text-sm text-blue-300">
						Creating visit with pre-selected technician
					</p>
				</div>
			)}

			<p className="mb-1 mt-4 hover:color-accent">Visit Date</p>
			<DatePicker 
				value={startDate} 
				onChange={setStartDate} 
			/>

			<p className="mb-1 mt-4 hover:color-accent">Schedule Type</p>
			<div className="flex w-full border border-zinc-700 rounded-md overflow-hidden">
				<button
					type="button"
					className={`flex-1 py-2 text-sm ${
						scheduleType === "all_day"
							? "bg-blue-600 text-white"
							: "bg-zinc-900 text-gray-300 hover:bg-zinc-800"
					}`}
					onClick={() => setScheduleType("all_day")}
					disabled={isLoading}
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
					onClick={() => setScheduleType("exact")}
					disabled={isLoading}
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
					onClick={() => setScheduleType("window")}
					disabled={isLoading}
				>
					Arrival Window
				</button>
			</div>

			{scheduleTypeErrors && (
				<div>
					{scheduleTypeErrors.map((err) => (
						<h3 className="my-1 text-red-300" key={err.message}>
							{err.message}
						</h3>
					))}
				</div>
			)}

			{scheduleType === "exact" && (
				<div className="mt-4 grid grid-cols-2 gap-4">
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
				<div className="mt-4 space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="mb-1">Window Start</p>
							<TimePicker 
								value={windowStart} 
								onChange={setWindowStart} 
							/>
						</div>
						<div>
							<p className="mb-1">Window End</p>
							<TimePicker 
								value={windowEnd} 
								onChange={setWindowEnd} 
							/>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="mb-1">Estimated Duration</p>
							<DurationPicker 
								value={duration}
								onChange={setDuration}
							/>
						</div>
					</div>
				</div>
			)}

			{(startTimeErrors || endTimeErrors) && (
				<div className="mt-2">
					{startTimeErrors?.map((err) => (
						<h3 className="my-1 text-red-300" key={err.message}>
							{err.message}
						</h3>
					))}
					{endTimeErrors?.map((err) => (
						<h3 className="my-1 text-red-300" key={err.message}>
							{err.message}
						</h3>
					))}
				</div>
			)}

			{windowErrors && (
				<div className="mt-2">
					{windowErrors.map((err) => (
						<h3 className="my-1 text-red-300" key={err.message}>
							{err.message}
						</h3>
					))}
				</div>
			)}

			<p className="mb-2 mt-4 hover:color-accent">Assign Technicians</p>
			<div className="border border-zinc-800 rounded-sm p-3 max-h-48 overflow-y-auto">
				{technicians && technicians.length > 0 ? (
					<div className="space-y-2">
						{technicians.map((tech) => (
							<label
								key={tech.id}
								className="flex items-center gap-2 cursor-pointer hover:bg-zinc-800 p-2 rounded transition-colors"
							>
								<input
									type="checkbox"
									checked={selectedTechIds.includes(tech.id)}
									onChange={() => handleTechSelection(tech.id)}
									disabled={isLoading}
									className="w-4 h-4 accent-blue-600"
								/>
								<span className="text-white text-sm">
									{tech.name} - {tech.title}
								</span>
								<span className={`ml-auto text-xs px-2 py-0.5 rounded ${
									tech.status === "Available" 
										? "bg-green-500/20 text-green-400"
										: tech.status === "Busy"
										? "bg-red-500/20 text-red-400"
										: "bg-zinc-500/20 text-zinc-400"
								}`}>
									{tech.status}
								</span>
							</label>
						))}
					</div>
				) : (
					<p className="text-zinc-400 text-sm">No technicians available</p>
				)}
			</div>

			{selectedTechIds.length > 0 && (
				<p className="text-sm text-zinc-400 mt-2">
					{selectedTechIds.length} technician{selectedTechIds.length > 1 ? 's' : ''} selected
				</p>
			)}

			<div className="transition-all flex justify-end space-x-2 mt-6">
				{isLoading ? (
					<LoadSvg className="w-10 h-10" />
				) : (
					<>
						<div
							className="border-1 border-zinc-800 rounded-sm cursor-pointer hover:bg-zinc-800 transition-all"
							onClick={() => setIsModalOpen(false)}
						>
							<Button label="Cancel" />
						</div>
						<div
							className="border-1 border-zinc-800 rounded-sm cursor-pointer hover:bg-zinc-800 transition-all font-bold"
							onClick={() => {
								invokeCreate();
							}}
						>
							<Button label="Create Visit" />
						</div>
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
};

export default CreateJobVisit;