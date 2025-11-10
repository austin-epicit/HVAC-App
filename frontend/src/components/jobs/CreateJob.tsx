// import { Link, useNavigate } from "@tanstack/react-router";
// import LoadSvg from "../../assets/icons/load-dots.svg?react";
// import Button from "../General/Button";
// import { useRef, useState } from "react";
// import { DataLifespanDuration } from "../../types/plans";
// import type { ZodError } from "zod";
// import { BucketSchema } from "../../hooks/useBuckets";
// import FullPopup from "../General/FullPopup";
// import Dropdown from "../General/Dropdown";

// interface CreateJobProps {
// 	isModalOpen: boolean;
// 	setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
// 	createJob: (label: string, dataDuration: DataLifespanDuration) => Promise<string>;
// }

// const CreateJob = ({ isModalOpen, setIsModalOpen, createJob }: CreateJobProps) => {
// 	const nameRef = useRef<HTMLInputElement>(null);
// 	const durationRef = useRef<HTMLSelectElement>(null);
// 	const [isLoading, setIsLoading] = useState(false);
// 	const [errors, setErrors] = useState<ZodError | null>(null);

// 	const invokeCreate = async () => {
// 		if (nameRef.current && durationRef.current && !isLoading) {
// 			const labelValue = nameRef.current.value.trim();
// 			const durationValue = durationRef.current.value.trim();
// 			const parseResult = BucketSchema.safeParse({
// 				label: labelValue,
// 				dataLifespan: durationValue,
// 			});

// 			if (!parseResult.success) {
// 				setErrors(parseResult.error);
// 				return;
// 			}

// 			setIsLoading(true);

// 			const dataDuration = durationValue as keyof typeof DataLifespanDuration;

// 			const id = await createJob(labelValue, DataLifespanDuration[dataDuration]);
// 		}
// 	};

// 	let labelErrors;
// 	let durationErrors;

// 	if (errors) {
// 		labelErrors = errors.issues.filter((err) => err.path[0] == "label");
// 		durationErrors = errors.issues.filter((err) => err.path[0] == "dataLifespan");
// 	}

// 	const dropdownEntries = (
// 		<>
// 			{Object.entries(DataLifespanDuration).map(([keyName, duration]) => (
// 				<option value={keyName} key={keyName}>
// 					{duration}
// 				</option>
// 			))}
// 		</>
// 	);

// 	const content = (
// 		<>
// 			<h2 className="text-2xl font-bold mb-4">Create New Bucket</h2>
// 			<p className="mb-1 hover:color-accent">Name</p>
// 			<input
// 				type="text"
// 				placeholder="Bucket Name"
// 				className="border border-gray-300 p-2 w-full rounded-sm"
// 				disabled={isLoading}
// 				ref={nameRef}
// 			/>

// 			{labelErrors && (
// 				<div>
// 					{" "}
// 					{labelErrors.map((err) => (
// 						<h3 className="my-1 color-accent" key={err.message}>
// 							{err.message}
// 						</h3>
// 					))}
// 				</div>
// 			)}

// 			<div className="mb-1 mt-4 flex">
// 				<p>Data Lifespan</p>
// 				<div className="flex-1"></div>
// 				<Link
// 					to="/learn/data-lifespan"
// 					target="_blank"
// 					className="underline color-accent"
// 				>
// 					{"Learn more"}
// 				</Link>
// 			</div>

// 			<Dropdown
// 				entries={dropdownEntries}
// 				disabled={isLoading}
// 				refToApply={durationRef}
// 			/>

// 			{durationErrors && (
// 				<div>
// 					{" "}
// 					{durationErrors.map((err) => (
// 						<h3 className="my-1 color-accent" key={err.message}>
// 							{err.message}
// 						</h3>
// 					))}
// 				</div>
// 			)}

// 			<div className="transition-all flex justify-end space-x-2 mt-4">
// 				{isLoading ? (
// 					<LoadSvg className="color-accent w-10 h-10 bg-white" />
// 				) : (
// 					<>
// 						<div
// 							className="border-1 border-gray-300 rounded-sm cursor-pointer hover:bg-gray-100 transition-all"
// 							onClick={() => setIsModalOpen(false)}
// 						>
// 							<Button label="Cancel" />
// 						</div>
// 						<div
// 							className="transition-all rounded-sm cursor-pointer bg-accent text-white font-bold"
// 							onClick={() => {
// 								invokeCreate();
// 							}}
// 						>
// 							<Button label="Create" />
// 						</div>{" "}
// 					</>
// 				)}
// 			</div>
// 		</>
// 	);

// 	return <FullPopup content={content} isModalOpen={isModalOpen} />;
// };

// export default CreateJob;
