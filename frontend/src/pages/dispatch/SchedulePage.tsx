import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

export default function SchedulePage() {
  const events = [
    { title: "AC Installation", start: "2025-09-02T09:00:00" },
    { title: "Boiler Repair", start: "2025-09-02T13:30:00" },
    { title: "Heat Pump Maintenance", start: "2025-09-11T09:00:00" },
  ];

  return (
    <div className="h-full p-6 bg-zinc-950 text-white">
      <div className="rounded-lg bg-zinc-900 border border-zinc-800 shadow-md p-4">
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
