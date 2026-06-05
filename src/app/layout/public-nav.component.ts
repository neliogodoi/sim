import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';

import { DEFAULT_WEDDING_ID } from '../core/services/wedding.service';

@Component({
  selector: 'app-public-nav',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="public-nav" aria-label="Navegacao publica">
      <a [routerLink]="link()" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" aria-label="Inicio">
        <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 10.5 12 4l8 6.5" />
          <path d="M6.5 9.5V20h11V9.5" />
          <path d="M10 20v-6h4v6" />
        </svg>
      </a>
      <a [routerLink]="link('local')" routerLinkActive="active" aria-label="Local">
        <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 21s6-5.2 6-11a6 6 0 0 0-12 0c0 5.8 6 11 6 11Z" />
          <circle cx="12" cy="10" r="2.2" />
        </svg>
      </a>
      <a [routerLink]="link('album')" routerLinkActive="active" aria-label="Album">
        <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="7" width="16" height="12" rx="2" />
          <path d="m8 7 1.4-2h5.2L16 7" />
          <circle cx="12" cy="13" r="3" />
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
export class PublicNavComponent {
  private readonly route = inject(ActivatedRoute);

  protected link(path = ''): string[] {
    const slug = this.route.snapshot.paramMap.get('slug') || DEFAULT_WEDDING_ID;
    return ['/', slug, path].filter(Boolean);
  }
}
