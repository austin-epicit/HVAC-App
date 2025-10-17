import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from '../bars/nav-bar/nav-bar.component';
import { TopBarComponent } from '../bars/top-bar/top-bar.component';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  standalone: true,
  selector: 'app-dispatch-layout',
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    NavBarComponent,
    TopBarComponent
  ],
  template: `
    <mat-sidenav-container class="layout">
      <mat-sidenav mode="side" class="sidenav" opened>
        <app-nav-bar></app-nav-bar>
      </mat-sidenav>

      <mat-sidenav-content>
        <app-top-bar></app-top-bar>
        <div class="page-content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .layout { height: 100vh; }
    .page-content { padding: 16px; }
    .sidenav { width: 200px; }
  `]
})
export class LayoutComponent {}
