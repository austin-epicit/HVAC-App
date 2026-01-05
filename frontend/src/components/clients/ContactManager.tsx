import { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, X, Search, Link as LinkIcon } from "lucide-react";
import Card from "../ui/Card";
import type {
	ClientContactLink,
	CreateContactInput,
	UpdateContactInput,
	UpdateClientContactInput,
	Contact,
} from "../../types/clients";
import {
	useClientContactsQuery,
	useCreateContactMutation,
	useUpdateContactMutation,
	useUpdateClientContactMutation,
	useUnlinkContactFromClientMutation,
	useSearchContactsQuery,
	useLinkContactMutation,
} from "../../hooks/useClients";

interface ContactManagerProps {
	clientId: string;
}

type FormMode = "create" | "link";

export default function ContactManager({ clientId }: ContactManagerProps) {
	const formRef = useRef<HTMLDivElement>(null);
	const [isAdding, setIsAdding] = useState(false);
	const [formMode, setFormMode] = useState<FormMode>("create");
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
	const [isPrimary, setIsPrimary] = useState(false);
	const [isBilling, setIsBilling] = useState(false);

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
	const [showSearchResults, setShowSearchResults] = useState(false);
	const { data: contactLinks, isLoading } = useClientContactsQuery(clientId);

	// Search query (only enabled when in link mode and searching)
	const { data: searchResults, isLoading: isSearching } = useSearchContactsQuery(
		searchQuery,
		clientId,
		formMode === "link" && searchQuery.length >= 2
	);

	const createContact = useCreateContactMutation();
	const updateContact = useUpdateContactMutation();
	const updateRelationship = useUpdateClientContactMutation();
	const unlinkContact = useUnlinkContactFromClientMutation();
	const linkContact = useLinkContactMutation();

	const resetForm = () => {
		setFormData({
			name: "",
			email: "",
			phone: "",
			relationship: "",
			company: "",
			title: "",
		});
		setIsPrimary(false);
		setIsBilling(false);
		setIsAdding(false);
		setFormMode("create");
		setEditingId(null);
		setErrorMessage(null);
		setSearchQuery("");
		setSelectedContact(null);
		setShowSearchResults(false);
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

		if (formMode === "link" && !selectedContact) {
			setErrorMessage("Please select a contact to link");
			return;
		}

		// Client gets one primary and one billing contact
		const otherPrimaryExists = contactLinks?.some(
			(link) => link.is_primary && link.contact?.id !== editingId
		);
		const otherBillingExists = contactLinks?.some(
			(link) => link.is_billing && link.contact?.id !== editingId
		);
		if (isPrimary && otherPrimaryExists) {
			setErrorMessage(
				editingId
					? "Another contact is already set as primary. Please remove the primary status from that contact first."
					: "A primary contact already exists. Please edit the existing primary contact or remove its primary status first."
			);
			return;
		}
		if (isBilling && otherBillingExists) {
			setErrorMessage(
				editingId
					? "Another contact is already set as billing. Please remove the billing status from that contact first."
					: "A billing contact already exists. Please edit the existing billing contact or remove its billing status first."
			);
			return;
		}

		try {
			if (formMode === "link" && selectedContact) {
				await linkContact.mutateAsync({
					clientId,
					data: {
						contact_id: selectedContact.id,
						relationship: formData.relationship || "contact",
						is_primary: isPrimary,
						is_billing: isBilling,
					},
				});
			} else if (editingId) {
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

				await updateRelationship.mutateAsync({
					clientId,
					contactId: editingId,
					data: {
						relationship: formData.relationship,
						is_primary: isPrimary,
						is_billing: isBilling,
					} as UpdateClientContactInput,
				});
			} else {
				await createContact.mutateAsync({
					name: formData.name || "",
					email: formData.email || "",
					phone: formData.phone || "",
					company: formData.company || "",
					title: formData.title || "",
					// Auto-link to client during creation
					client_id: clientId,
					relationship: formData.relationship || "contact",
					is_primary: isPrimary,
					is_billing: isBilling,
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
		const contact = contactLink.contact;
		if (!contact) return;

		setFormData({
			name: contact.name,
			email: contact.email || "",
			phone: contact.phone || "",
			company: contact.company || "",
			title: contact.title || "",
			relationship: contactLink.relationship,
		});
		setIsPrimary(contactLink.is_primary || false);
		setIsBilling(contactLink.is_billing || false);
		setEditingId(contact.id);
		setFormMode("create");
		setIsAdding(true);
	};

	const handleUnlink = async (contactLink: ClientContactLink) => {
		if (!contactLink.contact) return;

		if (deleteConfirmId !== contactLink.contact.id) {
			setDeleteConfirmId(contactLink.contact.id);
			return;
		}

		try {
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

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchQuery(value);
		setShowSearchResults(value.length >= 2);
		if (selectedContact) {
			setSelectedContact(null);
			setFormData({
				name: "",
				email: "",
				phone: "",
				relationship: "",
				company: "",
				title: "",
			});
		}
	};

	const handleSelectContact = (contact: Contact) => {
		setSelectedContact(contact);
		setSearchQuery(contact.name);
		setShowSearchResults(false);
		// Pre-fill form with contact data (read-only)
		setFormData({
			name: contact.name,
			email: contact.email || "",
			phone: contact.phone || "",
			company: contact.company || "",
			title: contact.title || "",
			relationship: "", // User must set this
		});
	};

	if (isLoading) {
		return (
			<Card title="Contacts">
				<div className="text-zinc-400">Loading contacts...</div>
			</Card>
		);
	}

	// Disable checkbox if another contact is already primary/billing
	const shouldDisablePrimary =
		contactLinks?.some((link) => link.is_primary && link.contact?.id !== editingId) ||
		false;

	const shouldDisableBilling =
		contactLinks?.some((link) => link.is_billing && link.contact?.id !== editingId) ||
		false;

	return (
		<Card
			title="Contacts"
			headerAction={
				<div className="flex gap-2">
					<button
						onClick={() => {
							setFormMode("link");
							setIsAdding(true);
						}}
						className="flex items-center gap-2 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-md text-sm font-medium transition-colors"
					>
						<LinkIcon size={14} />
						Link Existing
					</button>
					<button
						onClick={() => {
							setFormMode("create");
							setIsAdding(true);
						}}
						className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors"
					>
						<Plus size={14} />
						Add Contact
					</button>
				</div>
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
									: formMode === "link"
										? "Link Existing Contact"
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
							{/* Search bar in link mode */}
							{formMode === "link" && !editingId && (
								<div className="relative">
									<div className="relative">
										<Search
											size={16}
											className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
										/>
										<input
											type="text"
											placeholder="* Search contact by name, email, or phone..."
											value={
												searchQuery
											}
											onChange={
												handleSearchChange
											}
											className="w-full pl-10 pr-3 py-2 bg-zinc-900 border-2 border-zinc-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
											required
											autoComplete="off"
										/>
									</div>

									{/* Search Results Dropdown */}
									{showSearchResults && (
										<div className="absolute z-10 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
											{isSearching ? (
												<div className="p-3 text-sm text-zinc-400">
													Searching...
												</div>
											) : searchResults &&
											  searchResults.length >
													0 ? (
												searchResults.map(
													(
														contact
													) => (
														<button
															key={
																contact.id
															}
															type="button"
															onClick={() =>
																handleSelectContact(
																	contact
																)
															}
															className="w-full px-3 py-2 text-left hover:bg-zinc-800 transition-colors border-b border-zinc-800 last:border-b-0"
														>
															<div className="text-white text-sm font-medium">
																{
																	contact.name
																}
															</div>
															<div className="flex gap-3 text-xs text-zinc-400 mt-1">
																{contact.email && (
																	<span>
																		{
																			contact.email
																		}
																	</span>
																)}
																{contact.phone && (
																	<span>
																		{
																			contact.phone
																		}
																	</span>
																)}
																{contact.company && (
																	<span>
																		{
																			contact.company
																		}
																	</span>
																)}
															</div>
														</button>
													)
												)
											) : (
												<div className="p-3 text-sm text-zinc-400">
													No
													contacts
													found
												</div>
											)}
										</div>
									)}
								</div>
							)}

							{/* Name field - only in create/edit mode */}
							{(formMode === "create" || editingId) && (
								<div>
									<input
										type="text"
										name="name"
										placeholder="* Name"
										value={
											formData.name
										}
										onChange={
											handleChange
										}
										className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
										required
									/>
								</div>
							)}

							{/* Contact details - shown after selection in link mode or always in create/edit */}
							{((formMode === "link" &&
								selectedContact) ||
								formMode === "create" ||
								editingId) && (
								<>
									<div className="grid grid-cols-2 gap-3">
										<input
											type="email"
											name="email"
											placeholder="Email"
											value={
												formData.email
											}
											onChange={
												handleChange
											}
											className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
											disabled={
												formMode ===
													"link" &&
												!!selectedContact
											}
										/>
										<input
											type="tel"
											name="phone"
											placeholder="Phone"
											value={
												formData.phone
											}
											onChange={
												handleChange
											}
											className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
											disabled={
												formMode ===
													"link" &&
												!!selectedContact
											}
										/>
									</div>
									<div className="grid grid-cols-2 gap-3">
										<input
											type="text"
											name="company"
											placeholder="Company"
											value={
												formData.company
											}
											onChange={
												handleChange
											}
											className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
											disabled={
												formMode ===
													"link" &&
												!!selectedContact
											}
										/>
										<input
											type="text"
											name="title"
											placeholder="Title"
											value={
												formData.title
											}
											onChange={
												handleChange
											}
											className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
											disabled={
												formMode ===
													"link" &&
												!!selectedContact
											}
										/>
									</div>

									{/* Relationship and Primary/Billing*/}
									<div className="grid grid-cols-2 gap-3">
										<div>
											<input
												type="text"
												name="relationship"
												placeholder="* Relationship (e.g., Owner, Manager)"
												value={
													formData.relationship
												}
												onChange={
													handleChange
												}
												className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
												required
											/>
										</div>

										{/* Primary and Billing Checkboxes */}
										<div className="flex gap-2">
											<label
												className={`flex-1 flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md transition-colors ${
													shouldDisablePrimary
														? "cursor-not-allowed opacity-60"
														: "cursor-pointer hover:border-zinc-600"
												}`}
											>
												<input
													type="checkbox"
													checked={
														isPrimary
													}
													onChange={(
														e
													) =>
														setIsPrimary(
															e
																.target
																.checked
														)
													}
													disabled={
														shouldDisablePrimary
													}
													className="w-4 h-4 rounded bg-zinc-800 border-zinc-600 text-blue-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
												/>
												<span
													className={`text-sm ${shouldDisablePrimary ? "text-zinc-500" : "text-white"}`}
												>
													Primary
												</span>
											</label>

											<label
												className={`flex-1 flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md transition-colors ${
													shouldDisableBilling
														? "cursor-not-allowed opacity-60"
														: "cursor-pointer hover:border-zinc-600"
												}`}
											>
												<input
													type="checkbox"
													checked={
														isBilling
													}
													onChange={(
														e
													) =>
														setIsBilling(
															e
																.target
																.checked
														)
													}
													disabled={
														shouldDisableBilling
													}
													className="w-4 h-4 rounded bg-zinc-800 border-zinc-600 text-blue-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
												/>
												<span
													className={`text-sm ${shouldDisableBilling ? "text-zinc-500" : "text-white"}`}
												>
													Billing
												</span>
											</label>
										</div>
									</div>

									{(shouldDisablePrimary ||
										shouldDisableBilling) && (
										<div className="text-xs text-amber-400 space-y-1">
											{shouldDisablePrimary && (
												<p>
													*
													A
													primary
													contact
													already
													exists
													for
													this
													client
												</p>
											)}
											{shouldDisableBilling && (
												<p>
													*
													A
													billing
													contact
													already
													exists
													for
													this
													client
												</p>
											)}
										</div>
									)}

									<button
										type="submit"
										disabled={
											createContact.isPending ||
											updateContact.isPending ||
											linkContact.isPending ||
											(formMode ===
												"link" &&
												!selectedContact)
										}
										className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-md text-sm font-medium transition-colors"
									>
										{createContact.isPending ||
										updateContact.isPending ||
										linkContact.isPending
											? "Saving..."
											: editingId
												? "Update Contact"
												: formMode ===
													  "link"
													? "Link Contact"
													: "Add Contact"}
									</button>
								</>
							)}
						</form>
					</div>
				)}

				<div className="space-y-3">
					{contactLinks && contactLinks.length > 0 ? (
						<div className="flex flex-wrap gap-4">
							{contactLinks.map((contactLink) => {
								const contact = contactLink.contact;
								if (!contact) return null;

								return (
									<div
										key={contact.id}
										className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 group hover:border-zinc-600 transition-colors flex-shrink-0 w-[320px]"
									>
										<div className="flex justify-between items-start mb-2">
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-1">
													<h3 className="text-white font-semibold">
														{
															contact.name
														}
													</h3>
													{contactLink.is_primary && (
														<span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded">
															Primary
														</span>
													)}
													{contactLink.is_billing && (
														<span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded">
															Billing
														</span>
													)}
												</div>
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
