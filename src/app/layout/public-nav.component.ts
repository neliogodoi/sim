import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-public-nav',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="public-nav" aria-label="Navegacao publica">
      <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" aria-label="Inicio">
        <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 10.5 12 4l8 6.5" />
          <path d="M6.5 9.5V20h11V9.5" />
          <path d="M10 20v-6h4v6" />
        </svg>
      </a>
      <a routerLink="/confirmar-presenca" routerLinkActive="active" aria-label="Confirmar presenca">
        <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="8" />
          <path d="m8.5 12 2.4 2.4 4.8-5" />
        </svg>
      </a>
      <a routerLink="/local" routerLinkActive="active" aria-label="Local">
        <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 21s6-5.2 6-11a6 6 0 0 0-12 0c0 5.8 6 11 6 11Z" />
          <circle cx="12" cy="10" r="2.2" />
        </svg>
      </a>
      <a routerLink="/album" routerLinkActive="active" aria-label="Album">
        <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="7" width="16" height="12" rx="2" />
          <path d="m8 7 1.4-2h5.2L16 7" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      </a>
      <a routerLink="/presentes" routerLinkActive="active" aria-label="Presentes">
        <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 10h16v10H4z" />
          <path d="M3 7h18v3H3z" />
          <path d="M12 7v13" />
          <path d="M12 7s-4.5.2-4.5-2.2C7.5 3.7 8.4 3 9.4 3 11.4 3 12 7 12 7Z" />
          <path d="M12 7s4.5.2 4.5-2.2c0-1.1-.9-1.8-1.9-1.8C12.6 3 12 7 12 7Z" />
        </svg>
      </a>
    </nav>
  `,
})
export class PublicNavComponent {}
