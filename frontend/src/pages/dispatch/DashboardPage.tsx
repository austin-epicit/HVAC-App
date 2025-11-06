import Card from "../../components/ui/Card";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

export default function DashboardPage() {
	  const events = [
    { title: "Install", start: "2025-11-07T09:00:00", end: "2025-09-02T10:30:00" },
	 { title: "Install", start: "2025-11-07T09:00:00", end: "2025-09-02T10:30:00" },
	  { title: "Install", start: "2025-11-07T09:00:00", end: "2025-09-02T10:30:00" },
	   { title: "Install", start: "2025-11-07T09:00:00", end: "2025-09-02T10:30:00" },
    { title: "Repair", start: "2025-11-06T13:00:00", end: "2025-09-03T14:00:00" },
  ];
  return (
    <div className="min-h-screen text-white p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridWeek"
            views={{
              dayGridWeek: {
                type: "dayGrid",
                duration: { days: 7 },
              },
            }}
            headerToolbar={{
              left: "jobsTitle",       // 👈 our custom “title”
              center: "",
              right: "today prev,next",
            }}
            customButtons={{
              jobsTitle: {
                text: "Upcoming Jobs",
                click: () => {},       // no-op so it does nothing
              },
            }}
            events={events}
            height="auto"
          />
        </Card>

        <Card title="Technicians Online">
          <p className="text-gray-300 text-sm">3 active technicians</p>
        </Card>

        <Card title="Pending Quotes">
          <p className="text-gray-300 text-sm">2 awaiting approval</p>
        </Card>
      </div>
    </div>
  );
}
