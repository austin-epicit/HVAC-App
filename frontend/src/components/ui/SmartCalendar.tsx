import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import type { Job } from "../../types/jobs";

interface SmartCalendarProps {
  jobs: Job[];
  view: "month" | "week";
  toolbar?: any;
}

export default function SmartCalendar({ jobs, view, toolbar }: SmartCalendarProps) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Close popup outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setSelectedJob(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Convert job data into FullCalendar events
  const events = jobs.map((job) => {
    const d = new Date(job.start_date);
    const dateStr = d.toISOString().split("T")[0];
    return {
      id: job.id,
      title: job.name,
      start: dateStr,
      allDay: true,
    };
  });

  return (
    <div className="relative">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView={view === "week" ? "dayGridWeek" : "dayGridMonth"}
        headerToolbar={toolbar}
        views={{
          dayGridWeek: { type: "dayGrid", duration: { days: 7 } },
          dayGridMonth: {},
        }}
        events={events}
        height="auto"
        eventClick={(info) => {
          const job = jobs.find((j) => j.id === info.event.id);
          if (!job) return;

          const rect = info.el.getBoundingClientRect();
          const eventCenterX = rect.left + rect.width / 2;
          const eventCenterY = rect.top + rect.height / 2;
          const screenCenterX = window.innerWidth / 2;

          const POPUP_WIDTH = 260;
          const POPUP_HEIGHT = 160;

          const placeRight = eventCenterX < screenCenterX;

          const left = placeRight
            ? rect.right + 12
            : rect.left - POPUP_WIDTH - 12;

          const top = eventCenterY - POPUP_HEIGHT / 2;

          setPopupPos({ top, left });
          setSelectedJob(job);
        }}
      />

      {selectedJob && popupPos && (
        <div
          ref={popupRef}
          className="fixed z-[6000] bg-zinc-900 border border-zinc-700
                     rounded-lg shadow-xl p-4 text-sm min-w-[260px]"
          style={{ top: popupPos.top, left: popupPos.left }}
        >
          <h2 className="text-xl font-bold mb-3">{selectedJob.name}</h2>

          <p className="mb-1"><strong>Status:</strong> {selectedJob.status}</p>
          <p className="mb-1">
            <strong>Start:</strong>{" "}
            {new Date(selectedJob.start_date).toLocaleDateString()}
          </p>

          <div className="flex justify-end mt-4">
            <button
              className="px-3 py-1 rounded-sm border border-zinc-700 
                         hover:bg-zinc-800 text-sm"
              onClick={() => setSelectedJob(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
