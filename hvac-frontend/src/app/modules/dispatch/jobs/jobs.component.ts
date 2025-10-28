import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
	selector: 'app-jobs-page',
	standalone: true,
	imports: [CommonModule, MatCardModule],
	template: `
		<mat-card>
			<mat-card-title>Jobs List</mat-card-title>
			<!-- job list UI here -->
		</mat-card>
	`,
})
export class JobsComponent {}
