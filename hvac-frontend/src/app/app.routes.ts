import { Routes } from '@angular/router';

//dispatch default routage

export const routes: Routes = [
	{ path: '', redirectTo: 'login', pathMatch: 'full' },
	{
		path: 'login',
		loadComponent: () =>
			import('./auth/login/login.component').then(
				(m) => m.LoginComponent,
			),
	},
	{
		path: 'dispatch',
		loadComponent: () =>
			import('./modules/dispatch/layout/layout.component').then(
				(m) => m.LayoutComponent,
			),
		children: [
			{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
			{
				path: 'dashboard',
				loadComponent: () =>
					import(
						'./modules/dispatch/dashboard/dashboard.component'
					).then((m) => m.DashboardComponent),
			},
			{
				path: 'jobs',
				loadComponent: () =>
					import('./modules/dispatch/jobs/jobs.component').then(
						(m) => m.JobsComponent,
					),
			},
			{
				path: 'schedule',
				loadComponent: () =>
					import(
						'./modules/dispatch/schedule/schedule.component'
					).then((m) => m.ScheduleComponent),
			},
		],
	},
	{
		path: 'technician',
		loadComponent: () =>
			import('./modules/technician/layout/layout.component').then(
				(m) => m.LayoutComponent,
			),
		children: [
			{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
			{
				path: 'dashboard',
				loadComponent: () =>
					import(
						'./modules/technician/dashboard/dashboard.component'
					).then((m) => m.DashboardComponent),
			},
		],
	},
	{ path: '**', redirectTo: 'dispatch' },
];
