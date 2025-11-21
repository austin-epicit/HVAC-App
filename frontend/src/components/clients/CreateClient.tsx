import LoadSvg from "../../assets/icons/loading.svg?react";
import Button from "../ui/Button";
import { useRef, useState } from "react";
import type { ZodError } from "zod";
import FullPopup from "../ui/FullPopup";
import { CreateClientSchema, type CreateClientInput } from "../../types/clients";

interface CreateClientProps {
	isModalOpen: boolean;
	setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
	createClient: (input: CreateClientInput) => Promise<string>;
}

const CreateClient = ({ isModalOpen, setIsModalOpen, createClient }: CreateClientProps) => {
	const nameRef = useRef<HTMLInputElement>(null);
	const addressRef = useRef<HTMLInputElement>(null);
	const activeRef = useRef<HTMLInputElement>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState<ZodError | null>(null);

	const invokeCreate = async () => {
		if (nameRef.current && addressRef.current && activeRef.current && !isLoading) {
			const labelValue = nameRef.current.value.trim();
			const addressValue = addressRef.current.value.trim();
			const activeValue = activeRef.current.value.trim() == "Active";

			const newClient: CreateClientInput = {
				name: labelValue,
				address: addressValue,
				is_active: activeValue,
			};

			const parseResult = CreateClientSchema.safeParse(newClient);

			if (!parseResult.success) {
				setErrors(parseResult.error);
				return;
			}

			setErrors(null);
			setIsLoading(true);

			await createClient(newClient);

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
			<h2 className="text-2xl font-bold mb-4">Create New Client</h2>
			<p className="mb-1 hover:color-accent">Name</p>
			<input
				type="text"
				placeholder="Client Name"
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
				placeholder="Client Address"
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

			<div className="flex mt-3">
				<p className="">Active</p>
				<input
					type="checkbox"
					className="ml-2"
					disabled={isLoading}
					ref={activeRef}
				/>
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
						</div>{" "}
					</>
				)}
			</div>
		</>
	);

	return <FullPopup content={content} isModalOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />;
};

export default CreateClient;
