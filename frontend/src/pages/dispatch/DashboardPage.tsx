import Card from "../../components/ui/Card";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useAllJobsQuery } from "../../hooks/useJobs";

export default function DashboardPage() {
  const { data: jobs, error } = useAllJobsQuery();

  const events = jobs
    ?.map((job) => {
    const date = new Date(job.start_date);
    const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD

    return {
      title: job.name,
      start: dateStr,
      allDay: true,
    };
    }) || [];
  return (
    <div className="min-h-screen text-white p-6">
      <div className="grid gap-6 md:grid-cols-2">

        <Card className="md:col-span-2">
          {error && (
            <p className="text-red-400 mb-2">
              Failed to load events: {error.message}
            </p>
          )}

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
              left: "jobsTitle",
              center: "",
              right: "today prev,next",
            }}
            customButtons={{
              jobsTitle: {
                text: "Upcoming Jobs",
                click: () => {},
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