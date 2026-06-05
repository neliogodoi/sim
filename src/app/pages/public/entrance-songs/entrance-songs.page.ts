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
  template: `
    @let songs = songs$ | async;

    <main class="public-page content-page">
      <h1>Musicas</h1>
      @if (songs?.length) {
        <div class="list-stack">
          @for (song of songs; track song.id) {
            <article class="info-card">
              <h2>{{ song.moment }}</h2>
              <p>{{ song.songTitle }}</p>
              @if (song.url) {
                <a class="secondary-action" [href]="song.url" target="_blank" rel="noreferrer">Ouvir</a>
              }
            </article>
          }
        </div>
      } @else {
        <p>Lista de musicas ainda nao configurada.</p>
      }
    </main>

    <app-public-nav />
  `,
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
