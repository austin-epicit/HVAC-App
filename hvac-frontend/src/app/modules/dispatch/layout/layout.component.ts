import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from '../bars/nav-bar/nav-bar.component';
import { TopBarComponent } from '../bars/top-bar/top-bar.component'; // correct path
import { CommonModule } from '@angular/common';
import { DrawerModule } from 'primeng/drawer';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
	standalone: true,
	selector: 'app-dispatch-layout',
	imports: [
		CommonModule,
		RouterOutlet,
		DrawerModule,
		ToolbarModule,
		NavBarComponent,
		TopBarComponent,
	],
	template: `
		<p-drawer
			class="layout-sidebar"
			[visible]="true"
			position="left"
			[closable]="false"
		>
			<app-nav-bar></app-nav-bar>
		</p-drawer>

		<div class="layout-main">
			<app-top-bar></app-top-bar>
			<div class="page-content">
				<router-outlet></router-outlet>
			</div>
		</div>
	`,
	styles: [
		`
			:host {
				display: flex;
				height: 100vh;
			}
			.layout-sidebar {
				width: 200px;
				flex: 0 0 200px;
			}
			.layout-main {
				flex: 1 1 auto;
				display: flex;
				flex-direction: column;
			}
			.page-content {
				padding: 16px;
				flex: 1 1 auto;
				overflow: auto;
			}
		`,
	],
})
export class LayoutComponent {}
