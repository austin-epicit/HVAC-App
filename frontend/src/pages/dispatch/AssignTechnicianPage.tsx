import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  MapPin, 
  Plus,
  Check,
  Briefcase,
  User,
  Mail,
  Phone,
  Clock,
  Award
} from "lucide-react";
import { useTechnicianByIdQuery } from "../../hooks/useTechnicians";
import { useAllJobsQuery, useAssignTechniciansToVisitMutation, useCreateJobVisitMutation } from "../../hooks/useJobs";
import CreateJobVisit from "../../components/jobs/CreateJobVisit";
import type { Job, JobVisit } from "../../types/jobs";
import LoadSvg from "../../assets/icons/loading.svg?react";
import BoxSvg from "../../assets/icons/box.svg?react";

export default function AssignTechnicianPage() {
  const { technicianId } = useParams<{ technicianId: string }>();
  const navigate = useNavigate();
  
  const { data: technician, isLoading: loadingTech } = useTechnicianByIdQuery(technicianId!);
  const { data: jobs, isLoading: loadingJobs, refetch: refetchJobs } = useAllJobsQuery();
  const assignTechnicians = useAssignTechniciansToVisitMutation();
  const { mutateAsync: createJobVisitMutation } = useCreateJobVisitMutation();

  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const [expandedVisits, setExpandedVisits] = useState<Set<string>>(new Set());
  const [isCreatingVisit, setIsCreatingVisit] = useState(false);
  const [creatingVisitForJob, setCreatingVisitForJob] = useState<Job | null>(null);

  const toggleJob = (jobId: string) => {
    setExpandedJobs(prev => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });
  };

  const toggleVisit = (visitId: string) => {
    setExpandedVisits(prev => {
      const next = new Set(prev);
      if (next.has(visitId)) {
        next.delete(visitId);
      } else {
        next.add(visitId);
      }
      return next;
    });
  };

  const toggleVisitSelection = async (visit: JobVisit) => {
    const isAlreadyAssigned = visit.visit_techs?.some(vt => vt.tech_id === technicianId);

    try {
      if (isAlreadyAssigned) {
        const otherTechs = visit.visit_techs
          ?.filter(vt => vt.tech_id !== technicianId)
          .map(vt => vt.tech_id) || [];
        
        await assignTechnicians.mutateAsync({
          visitId: visit.id,
          techIds: otherTechs,
        });
      } else {
        const currentTechs = visit.visit_techs?.map(vt => vt.tech_id) || [];
        const newTechs = [...currentTechs, technicianId!];
        
        await assignTechnicians.mutateAsync({
          visitId: visit.id,
          techIds: newTechs,
        });
      }

      await refetchJobs();
    } catch (error) {
      console.error("Failed to toggle assignment:", error);
    }
  };

  const handleCreateVisit = (job: Job) => {
    setCreatingVisitForJob(job);
    setIsCreatingVisit(true);
  };

  const formatDateTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-600/20 text-blue-400 border-blue-500/30';
      case 'InProgress': return 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30';
      case 'Completed': return 'bg-green-600/20 text-green-400 border-green-500/30';
      case 'Cancelled': return 'bg-red-600/20 text-red-400 border-red-500/30';
      case 'Unscheduled': return 'bg-zinc-700 text-zinc-300 border-zinc-600';
      default: return 'bg-zinc-700 text-zinc-300 border-zinc-600';
    }
  };

  const getVisitStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'text-blue-400';
      case 'InProgress': return 'text-yellow-400';
      case 'Completed': return 'text-green-400';
      case 'Cancelled': return 'text-red-400';
      default: return 'text-zinc-400';
    }
  };

  const getTechStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-500';
      case 'Busy': return 'bg-yellow-500';
      case 'Break': return 'bg-blue-500';
      case 'Offline': return 'bg-zinc-500';
      default: return 'bg-zinc-500';
    }
  };

  if (loadingTech || loadingJobs) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadSvg className="w-12 h-12" />
      </div>
    );
  }

  if (!technician) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate("/dispatch/technicians")}
          className="text-zinc-400 hover:text-white mb-4"
        >
          ← Back to Technicians
        </button>
        <div className="text-white">Technician not found</div>
      </div>
    );
  }

  const isVisitAssigned = (visit: JobVisit) => {
    return visit.visit_techs?.some(vt => vt.tech_id === technicianId);
  };

  const totalVisits = jobs?.reduce((acc, job) => acc + (job.visits?.length || 0), 0) || 0;
  const assignedVisits = jobs?.reduce((acc, job) => 
    acc + (job.visits?.filter(v => isVisitAssigned(v)).length || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header Section */}
      <div className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto p-6">
          <button
            onClick={() => navigate("/dispatch/technicians")}
            className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Back to Technicians</span>
          </button>

          {/* Main Header Content */}
          <div className="flex items-start gap-6">

            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-0.5">
                <div className="w-full h-full rounded-2xl bg-zinc-900 flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    {technician.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="absolute -bottom-2 -right-2 flex items-center gap-1.5 bg-zinc-900 border-2 border-zinc-800 rounded-full px-3 py-1">
                <div className={`w-2.5 h-2.5 rounded-full ${getTechStatusColor(technician.status)}`} />
                <span className="text-xs font-medium text-white">{technician.status}</span>
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 
                    onClick={() => navigate(`/dispatch/technicians/${technicianId}`)}
                    className="text-3xl font-bold text-white mb-2 cursor-pointer hover:text-blue-400 transition-colors"
                  >
                    {technician.name}
                  </h1>
                  <div className="flex items-center gap-3 text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Award size={16} className="text-blue-400" />
                      <span className="text-sm font-medium">{technician.title}</span>
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="flex gap-3">
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-center">
                    <div className="text-2xl font-bold text-white">{assignedVisits}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">Assigned</div>
                  </div>
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-center">
                    <div className="text-2xl font-bold text-zinc-400">{totalVisits}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">Total Visits</div>
                  </div>
                </div>
              </div>

              {/* Contact Info Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm bg-zinc-800/30 rounded-lg px-3 py-2">
                  <Mail size={14} className="text-zinc-500 flex-shrink-0" />
                  <span className="text-zinc-300 truncate">{technician.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm bg-zinc-800/30 rounded-lg px-3 py-2">
                  <Phone size={14} className="text-zinc-500 flex-shrink-0" />
                  <span className="text-zinc-300">{technician.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm bg-zinc-800/30 rounded-lg px-3 py-2">
                  <Clock size={14} className="text-zinc-500 flex-shrink-0" />
                  <span className="text-zinc-300">
                    {new Date(technician.hire_date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
              </div>

              {technician.description && (
                <div className="mt-4">
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {technician.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="space-y-4">
          {!jobs || jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-zinc-900 rounded-lg border border-zinc-800">
              <BoxSvg className="w-16 h-16 mb-3 opacity-50" />
              <p className="text-zinc-400">No jobs available</p>
              <p className="text-sm text-zinc-500 mt-1">Create a job to start assigning visits</p>
            </div>
          ) : (
            jobs.map((job) => {
              const isExpanded = expandedJobs.has(job.id);
              const visitCount = job.visits?.length || 0;
              const assignedCount = job.visits?.filter(v => isVisitAssigned(v)).length || 0;

              return (
                <div
                  key={job.id}
                  className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-colors"
                >
                  {/* Job Header */}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 
                            className="text-xl font-semibold text-white cursor-pointer hover:text-blue-400 transition-colors" 
                            onClick={() => navigate(`/dispatch/jobs/${job.id}`)}>
                              {job.name}
                          </h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-zinc-400 mb-3">
                          <div className="flex items-center gap-1">
                            <Briefcase size={14} />
                            {job.client?.name || 'Unknown Client'}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            {job.address}
                          </div>
                          {visitCount > 0 && (
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              {visitCount} visit{visitCount !== 1 ? 's' : ''}
                              {assignedCount > 0 && (
                                <span className="text-blue-400">
                                  ({assignedCount} assigned)
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleJob(job.id)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-md transition-colors"
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            {isExpanded ? 'Hide Details' : 'Show Details'}
                          </button>
                          
                          <button
                            onClick={() => handleCreateVisit(job)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                          >
                            <Plus size={16} />
                            New Visit
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Job Details */}
                  {isExpanded && (
                    <div className="border-t border-zinc-800 bg-zinc-900/50">
                      <div className="p-4">
                        <h4 className="text-sm font-semibold text-zinc-400 mb-3">Job Details</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-zinc-500 mb-1">Description</p>
                            <p className="text-zinc-300">{job.description || 'No description'}</p>
                          </div>
                          <div>
                            <p className="text-zinc-500 mb-1">Priority</p>
                            <p className="text-zinc-300">{job.priority}</p>
                          </div>
                          <div>
                            <p className="text-zinc-500 mb-1">Created</p>
                            <p className="text-zinc-300">
                              {new Date(job.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Visits Section */}
                        <div className="border-t border-zinc-800 pt-4 mt-4">
                          <h4 className="text-sm font-semibold text-zinc-400 mb-3">
                            Visits {visitCount > 0 && `(${visitCount})`}
                          </h4>
                          
                          {!job.visits || job.visits.length === 0 ? (
                            <div className="text-center py-6 bg-zinc-800/50 rounded-lg">
                              <p className="text-zinc-500 text-sm">No visits scheduled for this job</p>
                              <button
                                onClick={() => handleCreateVisit(job)}
                                className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
                              >
                                Create first visit
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {job.visits.map((visit) => {
                                const isVisitExpanded = expandedVisits.has(visit.id);
                                const isAssigned = isVisitAssigned(visit);
                                const assignedTechCount = visit.visit_techs?.length || 0;

                                return (
                                  <div
                                    key={visit.id}
                                    className={`border rounded-lg overflow-hidden transition-all ${
                                      isAssigned
                                        ? 'border-blue-500/50 bg-blue-900/10'
                                        : 'border-zinc-700 bg-zinc-800'
                                    }`}
                                  >
                                    {/* Visit Header */}
                                    <div className="p-3">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-3 mb-2">
                                            <Calendar size={16} className="text-zinc-400 flex-shrink-0" />
                                            <span className="text-white font-medium">
                                              {formatDateTime(visit.scheduled_start_at)}
                                            </span>
                                            <span className={`text-xs font-medium ${getVisitStatusColor(visit.status)}`}>
                                              {visit.status}
                                            </span>
                                          </div>
                                          
                                          <div className="flex items-center gap-4 text-xs text-zinc-400 ml-7">
                                            <span className="capitalize">
                                              {visit.schedule_type.replace('_', ' ')} schedule
                                            </span>
                                            {assignedTechCount > 0 && (
                                              <span className="flex items-center gap-1">
                                                <User size={12} />
                                                {assignedTechCount} tech{assignedTechCount !== 1 ? 's' : ''}
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <button
                                            onClick={() => toggleVisit(visit.id)}
                                            className="p-1 hover:bg-zinc-700 rounded transition-colors"
                                          >
                                            {isVisitExpanded ? (
                                              <ChevronUp size={16} className="text-zinc-400" />
                                            ) : (
                                              <ChevronDown size={16} className="text-zinc-400" />
                                            )}
                                          </button>
                                          
                                          <button
                                            onClick={() => toggleVisitSelection(visit)}
                                            disabled={assignTechnicians.isPending}
                                            className={`p-2 rounded transition-colors ${
                                              isAssigned
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                                            }`}
                                          >
                                            {isAssigned ? (
                                              <Check size={16} />
                                            ) : (
                                              <Plus size={16} />
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Expanded Visit Details */}
                                    {isVisitExpanded && (
                                      <div className="border-t border-zinc-700 bg-zinc-900/50 p-3">
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                          {visit.schedule_type !== 'window' && (
                                            <div>   
                                              <p className="text-zinc-500 mb-1">Start Time</p>
                                              <p className="text-zinc-300">
                                                {new Date(visit.scheduled_start_at).toLocaleTimeString('en-US', {
                                                  hour: 'numeric',
                                                  minute: '2-digit',
                                                  hour12: true
                                                })}
                                            </p>
                                            </div>
                                          )}
                                          
                                          {visit.schedule_type === 'window' && visit.arrival_window_start && (
                                            <>
                                              <div>
                                                <p className="text-zinc-500 mb-1">Window Start</p>
                                                <p className="text-zinc-300">
                                                  {new Date(visit.arrival_window_start).toLocaleTimeString('en-US', {
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                    hour12: true
                                                  })}
                                                </p>
                                              </div>
                                              <div>
                                                <p className="text-zinc-500 mb-1">Window End</p>
                                                <p className="text-zinc-300">
                                                  {visit.arrival_window_end && new Date(visit.arrival_window_end).toLocaleTimeString('en-US', {
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                    hour12: true
                                                  })}
                                                </p>
                                              </div>
                                            </>
                                          )}


                                          <div>
                                            <p className="text-zinc-500 mb-1">End Time</p>
                                            <p className="text-zinc-300">
                                              {new Date(visit.scheduled_end_at).toLocaleTimeString('en-US', {
                                                hour: 'numeric',
                                                minute: '2-digit',
                                                hour12: true
                                              })}
                                            </p>
                                          </div>
                                          
                                          

                                          {visit.actual_start_at && (
                                            <>
                                              <div>
                                                <p className="text-zinc-500 mb-1">Actual Start</p>
                                                <p className="text-zinc-300">
                                                  {new Date(visit.actual_start_at).toLocaleTimeString('en-US', {
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                    hour12: true
                                                  })}
                                                </p>
                                              </div>
                                              {visit.actual_end_at && (
                                                <div>
                                                  <p className="text-zinc-500 mb-1">Actual End</p>
                                                  <p className="text-zinc-300">
                                                    {new Date(visit.actual_end_at).toLocaleTimeString('en-US', {
                                                      hour: 'numeric',
                                                      minute: '2-digit',
                                                      hour12: true
                                                    })}
                                                  </p>
                                                </div>
                                              )}
                                            </>
                                          )}
                                        </div>

                                        {visit.visit_techs && visit.visit_techs.length > 0 && (
                                          <div className="mt-3 pt-3 border-t border-zinc-700">
                                            <p className="text-zinc-500 text-xs mb-2">Assigned Technicians</p>
                                            <div className="flex flex-wrap gap-2">
                                              {visit.visit_techs.map((vt) => (
                                                <span
                                                  key={vt.tech_id}
                                                  className={`px-2 py-1 rounded text-xs ${
                                                    vt.tech_id === technicianId
                                                      ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
                                                      : 'bg-zinc-700 text-zinc-300'
                                                  }`}
                                                >
                                                  {vt.tech.name}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {creatingVisitForJob && (
        <CreateJobVisit
          isModalOpen={isCreatingVisit}
          setIsModalOpen={setIsCreatingVisit}
          jobId={creatingVisitForJob.id}
          createVisit={createJobVisitMutation}
          preselectedTechId={technicianId}
          onSuccess={async (newVisit) => {
            setIsCreatingVisit(false);
            setCreatingVisitForJob(null);
            await refetchJobs();
            setExpandedJobs(prev => new Set(prev).add(newVisit.job_id));
          }}
        />
      )}
    </div>
  );
}