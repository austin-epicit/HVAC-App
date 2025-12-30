import { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import Card from "../ui/Card";
import type {
	ClientContactLink,
	CreateContactInput,
	UpdateContactInput,
	UpdateClientContactInput,
} from "../../types/clients";
import {
	useClientContactsQuery,
	useCreateContactMutation,
	useUpdateContactMutation,
	useUpdateClientContactMutation,
	useUnlinkContactFromClientMutation,
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
	const [formData, setFormData] = useState<CreateContactInput | UpdateContactInput>({
		name: "",
		email: "",
		phone: "",
		relationship: "",
		company: "",
		title: "",
	});

	// Query for client's contacts (returns ClientContactLink[])
	const { data: contactLinks, isLoading } = useClientContactsQuery(clientId);

	// Mutations
	const createContact = useCreateContactMutation();
	const updateContact = useUpdateContactMutation();
	const updateRelationship = useUpdateClientContactMutation();
	const unlinkContact = useUnlinkContactFromClientMutation();

	const resetForm = () => {
		setFormData({
			name: "",
			email: "",
			phone: "",
			relationship: "",
			company: "",
			title: "",
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
				// Update the contact itself
				await updateContact.mutateAsync({
					contactId: editingId,
					data: {
						name: formData.name,
						email: formData.email,
						phone: formData.phone,
						company: formData.company,
						title: formData.title,
					} as UpdateContactInput,
				});

				// Update the relationship if it changed
				if (formData.relationship) {
					await updateRelationship.mutateAsync({
						clientId,
						contactId: editingId,
						data: {
							relationship: formData.relationship,
						} as UpdateClientContactInput,
					});
				}
			} else {
				// Create new contact and auto-link to client
				await createContact.mutateAsync({
					name: formData.name || "",
					email: formData.email || "",
					phone: formData.phone || "",
					company: formData.company || "",
					title: formData.title || "",
					// Auto-link to client during creation
					client_id: clientId,
					relationship: formData.relationship || "contact",
				} as CreateContactInput);
			}
			resetForm();
		} catch (error) {
			console.error("Failed to save contact:", error);
			const errorMsg =
				error instanceof Error ? error.message : "Failed to save contact";
			setErrorMessage(errorMsg);
		}
	};

	const handleEdit = (contactLink: ClientContactLink) => {
		// contactLink.contact contains the actual contact data
		const contact = contactLink.contact;
		if (!contact) return;

		setFormData({
			name: contact.name,
			email: contact.email || "",
			phone: contact.phone || "",
			company: contact.company || "",
			title: contact.title || "",
			relationship: contactLink.relationship, // From join table
		});
		setEditingId(contact.id);
		setIsAdding(true);
	};

	const handleUnlink = async (contactLink: ClientContactLink) => {
		if (!contactLink.contact) return;

		if (deleteConfirmId !== contactLink.contact.id) {
			setDeleteConfirmId(contactLink.contact.id);
			return;
		}

		try {
			// Unlink contact from client (doesn't delete the contact itself)
			await unlinkContact.mutateAsync({
				clientId,
				contactId: contactLink.contact.id,
			});
			setDeleteConfirmId(null);
		} catch (error) {
			console.error("Failed to unlink contact:", error);
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
					<div
						ref={formRef}
						className="p-4 bg-zinc-800 rounded-lg border border-zinc-700"
					>
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-white font-semibold">
								{editingId
									? "Edit Contact"
									: "New Contact"}
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
									placeholder="* Name"
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
								/>
								<input
									type="tel"
									name="phone"
									placeholder="Phone"
									value={formData.phone}
									onChange={handleChange}
									className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<input
									type="text"
									name="company"
									placeholder="Company"
									value={formData.company}
									onChange={handleChange}
									className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
								<input
									type="text"
									name="title"
									placeholder="Title"
									value={formData.title}
									onChange={handleChange}
									className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<div>
								<input
									type="text"
									name="relationship"
									placeholder="* Relationship (e.g., Owner, Manager, Tenant)"
									value={
										formData.relationship
									}
									onChange={handleChange}
									className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
									required
								/>
							</div>
							<button
								type="submit"
								disabled={
									createContact.isPending ||
									updateContact.isPending
								}
								className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-md text-sm font-medium transition-colors"
							>
								{createContact.isPending ||
								updateContact.isPending
									? "Saving..."
									: editingId
										? "Update Contact"
										: "Add Contact"}
							</button>
						</form>
					</div>
				)}

				<div className="space-y-3">
					{contactLinks && contactLinks.length > 0 ? (
						<div className="flex flex-wrap gap-4">
							{contactLinks.map((contactLink) => {
								// contactLink.contact contains the actual contact data
								const contact = contactLink.contact;
								if (!contact) return null;

								return (
									<div
										key={contact.id}
										className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 group hover:border-zinc-600 transition-colors flex-shrink-0 w-[320px]"
									>
										<div className="flex justify-between items-start mb-2">
											<div>
												<h3 className="text-white font-semibold">
													{
														contact.name
													}
												</h3>
												{contact.title && (
													<p className="text-xs text-zinc-400">
														{
															contact.title
														}
													</p>
												)}
											</div>
											<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
												<button
													onClick={() =>
														handleEdit(
															contactLink
														)
													}
													className="text-zinc-400 hover:text-blue-400 transition-colors"
													title="Edit contact"
												>
													<Edit2
														size={
															16
														}
													/>
												</button>
												<button
													onClick={() =>
														handleUnlink(
															contactLink
														)
													}
													onMouseLeave={() =>
														setDeleteConfirmId(
															null
														)
													}
													className={`transition-colors ${
														deleteConfirmId ===
														contact.id
															? "text-red-500 hover:text-red-600"
															: "text-zinc-400 hover:text-red-400"
													}`}
													title={
														deleteConfirmId ===
														contact.id
															? "Click again to confirm unlink"
															: "Unlink contact from client"
													}
												>
													<Trash2
														size={
															16
														}
														className={
															deleteConfirmId ===
															contact.id
																? "fill-red-500"
																: ""
														}
													/>
												</button>
											</div>
										</div>

										{/* Relationship badge */}
										<span className="inline-block text-xs text-zinc-400 bg-zinc-700 px-2 py-1 rounded mb-2">
											{
												contactLink.relationship
											}
										</span>

										{/* Company if present */}
										{contact.company && (
											<p className="text-sm text-zinc-400 mb-2">
												{
													contact.company
												}
											</p>
										)}

										{/* Contact info */}
										<div className="space-y-1">
											{contact.email && (
												<p className="text-sm text-zinc-300">
													<span className="text-zinc-500">
														Email:
													</span>{" "}
													{
														contact.email
													}
												</p>
											)}
											{contact.phone && (
												<p className="text-sm text-zinc-300">
													<span className="text-zinc-500">
														Phone:
													</span>{" "}
													{
														contact.phone
													}
												</p>
											)}
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<p className="text-zinc-400 text-sm">
							No contacts available
						</p>
					)}
				</div>
			</div>
		</Card>
	);
}
