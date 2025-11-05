export default function DashboardPage() {
	return (
		<div className="min-h-screen text-white p-6">
			<div className="grid gap-6 md:grid-cols-2">
				{/* Full-width card on top */}
				<div className="md:col-span-2 bg-gray-700 p-6 rounded-lg shadow-md border border-gray-700">
					<h2 className="text-xl font-semibold mb-2 text-white">Today's Jobs</h2>
					<p className="text-gray-300 text-sm">5 scheduled jobs</p>
				</div>

				{/* Bottom left */}
				<div className="bg-gray-700 p-6 rounded-lg shadow-md border border-gray-700">
					<h2 className="text-lg font-semibold mb-2 text-white">Technicians Online</h2>
					<p className="text-gray-300 text-sm">3 active technicians</p>
				</div>

				{/* Bottom right */}
				<div className="bg-gray-700 p-6 rounded-lg shadow-md border border-gray-700">
					<h2 className="text-lg font-semibold mb-2 text-white">Pending Quotes</h2>
					<p className="text-gray-300 text-sm">2 awaiting approval</p>
				</div>
			</div>
		</div>
	);
}
