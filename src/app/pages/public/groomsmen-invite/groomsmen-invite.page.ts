import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';

import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';
import { toDisplayImageUrl } from '../../../core/utils/image-url';

@Component({
  selector: 'app-groomsmen-invite-page',
  imports: [AsyncPipe],
  template: `
    @let wedding = wedding$ | async;

    <main class="print-invite-page">
      <section class="print-invite-card">
        @if (wedding?.coverImageUrl) {
          <img class="print-invite-cover" [src]="imageUrl(wedding?.coverImageUrl)" [alt]="wedding?.coupleNames || 'Casamento'" />
        }
        <p class="eyebrow">Convite especial</p>
        <h1>Você aceita ser nosso padrinho?</h1>
        <h2>{{ wedding?.coupleNames || 'Os noivos' }}</h2>
        @if (wedding?.eventDate) {
          <p class="print-invite-date">{{ wedding?.eventDate }}</p>
        }
        <p>
          Queremos ter você ainda mais perto nesse momento. Sua presença na nossa história é importante,
          e seria uma alegria contar com você como padrinho.
        </p>
      </section>

      <button class="primary-action print-action" type="button" (click)="print()">Gerar PDF / imprimir</button>
    </main>
  `,
})
export class GroomsmenInvitePage {
  private readonly route = inject(ActivatedRoute);
  private readonly weddingContextService = inject(WeddingContextService);
  private readonly weddingService = inject(WeddingService);

  protected readonly weddingId$ = this.weddingContextService.publicWeddingId$(this.route);
  protected readonly wedding$ = this.weddingId$.pipe(switchMap((weddingId) => this.weddingService.wedding$(weddingId)));

  protected imageUrl(url?: string): string {
    return toDisplayImageUrl(url);
  }

  protected print(): void {
    window.print();
  }
}
