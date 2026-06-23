import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';

import { DEFAULT_WEDDING_ID } from '../core/services/wedding.service';
import { AppIconComponent } from '../shared/ui/app-icon.component';

@Component({
  selector: 'app-public-nav',
  imports: [RouterLink, RouterLinkActive, AppIconComponent],
  templateUrl: './public-nav.component.html',

  styleUrl: './public-nav.component.css',
})
export class PublicNavComponent {
  private readonly route = inject(ActivatedRoute);

  protected link(path = ''): string[] {
    const slug = this.route.snapshot.paramMap.get('slug') || DEFAULT_WEDDING_ID;
    return ['/', slug, path].filter(Boolean);
  }
}
