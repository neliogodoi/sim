import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';

import { WeddingService } from '../../../core/services/wedding.service';
import { PublicNavComponent } from '../../../layout/public-nav.component';

@Component({
  selector: 'app-gifts-page',
  imports: [AsyncPipe, PublicNavComponent],
  template: `
    @let gifts = gifts$ | async;

    <main class="public-page content-page">
      <h1>Presentes</h1>
      @if (gifts?.length) {
        <div class="list-stack">
          @for (gift of gifts; track gift.id) {
            <a class="info-card link-card" [href]="gift.url" target="_blank" rel="noreferrer">
              <h2>{{ gift.title }}</h2>
              @if (gift.description) {
                <p>{{ gift.description }}</p>
              }
            </a>
          }
        </div>
      } @else {
        <p>Lista de presentes ainda nao configurada.</p>
      }
    </main>

    <app-public-nav />
  `,
})
export class GiftsPage {
  private readonly weddingService = inject(WeddingService);

  protected readonly gifts$ = this.weddingService.gifts$();
}
