import LoadSvg from "../../assets/icons/loading.svg?react";
import Button from "../ui/Button";
import { useRef, useState } from "react";
import type { ZodError } from "zod";
import FullPopup from "../ui/FullPopup";
import { CreateJobSchema, type CreateJobInput } from "../../types/jobs";
import { useAllClientsQuery } from "../../hooks/useClients";
import Dropdown from "../ui/Dropdown";
import DatePicker from "../ui/DatePicker";

interface CreateJobProps {
	isModalOpen: boolean;
	setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
	createJob: (input: CreateJobInput) => Promise<string>;
}

const CreateJob = ({ isModalOpen, setIsModalOpen, createJob }: CreateJobProps) => {
	const nameRef = useRef<HTMLInputElement>(null);
	const addressRef = useRef<HTMLInputElement>(null);
	const descRef = useRef<HTMLTextAreaElement>(null);
	const clientRef = useRef<HTMLSelectElement>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState<ZodError | null>(null);
	const {
		data: clients,
		// isLoading: isFetchLoading,
		// error: fetchError,
	} = useAllClientsQuery();
	const [startDate, setStartDate] = useState<Date>(new Date());

	let dropdownEntries;

	if (clients && clients.length) {
		dropdownEntries = (
			<>
				{clients.map((c) => (
					<option value={c.id} key={c.id} className="text-black">
						{c.name}
					</option>
				))}
			</>
		);
	} else {
		dropdownEntries = (
			<>
				<option disabled selected value={""} className="text-black">
					No clients found
				</option>
			</>
		);
	}

	const invokeCreate = async () => {
		if (
			nameRef.current &&
			clientRef.current &&
			addressRef.current &&
			descRef.current &&
			!isLoading
		) {
			const labelValue = nameRef.current.value.trim();
			const clientValue = clientRef.current.value.trim();
			const addressValue = addressRef.current.value.trim();
			const descValue = descRef.current.value.trim();

			const newJob: CreateJobInput = {
				name: labelValue,
				tech_ids: [],
				client_id: clientValue,
				address: addressValue,
				description: descValue,
				status: "Unscheduled",
				start_date: startDate,
			};

			const parseResult = CreateJobSchema.safeParse(newJob);

			if (!parseResult.success) {
				setErrors(parseResult.error);
				return;
			}

			setErrors(null);
			setIsLoading(true);

			await createJob(newJob);

			setIsLoading(false);
			setIsModalOpen(false);
		}
	};

	let nameErrors;
	let addressErrors;

	if (errors) {
		nameErrors = errors.issues.filter((err) => err.path[0] == "name");
		addressErrors = errors.issues.filter((err) => err.path[0] == "address");
	}

	const content = (
		<>
			<h2 className="text-2xl font-bold mb-4">Create New Job</h2>
			<p className="mb-1 hover:color-accent">Name</p>
			<input
				type="text"
				placeholder="Job Name"
				className="border border-zinc-800 p-2 w-full rounded-sm"
				disabled={isLoading}
				ref={nameRef}
			/>

			{nameErrors && (
				<div>
					{" "}
					{nameErrors.map((err) => (
						<h3 className="my-1 text-red-300" key={err.message}>
							{err.message}
						</h3>
					))}
				</div>
			)}

			<p className="mb-1 mt-3 hover:color-accent">Address</p>
			<input
				type="text"
				placeholder="Job Address"
				className="border border-zinc-800 p-2 w-full rounded-sm"
				disabled={isLoading}
				ref={addressRef}
			/>

			{addressErrors && (
				<div>
					{" "}
					{addressErrors.map((err) => (
						<h3 className="my-1 text-red-300" key={err.message}>
							{err.message}
						</h3>
					))}
				</div>
			)}

			<p className="mb-1 mt-3 hover:color-accent">Client</p>
			<div className="border border-zinc-800 rounded-sm">
				<Dropdown refToApply={clientRef} entries={dropdownEntries} />
			</div>

			<DatePicker label="Start Date" value={startDate} onChange={setStartDate} />

			<p className="mb-1 mt-3 hover:color-accent">Description</p>
			<textarea
				placeholder="Job Description"
				className="border border-zinc-800 p-2 w-full h-15 rounded-sm"
				disabled={isLoading}
				ref={descRef}
			></textarea>

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
							onClick={() => {
								invokeCreate();
							}}
						>
							<Button label="Create" />
						</div>{" "}
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

export default CreateJob;
