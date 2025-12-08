import { Phone, Mail, Briefcase, Clock } from "lucide-react";
import type { Technician } from "../../types/technicians";

interface TechnicianCardProps {
  technician: Technician;
  onClick?: () => void;
}

function capitalizeWords(str: string) {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStatusColor(status: string) {
  switch (status) {
    case "Available":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "Busy":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    case "Break":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "Offline":
    default:
      return "bg-red-500/10 text-red-400 border-red-500/20";
  }
}

function formatLastLogin(raw: unknown) {
  if (!raw) return "Never";

  let d: Date;

  if (raw instanceof Date) {
    d = raw;
  } else if (typeof raw === "string") {
    d = new Date(raw);
  } else {
    d = new Date(String(raw));
  }

  if (isNaN(d.getTime())) {
    return "Never";
  }

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 5) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function TechnicianCard({ technician, onClick }: TechnicianCardProps) {
  const displayName = capitalizeWords(technician.name);
  const lastLoginText = formatLastLogin(technician.last_login);
  const statusColorClass = getStatusColor(technician.status);

  return (
    <div
      className="
        bg-zinc-900 border border-[#3a3a3f] rounded-lg p-5
        hover:border-zinc-500 hover:shadow-lg transition-all
        w-72 flex flex-col gap-4
      "
    >
      <div className="flex items-start gap-3">
        {/* Avatar Placeholder */}
        <div className="relative">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
            {technician.name.charAt(0).toUpperCase()}
          </div>
          
          {technician.status === "Available" && (
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-zinc-900 rounded-full" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-lg truncate">
            {displayName}
          </h3>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColorClass}`}
          >
            {technician.status}
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-sm text-zinc-300">
          <Phone size={16} className="text-zinc-400 flex-shrink-0" />
          <span className="truncate">{technician.phone}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-zinc-300">
          <Mail size={16} className="text-zinc-400 flex-shrink-0" />
          <span className="truncate">{technician.email}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-zinc-300">
          <Briefcase size={16} className="text-zinc-400 flex-shrink-0" />
          <span className="truncate">{technician.title}</span>
        </div>

        {technician.description && (
          <div className="flex items-start gap-2 text-sm text-zinc-400">
            <div className="w-4 flex-shrink-0" /> 
            <p className="line-clamp-2 text-xs leading-relaxed">
              {technician.description}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-zinc-400 pt-2 border-t border-zinc-800">
        <Clock size={13} className="opacity-70" />
        <span>Last login: {lastLoginText}</span>
      </div>

      <div className="flex gap-2 mt-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-md transition-colors"
        >
          View Details
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Handle assign job action
          }}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
        >
          ?Assign Job
        </button>
      </div>
    </div>
  );
}