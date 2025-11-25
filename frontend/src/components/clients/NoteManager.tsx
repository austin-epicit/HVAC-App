import { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import Card from "../ui/Card";
import type { ClientNote } from "../../types/clients";
import {
	useClientNotesQuery,
	useCreateClientNoteMutation,
	useUpdateClientNoteMutation,
	useDeleteClientNoteMutation,
} from "../../hooks/useClients";

interface NoteManagerProps {
	clientId: string;
}

export default function NoteManager({ clientId }: NoteManagerProps) {
	const formRef = useRef<HTMLDivElement>(null);
	const [isAdding, setIsAdding] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
	const [content, setContent] = useState("");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { data: notes, isLoading } = useClientNotesQuery(clientId);
	const createNote = useCreateClientNoteMutation();
	const updateNote = useUpdateClientNoteMutation();
	const deleteNote = useDeleteClientNoteMutation();

	const resetForm = () => {
		setContent("");
		setIsAdding(false);
		setEditingId(null);
		setErrorMessage(null);
	};

	// Handle click outside form
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

		if (!content.trim()) return;

		try {
			if (editingId) {
				await updateNote.mutateAsync({
					clientId,
					noteId: editingId,
					data: { content },
				});
			} else {
				await createNote.mutateAsync({
					clientId,
					data: { content },
				});
			}
			resetForm();
		} catch (error) {
			console.error("Failed to save note:", error);
			const errorMsg = error instanceof Error ? error.message : "Failed to save note";
			setErrorMessage(errorMsg);
		}
	};

	const handleEdit = (note: ClientNote) => {
		setContent(note.content);
		setEditingId(note.id);
		setIsAdding(true);
	};

	const handleDelete = async (noteId: string) => {
		if (deleteConfirmId !== noteId) {
			setDeleteConfirmId(noteId);
			return;
		}

		try {
			await deleteNote.mutateAsync({ clientId, noteId });
			setDeleteConfirmId(null);
		} catch (error) {
			console.error("Failed to delete note:", error);
		}
	};

	if (isLoading) {
		return (
			<Card title="Notes">
				<div className="text-zinc-400">Loading notes...</div>
			</Card>
		);
	}

	return (
		<Card 
			title="Notes"
			headerAction={
				<button
					onClick={() => setIsAdding(true)}
					className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors"
				>
					<Plus size={14} />
					Add Note
				</button>
			}
			className="h-fit"
		>
			<div className="space-y-4">
				{isAdding && !editingId && (
					<div ref={formRef} className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-white font-semibold">New Note</h3>
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
							<textarea
								value={content}
								onChange={(e) => setContent(e.target.value)}
								placeholder="Enter your note..."
								rows={4}
								className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
							/>
							<button
								type="submit"
								disabled={createNote.isPending || updateNote.isPending}
								className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-md text-sm font-medium transition-colors"
							>
								{createNote.isPending || updateNote.isPending
									? "Saving..."
									: "Add Note"}
							</button>
						</form>
					</div>
				)}

				<div className="space-y-3">
					{notes && notes.length > 0 ? (
						notes.map((note) => (
							<div key={note.id}>
								<div className="p-3 bg-zinc-800 rounded-lg border border-zinc-700 group hover:border-zinc-600 transition-colors">
									<div className="flex justify-between items-start mb-2">
										<p className="text-white text-sm flex-1">{note.content}</p>
										<div className="flex gap-2 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
											<button
												onClick={() => handleEdit(note)}
												className="text-zinc-400 hover:text-blue-400 transition-colors"
											>
												<Edit2 size={14} />
											</button>
											<button
												onClick={() => handleDelete(note.id)}
												onMouseLeave={() => setDeleteConfirmId(null)}
												className={`transition-colors ${
													deleteConfirmId === note.id
														? "text-red-500 hover:text-red-400"
														: "text-zinc-400 hover:text-red-400"
												}`}
												title={
													deleteConfirmId === note.id
														? "Click again to confirm"
														: "Delete note"
												}
											>
												<Trash2 size={14} />
											</button>
										</div>
									</div>
									<p className="text-xs text-zinc-500">
										{new Date(note.created_at).toLocaleDateString()}
										{note.updated_at && new Date(note.updated_at).getTime() !== new Date(note.created_at).getTime() && " (edited)"}
									</p>
								</div>
								
								{/* Edit form appears below the note being edited */}
								{editingId === note.id && (
									<div ref={formRef} className="mt-2 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
										<div className="flex justify-between items-center mb-4">
											<h3 className="text-white font-semibold">Edit Note</h3>
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
											<textarea
												value={content}
												onChange={(e) => setContent(e.target.value)}
												placeholder="Enter your note..."
												rows={4}
												className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
												required
											/>
											<button
												type="submit"
												disabled={createNote.isPending || updateNote.isPending}
												className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-md text-sm font-medium transition-colors"
											>
												{createNote.isPending || updateNote.isPending
													? "Saving..."
													: "Update Note"}
											</button>
										</form>
									</div>
								)}
							</div>
						))
					) : (
						<p className="text-zinc-400 text-sm">No notes available</p>
					)}
				</div>
			</div>
		</Card>
	);
}