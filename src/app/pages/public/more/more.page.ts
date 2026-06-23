import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { PublicNavComponent } from '../../../layout/public-nav.component';
import { DEFAULT_WEDDING_ID } from '../../../core/services/wedding.service';
import { AppIconComponent } from '../../../shared/ui/app-icon.component';

@Component({
  selector: 'app-more-page',
  imports: [PublicNavComponent, RouterLink, AppIconComponent],
  templateUrl: './more.page.html',

  styleUrl: './more.page.css',
})
export class MorePage {
  private readonly route = inject(ActivatedRoute);

  protected link(path: string): string[] {
    const slug = this.route.snapshot.paramMap.get('slug') || DEFAULT_WEDDING_ID;
    return ['/', slug, path];
  }
}
