const clients = [
  { id: 1, name: "Jim Miller", job: "A/C Repair", status: "In Progress" },
  { id: 2, name: "Sarah Johnson", job: "Heater Installation", status: "Scheduled" },
  { id: 3, name: "Robert Davis", job: "Duct Cleaning", status: "Complete" },
];

export default function JobsPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Active Jobs</h2>
      <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-2 px-4">Client</th>
              <th className="py-2 px-4">Job</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="py-2 px-4">{c.name}</td>
                <td className="py-2 px-4">{c.job}</td>
                <td className="py-2 px-4">{c.status}</td>
                <td className="py-2 px-4 text-right">
                  <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded mr-2">
                    View
                  </button>
                  <button className="text-sm bg-green-600 text-white px-3 py-1 rounded">
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
