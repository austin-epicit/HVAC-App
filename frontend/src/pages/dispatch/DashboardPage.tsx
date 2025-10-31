export default function DashboardPage() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-2">Today's Jobs</h2>
        <p className="text-gray-600 text-sm">5 scheduled jobs</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-2">Technicians Online</h2>
        <p className="text-gray-600 text-sm">3 active technicians</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-2">Pending Quotes</h2>
        <p className="text-gray-600 text-sm">2 awaiting approval</p>
      </div>
    </div>
  );
}
