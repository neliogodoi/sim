import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, of, switchMap } from 'rxjs';

import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';

@Component({
  selector: 'app-rsvp-page',
  imports: [AsyncPipe, FormsModule],
  template: `
    <main class="public-page content-page">
      @let guest = guest$ | async;
      @let wedding = wedding$ | async;

      <section class="print-invite-card guest-invite-card">
        <h1>{{ wedding?.coupleNames || 'Noiva e Noivo' }}</h1>
        @if (wedding?.eventDate) {
          <p class="print-invite-date">{{ wedding?.eventDate }}</p>
        }
        @if (wedding?.ceremonyAddress || wedding?.receptionAddress) {
          <p class="invite-location">{{ wedding?.ceremonyAddress || wedding?.receptionAddress }}</p>
        }
        <p class="invite-message">
          É com muito carinho que convidamos você para celebrar conosco esse momento tão especial.
        </p>
        <p class="eyebrow">Convidado</p>
        <h2>{{ name || guest?.name || 'Convidado' }}</h2>
        @if (guest?.groupName) {
          <p class="invite-group">Estendendo-se a {{ guest?.groupName }}</p>
        }
        <p class="invite-help">Confirme sua presença para ajudar os noivos na organização.</p>
        <label>
          Número de pessoas
          <input
            type="number"
            min="1"
            name="guestCount"
            [(ngModel)]="guestCount"
            [placeholder]="guest?.guestCount?.toString() || '1'"
            (ngModelChange)="guestCountChanged = true"
          />
        </label>
        @if (!guest) {
          <label>
            Nome
            <input name="name" [(ngModel)]="name" required />
          </label>
        }
        <div class="acceptance-actions rsvp-actions">
          <button class="acceptance-button" type="button" (click)="submit('confirmed')">Sim</button>
          <button class="acceptance-button ghost" type="button" (click)="submit('declined')">Não</button>
          <button class="acceptance-button ghost" type="button" (click)="submit('maybe')">Talvez</button>
        </div>
      </section>

      @if (saved()) {
        <p class="success-state">Resposta enviada. Obrigado!</p>
      }

      <button class="floating-print-action" type="button" (click)="print()" aria-label="Gerar PDF ou imprimir">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 8V4h10v4" />
          <path d="M6 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1" />
          <path d="M7 14h10v6H7z" />
        </svg>
      </button>
    </main>
  `,
})
export class RsvpPage {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly weddingContextService = inject(WeddingContextService);
  private readonly weddingService = inject(WeddingService);
  private readonly weddingId$ = this.weddingContextService.publicWeddingId$(this.route);
  protected readonly wedding$ = this.weddingId$.pipe(switchMap((weddingId) => this.weddingService.wedding$(weddingId)));
  protected readonly guest$ = this.route.paramMap.pipe(
    switchMap((params) => {
      const guestId = params.get('guestId');
      if (!guestId) {
        return of(undefined);
      }

      return this.weddingId$.pipe(switchMap((weddingId) => this.weddingService.guest$(guestId, weddingId)));
    }),
  );

  protected name = '';
  protected phone = '';
  protected status: 'confirmed' | 'declined' | 'maybe' = 'confirmed';
  protected guestCount = 1;
  protected guestCountChanged = false;
  protected readonly saved = signal(false);

  constructor() {
    this.guest$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((guest) => {
      if (!guest || this.guestCountChanged) {
        return;
      }

      this.name = guest.name;
      this.phone = guest.phone || '';
      this.guestCount = guest.guestCount || 1;
    });
  }

  async submit(status: 'confirmed' | 'declined' | 'maybe'): Promise<void> {
    const guest = await firstValueFrom(this.guest$);
    const name = this.name.trim() || guest?.name || '';
    const phone = this.phone.trim() || guest?.phone || '';
    const guestCount = this.guestCountChanged ? Number(this.guestCount) || 1 : guest?.guestCount || Number(this.guestCount) || 1;

    if (!name) {
      return;
    }

    const weddingId = await firstValueFrom(this.weddingId$);
    const guestId = this.route.snapshot.paramMap.get('guestId');
    const payload = {
      weddingId,
      name,
      phone,
      groupName: guest?.groupName || '',
      guestCount,
      rsvpStatus: status,
      rsvpCompanions: Math.max(0, guestCount - 1),
    };

    if (guestId) {
      await this.weddingService.updateGuest(guestId, payload, weddingId);
    } else {
      await this.weddingService.addGuest(payload, weddingId);
    }
    this.saved.set(true);
  }

  protected print(): void {
    window.print();
  }
}
