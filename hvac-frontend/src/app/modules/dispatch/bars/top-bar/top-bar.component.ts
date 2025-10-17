import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule],
  template: `
    <mat-toolbar class="top-bar">
      <span>Dispatch Dashboard</span>
      <span class="spacer"></span>
      <button mat-button (click)="logout()">Logout</button>
    </mat-toolbar>
  `,
  styles: [`
    .top-bar {border-bottom: 2px solid #f09797ff;}
    .spacer { flex: 1 1 auto; }
  `]
})
export class TopBarComponent {
  constructor(private router: Router) {}

  logout() {
    this.router.navigate(['/login']);
  }
}