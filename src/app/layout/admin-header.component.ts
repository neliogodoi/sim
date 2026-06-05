import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../core/services/auth.service';

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
      <a routerLink="/admin/configuracoes" routerLinkActive="active" aria-label="Configuracoes">
        <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2.8v3" />
          <path d="M12 18.2v3" />
          <path d="m4.2 4.2 2.1 2.1" />
          <path d="m17.7 17.7 2.1 2.1" />
          <path d="M2.8 12h3" />
          <path d="M18.2 12h3" />
          <path d="m4.2 19.8 2.1-2.1" />
          <path d="m17.7 6.3 2.1-2.1" />
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
      <a routerLink="/admin/agenda" routerLinkActive="active" aria-label="Agenda">
        <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M8 3v4" />
          <path d="M16 3v4" />
          <path d="M4 10h16" />
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
      <a routerLink="/admin/padrinhos" routerLinkActive="active" aria-label="Padrinhos">
        <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.7A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
        </svg>
      </a>
      <a routerLink="/admin/musicas" routerLinkActive="active" aria-label="Musicas">
        <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 18V5l10-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="16" cy="16" r="3" />
        </svg>
      </a>
      <a routerLink="/admin/recados" routerLinkActive="active" aria-label="Recados">
        <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 5h14v10H8l-3 3V5Z" />
          <path d="M8 9h8" />
          <path d="M8 12h5" />
        </svg>
      </a>
      <button type="button" (click)="logout()" aria-label="Sair">
        <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M10 6H6v12h4" />
          <path d="M14 8l4 4-4 4" />
          <path d="M8 12h10" />
        </svg>
      </button>
    </nav>
  `,
})
export class AdminHeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  async logout(): Promise<void> {
    await this.authService.logout();
    await this.router.navigateByUrl('/admin/login');
  }
}
