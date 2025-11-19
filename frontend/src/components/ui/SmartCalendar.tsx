import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import type { Job } from "../../types/jobs";
import { useUpdateJobMutation } from "../../hooks/useJobs";

interface SmartCalendarProps {
  jobs: Job[];
  view: "month" | "week";
  toolbar?: any;
}

export default function SmartCalendar({ jobs, view, toolbar }: SmartCalendarProps) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const { mutateAsync: updateJob } = useUpdateJobMutation();

  // Close popup on outside click
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setSelectedJob(null);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  /*  After priority support is added to jobs
  function getPriorityColor(priority?: string): string {
    switch (priority?.toLowerCase()) {
      case "high": return "#ef4444"; // red
      case "medium": return "#f59e0b"; // amber
      case "low": return "#10b981"; // green
      case "normal": 
      default: return "#3b82f6"; // blue
    }
  }*/

  function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  function formatDuration(minutes?: number): string {
    if (!minutes) return "";
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  // Sort jobs: all-day jobs first, then by start time
  const sortedJobs = [...jobs].sort((a, b) => {
    const isAllDayA = a.schedule_type === "all_day";
    const isAllDayB = b.schedule_type === "all_day";
    
    // All-day jobs come first
    if (isAllDayA && !isAllDayB) return -1;
    if (!isAllDayA && isAllDayB) return 1;
    
    // Within same type, sort by time
    const timeA = new Date(a.start_date).getTime();
    const timeB = new Date(b.start_date).getTime();
    return timeA - timeB;
  });

  const events = sortedJobs.map((job, index) => {
    const startDate = new Date(job.start_date);
    const dateStr = startDate.toISOString().split("T")[0];
    const isAllDay = job.schedule_type === "all_day";
    
    // Format title based on schedule type
    const title = isAllDay 
      ? job.name 
      : `${formatTime(job.start_date)} ${job.name}`;
    
    return {
      id: job.id,
      title: title,
      start: dateStr,
      allDay: true,
      //backgroundColor: getPriorityColor(job.priority),
      //borderColor: getPriorityColor(job.priority),
      extendedProps: {
        sortOrder: index, // Use index from sorted array
        isAllDay: isAllDay,
      },
    };
  });

  return (
    <div className="relative">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView={view === "week" ? "dayGridWeek" : "dayGridMonth"}
        headerToolbar={toolbar}
        views={{
          dayGridWeek: { type: "dayGrid", duration: { days: 7 } },
          dayGridMonth: {},
        }}
        events={events}
        height="auto"
        editable={true}
        eventStartEditable={true}
        eventDurationEditable={false}
        eventOrder="sortOrder,title" // Sort by our custom order, then title

        eventDrop={async (info) => {
          const jobId = info.event.id;
          const newDate = info.event.start;

          if (!newDate) {
            info.revert();
            return;
          }

          try {
            const job = jobs.find((j) => j.id === jobId);
            if (!job) {
              info.revert();
              return;
            }

            let normalized: Date;

            // For all-day jobs, use date only (no time)
            if (job.schedule_type === "all_day") {
              normalized = new Date(
                Date.UTC(
                  newDate.getFullYear(),
                  newDate.getMonth(),
                  newDate.getDate(),
                  0, 0, 0, 0
                )
              );
            } else {
              // For timed jobs, preserve the original time
              const originalDate = new Date(job.start_date);
              normalized = new Date(
                Date.UTC(
                  newDate.getFullYear(),
                  newDate.getMonth(),
                  newDate.getDate(),
                  originalDate.getUTCHours(),
                  originalDate.getUTCMinutes(),
                  0,
                  0
                )
              );
            }

            await updateJob({
              id: jobId,
              updates: { start_date: normalized.toISOString() },
            });
          } catch (err) {
            console.error("Failed to update job date", err);
            info.revert();
          }
        }}

        eventClick={(info) => {
          const job = jobs.find((j) => j.id === info.event.id);
          if (!job) return;

          const rect = info.el.getBoundingClientRect();
          const eventCenterX = rect.left + rect.width / 2;
          const eventCenterY = rect.top + rect.height / 2;
          const screenCenterX = window.innerWidth / 2;

          const POPUP_WIDTH = 300;
          const POPUP_HEIGHT = 200;

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
                     rounded-lg shadow-xl p-4 text-sm"
          style={{ top: popupPos.top, left: popupPos.left, minWidth: '300px' }}
        >
          <h2 className="text-xl font-bold mb-3 text-gray-200">{selectedJob.name}</h2>

          <div className="space-y-2 text-gray-300">
            <p>
              <strong className="text-gray-400">Status:</strong> {selectedJob.status}
            </p>

            {selectedJob.schedule_type === "all_day" ? (
              <p>
                <strong className="text-gray-400">Schedule:</strong>{" "}
                All Day
              </p>
            ) : (
              <p>
                <strong className="text-gray-400">Start:</strong>{" "}
                {formatTime(selectedJob.start_date)}
              </p>
            )}

            <p>
              <strong className="text-gray-400">Date:</strong>{" "}
              {formatDate(selectedJob.start_date)}
            </p>

            {selectedJob.duration !== undefined && selectedJob.duration > 0 && (
              <p>
                <strong className="text-gray-400">Duration:</strong>{" "}
                {formatDuration(selectedJob.duration)}
              </p>
            )}

            {selectedJob.address && (
              <p>
                <strong className="text-gray-400">Address:</strong>{" "}
                {selectedJob.address}
              </p>
            )}

            {selectedJob.description && (
              <p>
                <strong className="text-gray-400">Description:</strong>{" "}
                {selectedJob.description}
              </p>
            )}
          </div>

          <div className="flex justify-end mt-4">
            <button
              className="px-3 py-1.5 rounded-sm border border-zinc-700 
                         hover:bg-zinc-800 text-sm text-gray-200 transition-colors"
              onClick={() => setSelectedJob(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
  /**       To be used after priority support is added to jobs
      <p> 
        <strong className="text-gray-400">Priority:</strong>{" "}
        <span 
          className="inline-block w-2 h-2 rounded-full mr-1"
          style={{ backgroundColor: getPriorityColor(selectedJob.priority) }}
        />
        {selectedJob.priority || "normal"}
      </p> 
     */ 
}