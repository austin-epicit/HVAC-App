import {useNavigate, useLocation } from "react-router-dom";
import Card from "../../components/ui/Card";
import type { Client } from "../../types/clients";

export default function ClientDetailsPage() {
	const navigate = useNavigate();
	const location = useLocation();
	
	// Check client data from navigation state
	const client = location.state?.client as Client | undefined;
	if (!client) {
		return (
			<div className="p-6">
				<button
					onClick={() => navigate("/dispatch/clients")}
					className="text-zinc-400 hover:text-white transition-colors mb-4"
				>
					← Back to Clients
				</button>
				<div className="text-white">Client data not found. Please navigate from the clients list.</div>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div className="grid grid-cols-3 items-center gap-4">
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
					className={`px-3 py-1 rounded-full text-sm justify-self-end ${
						client.is_active
							? "bg-green-500/20 text-green-400"
							: "bg-red-500/20 text-red-400"
					}`}
				>
					{client.is_active ? "Active" : "Inactive"}
				</span>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column - Main Info */}
				<div className="lg:col-span-2 space-y-6">
					<Card title="Basic Information">
						<div className="space-y-4">
							<div>
								<label className="text-sm text-zinc-400">Address</label>
								<p className="text-white mt-1">{client.address}</p>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-sm text-zinc-400">Created</label>
									<p className="text-white mt-1">
										{new Date(client.created_at).toLocaleDateString()}
									</p>
								</div>
								<div>
									<label className="text-sm text-zinc-400">Last Activity</label>
									<p className="text-white mt-1">
										{new Date(client.last_activity).toLocaleDateString()}
									</p>
								</div>
							</div>
						</div>
					</Card>

					<Card title="Contacts">
						<div className="space-y-4">
							{client.contacts && client.contacts.length > 0 ? (
								client.contacts.map((contact) => (
									<div
										key={contact.id}
										className="p-4 bg-zinc-800 rounded-lg border border-zinc-700"
									>
										<div className="flex justify-between items-start mb-2">
											<h3 className="text-white font-semibold">{contact.name}</h3>
											<span className="text-xs text-zinc-400 bg-zinc-700 px-2 py-1 rounded">
												{contact.relation}
											</span>
										</div>
										<p className="text-sm text-zinc-400 mb-3">{contact.description}</p>
										<div className="space-y-1">
											<p className="text-sm text-zinc-300">
												<span className="text-zinc-500">Email:</span> {contact.email}
											</p>
											<p className="text-sm text-zinc-300">
												<span className="text-zinc-500">Phone:</span> {contact.phone}
											</p>
										</div>
									</div>
								))
							) : (
								<p className="text-zinc-400 text-sm">No contacts available</p>
							)}
						</div>
					</Card>
				</div>

				{/* Right Column - Notes & Jobs */}
				<div className="space-y-6">
					<Card title="Notes">
						<div className="space-y-3">
							{client.notes && client.notes.length > 0 ? (
								client.notes.map((note) => (
									<div
										key={note.id}
										className="p-3 bg-zinc-800 rounded-lg border border-zinc-700"
									>
										<p className="text-white text-sm mb-2">{note.content}</p>
										<p className="text-xs text-zinc-500">
											{new Date(note.created_at).toLocaleDateString()}
										</p>
									</div>
								))
							) : (
								<p className="text-zinc-400 text-sm">No notes available</p>
							)}
						</div>
					</Card>

					<Card title="Recent Jobs">
						<div className="space-y-3">
							{client.jobs && client.jobs.length > 0 ? (
								client.jobs.slice(0, 5).map((job) => (
									<div
										key={job.id}
										className="p-3 bg-zinc-800 rounded-lg border border-zinc-700"
									>
										<p className="text-white text-sm font-medium">{job.name}</p>
										<p className="text-xs text-zinc-500 mt-1">
											{new Date(job.start_date).toLocaleDateString()}
										</p>
									</div>
								))
							) : (
								<p className="text-zinc-400 text-sm">No jobs available</p>
							)}
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
}