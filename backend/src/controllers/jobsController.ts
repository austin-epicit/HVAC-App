import { Job } from "../types/jobs";

const SAMPLE_JOBS: Job[] = [
	{
		id: "job-001",
		name: "HVAC System Installation - Downtown Office",
		tech_ids: ["tech-101", "tech-102"],
		client_id: "client-001",
		status: "Scheduled",
	},
	{
		id: "job-002",
		name: "Air Duct Cleaning - Maple Apartments",
		tech_ids: ["tech-103"],
		client_id: "client-002",
		status: "In Progress",
	},
	{
		id: "job-003",
		name: "Thermostat Replacement - Greenview School",
		tech_ids: ["tech-101"],
		client_id: "client-003",
		status: "Completed",
	},
	{
		id: "job-004",
		name: "Furnace Maintenance - Hilltop Residence",
		tech_ids: ["tech-104"],
		client_id: "client-004",
		status: "Cancelled",
	},
	{
		id: "job-005",
		name: "AC Unit Installation - Lakeside Villas",
		tech_ids: ["tech-105", "tech-106"],
		client_id: "client-005",
		status: "In Progress",
	},
	{
		id: "job-006",
		name: "Heat Pump Diagnostic - West Industrial Park",
		tech_ids: ["tech-107"],
		client_id: "client-006",
		status: "Scheduled",
	},
	{
		id: "job-007",
		name: "Refrigeration System Repair - SuperMart",
		tech_ids: ["tech-108", "tech-109"],
		client_id: "client-007",
		status: "Completed",
	},
	{
		id: "job-008",
		name: "Filter Replacement - East Medical Center",
		tech_ids: ["tech-103"],
		client_id: "client-008",
		status: "In Progress",
	},
	{
		id: "job-009",
		name: "Cooling Tower Inspection - City Hall",
		tech_ids: ["tech-110"],
		client_id: "client-009",
		status: "Scheduled",
	},
	{
		id: "job-010",
		name: "Ventilation Balancing - North Campus Gym",
		tech_ids: ["tech-101", "tech-104"],
		client_id: "client-010",
		status: "Completed",
	},
];

export const getAllJobs = () => {
	return SAMPLE_JOBS;
};

export const getJobById = (id: string) => {
	return SAMPLE_JOBS.find((e) => e.id == id);
};
