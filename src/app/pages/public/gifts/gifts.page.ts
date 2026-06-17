import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';

import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';
import { PublicNavComponent } from '../../../layout/public-nav.component';

@Component({
  selector: 'app-gifts-page',
  imports: [AsyncPipe, PublicNavComponent],
  templateUrl: './gifts.page.html',

  styleUrl: './gifts.page.css',
})
export class GiftsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly weddingContextService = inject(WeddingContextService);
  private readonly weddingService = inject(WeddingService);

  protected readonly weddingId$ = this.weddingContextService.publicWeddingId$(this.route);
  protected readonly gifts$ = this.weddingId$.pipe(switchMap((weddingId) => this.weddingService.gifts$(weddingId)));
}
