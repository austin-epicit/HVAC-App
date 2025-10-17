import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterModule, MatListModule, MatIconModule, MatButtonModule],
  template: `
    <mat-nav-list class="nav-bar">
      <a mat-list-item routerLink="/dispatch">Dashboard</a>
      <a mat-list-item routerLink="/dispatch/jobs">Jobs</a>
      <a mat-list-item routerLink="/dispatch/schedule">Schedule</a>
      <!-- more nav links -->
    </mat-nav-list>
  `,
  styles: [`
    .nav-bar { height: 100vh; border-right: 2px solid #f09797ff; }
    `]
})
export class NavBarComponent {}