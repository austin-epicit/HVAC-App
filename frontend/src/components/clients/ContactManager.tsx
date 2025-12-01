import { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import Card from "../ui/Card";
import type { ClientContact, CreateClientContactInput, UpdateClientContactInput } from "../../types/clients";
import {
	useClientContactsQuery,
	useCreateClientContactMutation,
	useUpdateClientContactMutation,
	useDeleteClientContactMutation,
} from "../../hooks/useClients";

interface ContactManagerProps {
	clientId: string;
}

export default function ContactManager({ clientId }: ContactManagerProps) {
	const formRef = useRef<HTMLDivElement>(null);
	const [isAdding, setIsAdding] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [formData, setFormData] = useState<CreateClientContactInput | UpdateClientContactInput>({
		name: "",
		email: "",
		phone: "",
		relation: "",
		description: "",
	});

	const { data: contacts, isLoading } = useClientContactsQuery(clientId);
	const createContact = useCreateClientContactMutation();
	const updateContact = useUpdateClientContactMutation();
	const deleteContact = useDeleteClientContactMutation();

	const resetForm = () => {
		setFormData({
			name: "",
			email: "",
			phone: "",
			relation: "",
			description: "",
		});
		setIsAdding(false);
		setEditingId(null);
		setErrorMessage(null);
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (formRef.current && !formRef.current.contains(event.target as Node)) {
				resetForm();
			}
		};

		if (isAdding) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isAdding]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrorMessage(null);

		try {
			if (editingId) {
				await updateContact.mutateAsync({
					clientId,
					contactId: editingId,
					data: formData as UpdateClientContactInput,
				});
			} else {
				await createContact.mutateAsync({
					clientId,
					data: formData as CreateClientContactInput,
				});
			}
			resetForm();
		} catch (error) {
			console.error("Failed to save contact:", error);
			const errorMsg = error instanceof Error ? error.message : "Failed to save contact";
			setErrorMessage(errorMsg);
		}
	};

	const handleEdit = (contact: ClientContact) => {
		setFormData({
			name: contact.name,
			email: contact.email,
			phone: contact.phone,
			relation: contact.relation,
			description: contact.description,
		});
		setEditingId(contact.id);
		setIsAdding(true);
	};

	const handleDelete = async (contactId: string) => {
		if (deleteConfirmId !== contactId) {
			setDeleteConfirmId(contactId);
			return;
		}

		try {
			await deleteContact.mutateAsync({ clientId, contactId });
			setDeleteConfirmId(null);
		} catch (error) {
			console.error("Failed to delete contact:", error);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	if (isLoading) {
		return (
			<Card title="Contacts">
				<div className="text-zinc-400">Loading contacts...</div>
			</Card>
		);
	}

	return (
		<Card 
			title="Contacts"
			headerAction={
				!isAdding && (
					<button
						onClick={() => setIsAdding(true)}
						className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors"
					>
						<Plus size={14} />
						Add Contact
					</button>
				)
			}
			className="h-fit"
		>
			<div className="space-y-4">
				{isAdding && (
					<div ref={formRef} className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-white font-semibold">
								{editingId ? "Edit Contact" : "New Contact"}
							</h3>
							<button
								onClick={resetForm}
								className="text-zinc-400 hover:text-white transition-colors"
							>
								<X size={20} />
							</button>
						</div>
						
						{errorMessage && (
							<div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-red-200 text-sm">
								{errorMessage}
							</div>
						)}

						<form onSubmit={handleSubmit} className="space-y-3">
							<div>
								<input
									type="text"
									name="name"
									placeholder="Name"
									value={formData.name}
									onChange={handleChange}
									className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
									required
								/>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<input
									type="email"
									name="email"
									placeholder="Email"
									value={formData.email}
									onChange={handleChange}
									className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
									required
								/>
								<input
									type="tel"
									name="phone"
									placeholder="Phone"
									value={formData.phone}
									onChange={handleChange}
									className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
									required
								/>
							</div>
							<div>
								<input
									type="text"
									name="relation"
									placeholder="Relation (e.g., Manager, Owner)"
									value={formData.relation}
									onChange={handleChange}
									className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
									required
								/>
							</div>
							<div>
								<textarea
									name="description"
									placeholder="Description (optional)"
									value={formData.description}
									onChange={handleChange}
									rows={2}
									className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<button
								type="submit"
								disabled={createContact.isPending || updateContact.isPending}
								className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-md text-sm font-medium transition-colors"
							>
								{createContact.isPending || updateContact.isPending
									? "Saving..."
									: editingId
									? "Update Contact"
									: "Add Contact"}
							</button>
						</form>
					</div>
				)}

				<div className="space-y-3">
					{contacts && contacts.length > 0 ? (
						<div className="flex flex-wrap gap-4">
							{contacts.map((contact) => (
								<div
									key={contact.id}
									className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 group hover:border-zinc-600 transition-colors w-[calc(33.333%-0.67rem)] min-w-[280px]"
								>
									<div className="flex justify-between items-start mb-2">
										<h3 className="text-white font-semibold">{contact.name}</h3>
										<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
											<button
												onClick={() => handleEdit(contact)}
												className="text-zinc-400 hover:text-blue-400 transition-colors"
											>
												<Edit2 size={16} />
											</button>
											<button
												onClick={() => handleDelete(contact.id)}
												onMouseLeave={() => setDeleteConfirmId(null)}
												className={`transition-colors ${
													deleteConfirmId === contact.id
														? "text-red-500 hover:text-red-600"
														: "text-zinc-400 hover:text-red-400"
												}`}
												title={
													deleteConfirmId === contact.id
														? "Click again to confirm"
														: "Delete contact"
												}
											>
												<Trash2 
													size={16} 
													className={deleteConfirmId === contact.id ? "fill-red-500" : ""} 
												/>
											</button>
										</div>
									</div>
									<span className="inline-block text-xs text-zinc-400 bg-zinc-700 px-2 py-1 rounded mb-2">
										{contact.relation}
									</span>
									{contact.description && (
										<p className="text-sm text-zinc-400 mb-3">{contact.description}</p>
									)}
									<div className="space-y-1">
										<p className="text-sm text-zinc-300">
											<span className="text-zinc-500">Email:</span> {contact.email}
										</p>
										<p className="text-sm text-zinc-300">
											<span className="text-zinc-500">Phone:</span> {contact.phone}
										</p>
									</div>
								</div>
							))}
						</div>
					) : (
						<p className="text-zinc-400 text-sm">No contacts available</p>
					)}
				</div>
			</div>
		</Card>
	);
}