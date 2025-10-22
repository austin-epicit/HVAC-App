import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PanelMenuModule } from 'primeng/panelmenu';
import type { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterModule, PanelMenuModule],
  template: `
    <p-panelMenu [model]="items" class="nav-bar"></p-panelMenu>
  `,
  styles: [`
    :host { 
      display: block; 
      height: 100%; 
    }

    .nav-bar {
      width: 200px;
      height: 100%;
      box-sizing: border-box;
      border-right: 2px solid #f09797ff;
      background: var(--surface-0, #d1d1d1cb);
      padding: 8px 0;
      overflow: auto;
    }

    /* Remove item borders (optional aesthetic) */
    ::ng-deep .p-panelmenu .p-menuitem {
      border: none !important;
    }

    /* Remove highlight/focus effects */
    ::ng-deep .p-panelmenu .p-menuitem-link:focus {
      box-shadow: none !important;
      outline: none !important;
      background: none !important;
      color: inherit !important;
    }

    ::ng-deep .p-panelmenu .p-menuitem-link.p-highlight {
      background: none !important;
      color: inherit !important;
    }

    /* Prevent aura theme from dimming background */
    ::ng-deep body.p-overflow-hidden {
      overflow: auto !important;
    }



    /* active (route-matched) item styling */
::ng-deep .p-panelmenu .p-menuitem-link.p-highlight,
::ng-deep .p-panelmenu .p-menuitem-link-active {
  background: transparent !important;   /* remove Aura’s filled background */
  color: inherit !important;            /* use normal text color */
  box-shadow: none !important;
}

/* optional: a subtle accent bar instead of full highlight */
::ng-deep .p-panelmenu .p-menuitem-link.p-highlight::before,
::ng-deep .p-panelmenu .p-menuitem-link-active::before {
  content: "";
  display: inline-block;
  width: 4px;
  height: 100%;
  background-color: var(--primary-color);
  margin-right: 8px;
  border-radius: 2px;
}
      `]
})
export class NavBarComponent {
  items: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/dispatch/dashboard'] },
    { label: 'Jobs',      icon: 'pi pi-fw pi-briefcase', routerLink: ['/dispatch/jobs'] },
    { label: 'Schedule',  icon: 'pi pi-fw pi-calendar', routerLink: ['/dispatch/schedule'] },
    { label: 'Inventory', icon: 'pi pi-fw pi-box', routerLink: ['/dispatch/inventory'] },
    // add more items as needed
  ];
}