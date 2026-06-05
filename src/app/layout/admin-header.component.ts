import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-admin-header',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="admin-nav" aria-label="Administracao">
      <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" aria-label="Casamentos">
        <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 10.5 12 4l8 6.5" />
          <path d="M6.5 9.5V20h11V9.5" />
          <path d="M10 20v-6h4v6" />
        </svg>
      </a>
      <a routerLink="/admin/convidados" routerLinkActive="active" aria-label="Convidados">
        <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 19c.7-3 2.6-5 5.5-5s4.8 2 5.5 5" />
          <path d="M16 11a2.5 2.5 0 1 0-.8-4.9" />
          <path d="M17 14c2 .5 3.2 2 3.7 5" />
        </svg>
      </a>
      <a routerLink="/admin/presentes" routerLinkActive="active" aria-label="Presentes">
        <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 10h16v10H4z" />
          <path d="M3 6h18v4H3z" />
          <path d="M12 6v14" />
          <path d="M12 6c-2.8 0-4.2-3-2-3 1.6 0 2 3 2 3Z" />
          <path d="M12 6c2.8 0 4.2-3 2-3-1.6 0-2 3-2 3Z" />
        </svg>
      </a>
      <a routerLink="/admin/mais" routerLinkActive="active" aria-label="Mais">
        <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="5" cy="12" r="1.4" />
          <circle cx="12" cy="12" r="1.4" />
          <circle cx="19" cy="12" r="1.4" />
        </svg>
      </a>
    </nav>
  `,
})
export class AdminHeaderComponent {
}
