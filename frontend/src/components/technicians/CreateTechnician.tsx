import LoadSvg from "../../assets/icons/loading.svg?react";
import Button from "../ui/Button";
import { useRef, useState } from "react";
import type { ZodError } from "zod";
import FullPopup from "../ui/FullPopup";
import { CreateTechnicianSchema, type CreateTechnicianInput } from "../../types/technicians";

interface CreateTechnicianProps {
	isModalOpen: boolean;
	setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
	createTechnician: (input: CreateTechnicianInput) => Promise<string>;
}

const CreateTechnician = ({ isModalOpen, setIsModalOpen, createTechnician }: CreateTechnicianProps) => {
	const nameRef = useRef<HTMLInputElement>(null);
	const emailRef = useRef<HTMLInputElement>(null);
	const phoneRef = useRef<HTMLInputElement>(null);
	const passwordRef = useRef<HTMLInputElement>(null);
	const titleRef = useRef<HTMLInputElement>(null);
	const descriptionRef = useRef<HTMLTextAreaElement>(null);
	const statusRef = useRef<HTMLSelectElement>(null);
	const hireDateRef = useRef<HTMLInputElement>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState<ZodError | null>(null);

	const invokeCreate = async () => {
		if (
			nameRef.current &&
			emailRef.current &&
			phoneRef.current &&
			passwordRef.current &&
			titleRef.current &&
			descriptionRef.current &&
			statusRef.current &&
			hireDateRef.current &&
			!isLoading
		) {
			const nameValue = nameRef.current.value.trim();
			const emailValue = emailRef.current.value.trim();
			const phoneValue = phoneRef.current.value.trim();
			const passwordValue = passwordRef.current.value.trim();
			const titleValue = titleRef.current.value.trim();
			const descriptionValue = descriptionRef.current.value.trim();
			const statusValue = statusRef.current.value as CreateTechnicianInput["status"];
			const hireDateValue = hireDateRef.current.value ? new Date(hireDateRef.current.value) : new Date();

			const newTechnician: CreateTechnicianInput = {
				name: nameValue,
				email: emailValue,
				phone: phoneValue,
				password: passwordValue,
				title: titleValue,
				description: descriptionValue,
				status: statusValue,
				hire_date: hireDateValue,
			};

			const parseResult = CreateTechnicianSchema.safeParse(newTechnician);

			if (!parseResult.success) {
				setErrors(parseResult.error);
				return;
			}

			setErrors(null);
			setIsLoading(true);

			await createTechnician(newTechnician);

			setIsLoading(false);
			setIsModalOpen(false);
		}
	};

	let nameErrors;
	let emailErrors;
	let phoneErrors;
	let passwordErrors;
	let titleErrors;

	if (errors) {
		nameErrors = errors.issues.filter((err) => err.path[0] == "name");
		emailErrors = errors.issues.filter((err) => err.path[0] == "email");
		phoneErrors = errors.issues.filter((err) => err.path[0] == "phone");
		passwordErrors = errors.issues.filter((err) => err.path[0] == "password");
		titleErrors = errors.issues.filter((err) => err.path[0] == "title");
	}

	const content = (
		<>
			<h2 className="text-2xl font-bold mb-4">Create New Technician</h2>
			
			<p className="mb-1 hover:color-accent">Name</p>
			<input
				type="text"
				placeholder="Full Name"
				className="border border-zinc-800 p-2 w-full rounded-sm"
				disabled={isLoading}
				ref={nameRef}
			/>
			{nameErrors && (
				<div>
					{nameErrors.map((err) => (
						<h3 className="my-1 text-red-300" key={err.message}>
							{err.message}
						</h3>
					))}
				</div>
			)}

			<p className="mb-1 mt-3 hover:color-accent">Email</p>
			<input
				type="email"
				placeholder="email@example.com"
				className="border border-zinc-800 p-2 w-full rounded-sm"
				disabled={isLoading}
				ref={emailRef}
			/>
			{emailErrors && (
				<div>
					{emailErrors.map((err) => (
						<h3 className="my-1 text-red-300" key={err.message}>
							{err.message}
						</h3>
					))}
				</div>
			)}

			<p className="mb-1 mt-3 hover:color-accent">Phone</p>
			<input
				type="tel"
				placeholder="(555) 123-4567"
				className="border border-zinc-800 p-2 w-full rounded-sm"
				disabled={isLoading}
				ref={phoneRef}
			/>
			{phoneErrors && (
				<div>
					{phoneErrors.map((err) => (
						<h3 className="my-1 text-red-300" key={err.message}>
							{err.message}
						</h3>
					))}
				</div>
			)}

			<p className="mb-1 mt-3 hover:color-accent">Password</p>
			<input
				type="password"
				placeholder="Minimum 8 characters"
				className="border border-zinc-800 p-2 w-full rounded-sm"
				disabled={isLoading}
				ref={passwordRef}
			/>
			{passwordErrors && (
				<div>
					{passwordErrors.map((err) => (
						<h3 className="my-1 text-red-300" key={err.message}>
							{err.message}
						</h3>
					))}
				</div>
			)}

			<p className="mb-1 mt-3 hover:color-accent">Title</p>
			<input
				type="text"
				placeholder="e.g. Senior Technician"
				className="border border-zinc-800 p-2 w-full rounded-sm"
				disabled={isLoading}
				ref={titleRef}
			/>
			{titleErrors && (
				<div>
					{titleErrors.map((err) => (
						<h3 className="my-1 text-red-300" key={err.message}>
							{err.message}
						</h3>
					))}
				</div>
			)}

			<p className="mb-1 mt-3 hover:color-accent">Description</p>
			<textarea
				placeholder="Brief description or notes..."
				className="border border-zinc-800 p-2 w-full rounded-sm h-20 resize-none"
				disabled={isLoading}
				ref={descriptionRef}
			/>

			<div className="grid grid-cols-2 gap-4 mt-3">
				<div>
					<p className="mb-1 hover:color-accent">Status</p>
					<select
						className="border border-zinc-800 p-2 w-full rounded-sm bg-zinc-900 text-white"
						disabled={isLoading}
						ref={statusRef}
						defaultValue="Offline"
					>
						<option value="Offline">Offline</option>
						<option value="Available">Available</option>
						<option value="Busy">Busy</option>
						<option value="Break">Break</option>
					</select>
				</div>

				<div>
					<p className="mb-1 hover:color-accent">Hire Date</p>
					<input
						type="date"
						className="border border-zinc-800 p-2 w-full rounded-sm bg-zinc-900 text-white"
						disabled={isLoading}
						ref={hireDateRef}
						defaultValue={new Date().toISOString().split('T')[0]}
					/>
				</div>
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
							onClick={() => {
								invokeCreate();
							}}
						>
							<Button label="Create" />
						</div>
					</>
				)}
			</div>
		</>
	);

	return <FullPopup content={content} isModalOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />;
};

export default CreateTechnician;