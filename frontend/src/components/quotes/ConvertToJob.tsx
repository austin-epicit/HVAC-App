import LoadSvg from "../../assets/icons/loading.svg?react";
import Button from "../ui/Button";
import { useRef, useState, useEffect } from "react";
import FullPopup from "../ui/FullPopup";
import { JobPriorityValues, type CreateJobInput } from "../../types/jobs";
import type { Quote } from "../../types/quotes";
import type { GeocodeResult } from "../../types/location";
import Dropdown from "../ui/Dropdown";
import AddressForm from "../ui/AddressForm";

interface ConvertToJobProps {
	isModalOpen: boolean;
	setIsModalOpen: (open: boolean) => void;
	quote: Quote;
	onConvert: (jobData: CreateJobInput) => Promise<string>;
}

export default function ConvertToJob({
	isModalOpen,
	setIsModalOpen,
	quote,
	onConvert,
}: ConvertToJobProps) {
	const nameRef = useRef<HTMLInputElement>(null);
	const descRef = useRef<HTMLTextAreaElement>(null);
	const priorityRef = useRef<HTMLSelectElement>(null);
	const [geoData, setGeoData] = useState<GeocodeResult | undefined>(
		quote.address || quote.coords
			? {
					address: quote.address || "",
					coords: quote.coords || undefined,
				}
			: undefined
	);
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	// Set initial priority value when modal opens (match quote priority or default to Medium)
	useEffect(() => {
		if (isModalOpen && priorityRef.current) {
			// Map quote priority to job priority if possible, otherwise default to Medium
			const quotePriority = quote.priority;
			if (JobPriorityValues.includes(quotePriority as any)) {
				priorityRef.current.value = quotePriority;
			} else {
				priorityRef.current.value = "Medium";
			}
		}
	}, [isModalOpen, quote.priority]);

	const handleChangeAddress = (result: GeocodeResult) => {
		setGeoData(() => ({
			address: result.address,
			coords: result.coords,
		}));
	};

	const priorityEntries = (
		<>
			{JobPriorityValues.map((v) => (
				<option key={v} value={v} className="text-black">
					{v}
				</option>
			))}
		</>
	);

	const invokeConvert = async () => {
		if (nameRef.current && descRef.current && priorityRef.current && !isLoading) {
			const nameValue = nameRef.current.value.trim();
			const descValue = descRef.current.value.trim();
			const priorityValue = priorityRef.current.value.trim() as
				| "Low"
				| "Medium"
				| "High"
				| "Urgent"
				| "Emergency";

			if (!nameValue) {
				setErrorMessage("Job name is required");
				return;
			}

			if (!geoData?.address) {
				setErrorMessage("Job address is required");
				return;
			}

			setErrorMessage(null);
			setIsLoading(true);

			try {
				const jobData: CreateJobInput = {
					name: nameValue,
					client_id: quote.client_id,
					quote_id: quote.id,
					request_id: quote.request_id || null,
					address: geoData.address,
					coords: geoData.coords || { lat: 0, lon: 0 },
					description: descValue,
					priority: priorityValue,
					status: "Unscheduled",
				};

				await onConvert(jobData);

				// Reset form
				if (nameRef.current) nameRef.current.value = "";
				if (descRef.current) descRef.current.value = "";
				setGeoData(undefined);

				setIsModalOpen(false);
			} catch (error) {
				console.error("Failed to convert quote to job:", error);
				setErrorMessage(
					error instanceof Error
						? error.message
						: "Failed to convert quote to job"
				);
			} finally {
				setIsLoading(false);
			}
		}
	};

	const content = (
		<>
			<h2 className="text-2xl font-bold mb-4">Convert to Job</h2>

			{errorMessage && (
				<div className="p-3 mb-4 bg-red-900/50 border border-red-700 rounded-md text-red-200 text-sm">
					{errorMessage}
				</div>
			)}

			<p className="mb-1 hover:color-accent">Job Name *</p>
			<input
				type="text"
				placeholder="Job Name"
				className="border border-zinc-800 p-2 w-full rounded-sm"
				disabled={isLoading}
				ref={nameRef}
				defaultValue={quote.title}
			/>

			<p className="mb-1 mt-3 hover:color-accent">Description</p>
			<textarea
				placeholder="Job Description"
				className="border border-zinc-800 p-2 w-full h-24 rounded-sm"
				disabled={isLoading}
				ref={descRef}
				defaultValue={quote.description}
			/>

			<p className="mb-1 mt-3 hover:color-accent">Job Address *</p>
			<AddressForm handleChange={handleChangeAddress} />
			{geoData?.address && (
				<p className="text-xs text-zinc-400 mt-1">
					Current: {geoData.address}
				</p>
			)}

			<p className="mb-1 mt-3 hover:color-accent">Priority</p>
			<div className="border border-zinc-800 rounded-sm">
				<Dropdown refToApply={priorityRef} entries={priorityEntries} />
			</div>

			<div className="p-3 mt-4 bg-amber-900/20 border border-amber-700/50 rounded-md">
				<p className="text-xs text-amber-200">
					Note: The job will be created in "Unscheduled" status and
					line items will be copied from the quote. You can create
					visits and assign technicians after creation.
				</p>
			</div>

			<div className="transition-all flex justify-end space-x-2 mt-4">
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
							onClick={invokeConvert}
						>
							<Button label="Create Job" />
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
			onClose={() => !isLoading && setIsModalOpen(false)}
		/>
	);
}
