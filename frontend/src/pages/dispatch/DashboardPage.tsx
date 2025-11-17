import Card from "../../components/ui/Card";
import SmartCalendar from "../../components/ui/SmartCalendar";
import { useAllJobsQuery } from "../../hooks/useJobs";

export default function DashboardPage() {
  const { data: jobs = [], error } = useAllJobsQuery();

  return (
    <div className="min-h-screen text-white p-6">
      <div className="grid gap-6 md:grid-cols-2">
        
        <Card className="md:col-span-2">
          {error && <p className="text-red-400">Failed to load.</p>}

          <SmartCalendar
            jobs={jobs}
            view="week"
            toolbar={{
              left: "title",
              center: "",
              right: "today prev,next",
            }}
          />
        </Card>

        <Card title="Technicians Online">
          <p>3 active technicians</p>
        </Card>

        <Card title="Pending Quotes">
          <p>2 awaiting approval</p>
        </Card>
      </div>
    </div>
  );
}
