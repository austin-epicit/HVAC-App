import Card from "../../components/ui/Card"
import { MapPin } from "lucide-react"

export default function ReportingPage() {
	return (
    <Card 
        title="Map View"
        className="h-fit"
    >
        <div className="space-y-4">
            {/* Map Placeholder */}
            <div className="w-full h-64 bg-zinc-800 rounded-lg border border-zinc-700 flex items-center justify-center overflow-hidden">
                <div className="text-center">
                    <MapPin size={48} className="text-zinc-600 mx-auto mb-2" />
                    <p className="text-zinc-400 text-sm">Map view</p>
                    <p className="text-zinc-500 text-xs mt-1">Location tracking integration pending</p>
                </div>
            </div>
            
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Last Updated:</span>
                    <span className="text-white">
                        {new Date().toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                        })}
                    </span>
                </div>
            </div>
        </div>
    </Card>
    );
}