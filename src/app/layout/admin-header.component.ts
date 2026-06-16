import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
	selector: 'app-admin-header',
	imports: [RouterLink, RouterLinkActive],
	template: `
    @if (isDemoMode()) {
      <div class="demo-admin-banner">Casamento de demonstração</div>
    }
    <nav class="admin-nav" aria-label="Administracao">
      <a [routerLink]="link()" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" aria-label="Casamentos">
        <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 10.5 12 4l8 6.5" />
          <path d="M6.5 9.5V20h11V9.5" />
          <path d="M10 20v-6h4v6" />
        </svg>
      </a>
      <a [routerLink]="link('padrinhos')" routerLinkActive="active" aria-label="Padrinhos">
        <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.7A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
        </svg>
      </a>
      <a [routerLink]="link('musicas')" routerLinkActive="active" aria-label="Musicas">
        <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 18V5l10-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="16" cy="16" r="3" />
        </svg>
      </a>
	  <a [routerLink]="link('convidados')" routerLinkActive="active" aria-label="Convidados">
        <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 19c.7-3 2.6-5 5.5-5s4.8 2 5.5 5" />
          <path d="M16 11a2.5 2.5 0 1 0-.8-4.9" />
          <path d="M17 14c2 .5 3.2 2 3.7 5" />
        </svg>
      </a>
      <a [routerLink]="link('mais')" routerLinkActive="active" aria-label="Mais">
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
	constructor(private readonly router: Router) {}

	protected isDemoMode(): boolean {
		return this.router.url.startsWith('/demo') || this.router.url.startsWith('/default/admin');
	}

	protected link(path = ''): string {
		const base = this.isDemoMode() ? '/demo' : '/admin';
		return path ? `${base}/${path}` : base;
	}
}
