import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';

import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';
import { PublicNavComponent } from '../../../layout/public-nav.component';

@Component({
  selector: 'app-entrance-songs-page',
  imports: [AsyncPipe, PublicNavComponent],
  templateUrl: './entrance-songs.page.html',

  styleUrl: './entrance-songs.page.css',
})
export class EntranceSongsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly weddingContextService = inject(WeddingContextService);
  private readonly weddingService = inject(WeddingService);

  protected readonly weddingId$ = this.weddingContextService.publicWeddingId$(this.route);
  protected readonly songs$ = this.weddingId$.pipe(
    switchMap((weddingId) => this.weddingService.entranceSongs$(weddingId)),
  );
}
