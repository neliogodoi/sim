import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';

import { WeddingService } from '../../../core/services/wedding.service';
import { PublicNavComponent } from '../../../layout/public-nav.component';

@Component({
  selector: 'app-schedule-page',
  imports: [AsyncPipe, PublicNavComponent],
  template: `
    @let items = schedule$ | async;

    <main class="public-page content-page">
      <h1>Agenda</h1>
      @if (items?.length) {
        <div class="list-stack">
          @for (item of items; track item.id) {
            <article class="info-card">
              <h2>{{ item.title }}</h2>
              <p>{{ item.startsAt }}</p>
              @if (item.description) {
                <p>{{ item.description }}</p>
              }
            </article>
          }
        </div>
      } @else {
        <p>Agenda ainda nao configurada.</p>
      }
    </main>

    <app-public-nav />
  `,
})
export class SchedulePage {
  private readonly weddingService = inject(WeddingService);

  protected readonly schedule$ = this.weddingService.schedule$();
}
