import { MapPin } from "lucide-react";

interface Client {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
}

interface ClientCardProps {
  client: Client;
  onClick?: () => void;
}

function capitalizeWords(str: string) {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function ClientCard({ client, onClick }: ClientCardProps) {
  const displayName = capitalizeWords(client.name);

  return (
    <div
      className="bg-zinc-900 border border-[#3a3a3f] rounded-lg p-4 hover:border-zinc-500 hover:shadow-lg transition-all cursor-pointer"
      onClick={onClick}
    >
      {/* Header with Name */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3
            className="text-white font-semibold text-lg leading-snug min-h-[3.5rem] overflow-hidden text-ellipsis"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {displayName}
          </h3>
        </div>
      </div>

      {/* Address */}
      <div className="flex items-start gap-2 text-sm text-zinc-400 mb-2">
        <MapPin size={16} className="mt-0.5 flex-shrink-0" />
        <span className="line-clamp-2">
          {client.address || "No address provided"}
        </span>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-zinc-800 mb-2" />

      {/* Status */}
      <div className="flex items-center">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            client.isActive
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-zinc-800 text-zinc-400 border border-zinc-700"
          }`}
        >
          {client.isActive ? "Active" : "Inactive"}
        </span>
      </div>
    </div>
  );
}
