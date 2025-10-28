import { Component } from '@angular/core';
import { Router } from '@angular/router';

// PrimeNG toolbar + button modules
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';

@Component({
	selector: 'app-top-bar',
	standalone: true,
	imports: [ToolbarModule, ButtonModule],
	template: `
		<p-toolbar class="top-bar">
			<ng-template pTemplate="start">
				<span>Dispatch Dashboard</span>
			</ng-template>
			<ng-template pTemplate="end">
				<button
					pButton
					type="button"
					label="Logout"
					(click)="logout()"
				></button>
			</ng-template>
		</p-toolbar>
	`,
	styles: [
		`
			.top-bar {
				border-bottom: 2px solid #f09797ff;
				height: 50px;
			}
			.p-toolbar .p-toolbar-start span {
				font-size: 1.25rem;
				font-weight: 500;
			}
		`,
	],
})
export class TopBarComponent {
	constructor(private router: Router) {}

	logout() {
		this.router.navigate(['/login']);
	}
}
