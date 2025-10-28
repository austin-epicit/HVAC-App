import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
	standalone: true,
	imports: [CommonModule, MatCardModule],
	template: `
		<mat-card>
			<mat-card-title>Dashboard</mat-card-title>
			<mat-card-content>
				<p>Welcome to Dispatch Dashboard!</p>
			</mat-card-content>
		</mat-card>
	`,
})
export class DashboardComponent {}
