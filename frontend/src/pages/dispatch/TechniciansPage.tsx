import Card from "../../components/ui/Card";

export default function TechnicianPage() {
	return (
		<div>
			{/* Left side: Title */}
			<h2 className="text-2xl font-semibold pb-5">Technicians Overview</h2>
			<Card title="Technician Stats" className="md:col-span-2">
				<p className="text-gray-300 text-sm">100% satisfaction</p>
			</Card>
		</div>
	);
}
