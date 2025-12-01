import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Edit, Briefcase } from "lucide-react";
import Card from "../../components/ui/Card";
import EditClientModal from "../../components/clients/EditClient";
import ContactManager from "../../components/clients/ContactManager";
import NoteManager from "../../components/clients/NoteManager";
import { useClientByIdQuery } from "../../hooks/useClients";

export default function ClientDetailsPage() {
	const { clientId } = useParams<{ clientId: string }>();
	const navigate = useNavigate();
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	
	const { data: client, isLoading, error } = useClientByIdQuery(clientId!);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-zinc-400">Loading...</div>
			</div>
		);
	}

	if (error || !client) {
		return (
			<div className="p-6">
				<button
					onClick={() => navigate("/dispatch/clients")}
					className="text-zinc-400 hover:text-white mb-4 transition-colors"
				>
					← Back to Clients
				</button>
				<div className="text-white">Client not found</div>
			</div>
		);
	}

	return (
		<div className="p-6">
			<div className="grid grid-cols-3 items-center gap-4 mb-6">
				<button
					onClick={() => navigate("/dispatch/clients")}
					className="text-zinc-400 hover:text-white transition-colors justify-self-start"
				>
					← Back to Clients
				</button>
				
				<h1 className="text-3xl font-bold text-white text-center">
					{client.name}
				</h1>
				
				<span
					className={`px-3 py-1 rounded-full text-sm font-medium justify-self-end ${
						client.is_active
							? "bg-green-500/20 text-green-400 border border-green-500/30"
							: "bg-red-500/20 text-red-400 border border-red-500/30"
					}`}
				>
					{client.is_active ? "Active" : "Inactive"}
				</span>
			</div>

			{/* Content */}
			<div className="space-y-6">
				{/* Basic Information Card - Full width on top */}
				<Card 
					title="Basic Information"
					headerAction={
						<button
							className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors"
							onClick={() => setIsEditModalOpen(true)}
						>
							<Edit size={14} />
							Edit
						</button>
					}
				>
					<div className="space-y-6">
						<div>
							<label className="text-sm text-zinc-400 font-medium">Address</label>
							<p className="text-white mt-1 break-words">{client.address}</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="text-sm text-zinc-400 font-medium">Created</label>
								<p className="text-white mt-1">
									{new Date(client.created_at).toLocaleDateString('en-US', {
										year: 'numeric',
										month: 'short',
										day: 'numeric'
									})}
								</p>
							</div>
							<div>
								<label className="text-sm text-zinc-400 font-medium">Last Activity</label>
								<p className="text-white mt-1">
									{new Date(client.last_activity).toLocaleDateString('en-US', {
										month: "short",
										day: "numeric",
										hour: "numeric",
										minute: "2-digit",
										year: "numeric",
									})}
								</p>
							</div>
						</div>
					</div>
				</Card>

				<ContactManager clientId={client.id} />

				{/* Two Column Layout for Notes and Jobs */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<NoteManager clientId={client.id} />
					<Card 
						title="Recent Jobs"
						headerAction={
							client.jobs && client.jobs.length > 5 && (
								<button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
									View All
								</button>
							)
						}
						className="h-fit"
					>
						<div className="space-y-3">
							{client.jobs && client.jobs.length > 0 ? (
								client.jobs.slice(0, 5).map((job) => (
									<div
										key={job.id}
										className="p-3 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors cursor-pointer group"
									>
										<div className="flex items-start justify-between mb-2">
											<div className="flex items-center gap-2">
												<Briefcase size={16} className="text-zinc-400" />
												<p className="text-white text-sm font-medium group-hover:text-blue-400 transition-colors">
													{job.name}
												</p>
											</div>
											<span className="text-xs text-zinc-500 px-2 py-1 bg-zinc-700 rounded">
												{job.status}
											</span>
										</div>
										<p className="text-xs text-zinc-400 ml-6">
											{new Date(job.start_date).toLocaleDateString('en-US', {
												month: 'short',
												day: 'numeric',
												year: 'numeric'
											})}
										</p>
									</div>
								))
							) : (
								<div className="text-center py-8">
									<Briefcase size={32} className="text-zinc-600 mx-auto mb-2" />
									<p className="text-zinc-400 text-sm">No jobs available</p>
								</div>
							)}
						</div>
					</Card>
				</div>
			</div>

			<EditClientModal
				isOpen={isEditModalOpen}
				onClose={() => setIsEditModalOpen(false)}
				client={client}
			/>
		</div>
	);
}