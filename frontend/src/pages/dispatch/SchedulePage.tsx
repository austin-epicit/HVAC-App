import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useAllJobsQuery } from "../../hooks/useJobs";

export default function SchedulePage() {
  const { data: jobs, error } = useAllJobsQuery();

  const events =
    jobs?.map((job) => {
      const date = new Date(job.start_date);
      const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD

      return {
        title: job.name,
        start: dateStr,// orders events by creation time
        allDay: true,
      };
    }) || [];

  return (
    <div className="h-full p-6 bg-zinc-950 text-white">
      <div className="rounded-lg bg-zinc-900 border border-zinc-800 shadow-md p-4">
        {error && (
          <p className="text-red-400 mb-2">
            Failed to load events: {error.message}
          </p>
        )}

        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={events}
          headerToolbar={{
            left: "title",
            center: "",
            right: "today prev,next",
          }}
          height="auto"
        />
      </div>
    </div>
  );
}
