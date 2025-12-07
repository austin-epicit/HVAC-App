import { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, X, Calendar } from "lucide-react";
import Card from "../ui/Card";
import type { JobNote, JobVisit } from "../../types/jobs";
import {
	useJobNotesQuery,
	useCreateJobNoteMutation,
	useUpdateJobNoteMutation,
	useDeleteJobNoteMutation,
} from "../../hooks/useJobs";

interface JobNoteManagerProps {
	jobId: string;
	visits?: JobVisit[]; // Optional: pass visits to allow attaching notes to specific visits
}

export default function JobNoteManager({ jobId, visits }: JobNoteManagerProps) {
	const formRef = useRef<HTMLDivElement>(null);
	const [isAdding, setIsAdding] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
	const [content, setContent] = useState("");
	const [visitId, setVisitId] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { data: notes, isLoading } = useJobNotesQuery(jobId);
	const createNote = useCreateJobNoteMutation();
	const updateNote = useUpdateJobNoteMutation();
	const deleteNote = useDeleteJobNoteMutation();

	// Separate notes by type
	const generalNotes = notes?.filter(note => !note.visit_id) || [];
	const visitNotes = notes?.filter(note => note.visit_id) || [];

	const resetForm = () => {
		setContent("");
		setVisitId(null);
		setIsAdding(false);
		setEditingId(null);
		setErrorMessage(null);
	};

	const handleEdit = (note: JobNote) => {
		setContent(note.content);
		setVisitId(note.visit_id || null);
		setEditingId(note.id);
		setIsAdding(true);
		setErrorMessage(null);
	};

	const handleDelete = async (noteId: string) => {
		if (deleteConfirmId === noteId) {
			try {
				await deleteNote.mutateAsync({ jobId, noteId });
				setDeleteConfirmId(null);
			} catch (error) {
				console.error("Failed to delete note:", error);
				setErrorMessage(error instanceof Error ? error.message : "Failed to delete note");
			}
		} else {
			setDeleteConfirmId(noteId);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrorMessage(null);

		try {
			if (editingId) {
				await updateNote.mutateAsync({
					jobId,
					noteId: editingId,
					data: { 
						content,
						visit_id: visitId || null,
					},
				});
			} else {
				await createNote.mutateAsync({
					jobId,
					data: { 
						content,
						visit_id: visitId || null,
					},
				});
			}
			resetForm();
		} catch (error) {
			console.error("Failed to save note:", error);
			setErrorMessage(error instanceof Error ? error.message : "Failed to save note");
		}
	};

	// Click outside to close
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

	const formatDate = (date: Date | string) => {
		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const getVisitLabel = (visitId: string) => {
		const visit = visits?.find(v => v.id === visitId);
		if (!visit) return "Unknown Visit";
		return formatDate(visit.scheduled_start_at);
	};

	if (isLoading) {
		return (
			<Card title="Notes" className="h-fit">
				<div className="text-zinc-400 text-sm">Loading notes...</div>
			</Card>
		);
	}

	const NoteForm = () => (
		<div ref={formRef} className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-white font-semibold">
					{editingId ? "Edit Note" : "New Note"}
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
				{/* Visit Selection (if visits are provided) */}
				{visits && visits.length > 0 && (
					<div>
						<label className="block text-sm text-zinc-400 mb-2">
							Attach to visit (optional)
						</label>
						<select
							value={visitId || ""}
							onChange={(e) => setVisitId(e.target.value || null)}
							className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="">General Job Note</option>
							{visits
								.sort((a, b) => 
									new Date(a.scheduled_start_at).getTime() - 
									new Date(b.scheduled_start_at).getTime()
								)
								.map(visit => (
									<option key={visit.id} value={visit.id}>
										{formatDate(visit.scheduled_start_at)} - {visit.status}
									</option>
								))
							}
						</select>
					</div>
				)}

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
						: editingId ? "Update Note" : "Add Note"}
				</button>
			</form>
		</div>
	);

	const NoteCard = ({ note }: { note: JobNote }) => (
		<div>
			<div className="p-3 bg-zinc-800 rounded-lg border border-zinc-700 group hover:border-zinc-600 transition-colors">
				<div className="flex justify-between items-start mb-2">
					<div className="flex-1">
						<p className="text-white text-sm mb-1">{note.content}</p>
						
						{/* Visit indicator */}
						{note.visit_id && (
							<div className="flex items-center gap-1.5 text-xs text-blue-400 mt-2">
								<Calendar size={12} />
								<span>Visit: {getVisitLabel(note.visit_id)}</span>
							</div>
						)}
					</div>
					
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
									? "text-red-500 hover:text-red-600"
									: "text-zinc-400 hover:text-red-400"
							}`}
							title={
								deleteConfirmId === note.id
									? "Click again to confirm"
									: "Delete note"
							}
						>
							<Trash2 
								size={14} 
								className={deleteConfirmId === note.id ? "fill-red-500" : ""} 
							/>
						</button>
					</div>
				</div>
				
				<div className="flex items-center gap-2 text-xs text-zinc-500">
					<span>{formatDate(note.created_at)}</span>
					{note.updated_at && new Date(note.updated_at).getTime() !== new Date(note.created_at).getTime() && (
						<span>(edited)</span>
					)}
					{note.creator_tech && (
						<>
							<span>•</span>
							<span>{note.creator_tech.name}</span>
						</>
					)}
					{note.creator_dispatcher && (
						<>
							<span>•</span>
							<span>{note.creator_dispatcher.name}</span>
						</>
					)}
				</div>
			</div>
			
			{/* Edit form appears below the note being edited */}
			{editingId === note.id && <div className="mt-2"><NoteForm /></div>}
		</div>
	);

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
				{isAdding && !editingId && <NoteForm />}

				{/* General Notes Section */}
				{generalNotes.length > 0 && (
					<div className="space-y-3">
						{visits && visits.length > 0 && (
							<h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
								General Job Notes
							</h3>
						)}
						{generalNotes.map(note => (
							<NoteCard key={note.id} note={note} />
						))}
					</div>
				)}

				{/* Visit-Specific Notes Section */}
				{visitNotes.length > 0 && (
					<div className="space-y-3">
						{generalNotes.length > 0 && (
							<div className="border-t border-zinc-700 pt-3">
								<h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2 mb-3">
									<Calendar size={14} />
									Visit Notes
								</h3>
							</div>
						)}
						{visitNotes.map(note => (
							<NoteCard key={note.id} note={note} />
						))}
					</div>
				)}

				{/* Empty State */}
				{notes && notes.length === 0 && (
					<p className="text-zinc-400 text-sm">No notes available</p>
				)}
			</div>
		</Card>
	);
}