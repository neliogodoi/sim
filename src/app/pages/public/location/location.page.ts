import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';

import { WeddingService } from '../../../core/services/wedding.service';
import { PublicNavComponent } from '../../../layout/public-nav.component';

@Component({
  selector: 'app-location-page',
  imports: [AsyncPipe, PublicNavComponent],
  template: `
    @let wedding = wedding$ | async;

    <main class="public-page content-page">
      <h1>Local</h1>
      <section class="info-card">
        <h2>Cerimonia</h2>
        <p>{{ wedding?.ceremonyAddress || 'Endereco ainda nao configurado.' }}</p>
        @if (wedding?.ceremonyMapUrl) {
          <a class="secondary-action" [href]="wedding?.ceremonyMapUrl" target="_blank" rel="noreferrer">Abrir mapa</a>
        }
      </section>
      <section class="info-card">
        <h2>Recepcao</h2>
        <p>{{ wedding?.receptionAddress || 'Mesmo local da cerimonia ou endereco a confirmar.' }}</p>
        @if (wedding?.receptionMapUrl) {
          <a class="secondary-action" [href]="wedding?.receptionMapUrl" target="_blank" rel="noreferrer">Abrir mapa</a>
        }
      </section>
    </main>

    <app-public-nav />
  `,
})
export class LocationPage {
  private readonly weddingService = inject(WeddingService);

  protected readonly wedding$ = this.weddingService.wedding$();
}
