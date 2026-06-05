import { AsyncPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, of, switchMap } from 'rxjs';

import { PublicNavComponent } from '../../../layout/public-nav.component';
import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';

@Component({
  selector: 'app-rsvp-page',
  imports: [AsyncPipe, FormsModule, PublicNavComponent],
  template: `
    <main class="public-page content-page">
      @let guest = guest$ | async;

      <h1>{{ guest ? 'Seu convite' : 'Confirmar presenca' }}</h1>
      <p>{{ guest ? 'Confirme sua presenca para ajudar os noivos na organizacao.' : 'Informe seus dados para ajudar os noivos na organizacao.' }}</p>

      <form class="form-card" (ngSubmit)="submit()">
        <label>
          Nome
          <input name="name" [(ngModel)]="name" [placeholder]="guest?.name || ''" required />
        </label>
        <label>
          Telefone
          <input name="phone" [(ngModel)]="phone" />
        </label>
        <label>
          Resposta
          <select name="status" [(ngModel)]="status">
            <option value="confirmed">Vou</option>
            <option value="declined">Nao vou</option>
            <option value="maybe">Talvez</option>
          </select>
        </label>
        <label>
          Quantidade de pessoas
          <input type="number" min="1" name="guestCount" [(ngModel)]="guestCount" />
        </label>
        <button class="primary-action" type="submit">Enviar resposta</button>
      </form>

      @if (saved()) {
        <p class="success-state">Resposta enviada. Obrigado!</p>
      }
    </main>

    <app-public-nav />
  `,
})
export class RsvpPage {
  private readonly route = inject(ActivatedRoute);
  private readonly weddingContextService = inject(WeddingContextService);
  private readonly weddingService = inject(WeddingService);
  private readonly weddingId$ = this.weddingContextService.publicWeddingId$(this.route);
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
  protected readonly saved = signal(false);

  async submit(): Promise<void> {
    const guest = await firstValueFrom(this.guest$);
    const name = this.name.trim() || guest?.name || '';
    const phone = this.phone.trim() || guest?.phone || '';
    const guestCount = Number(this.guestCount) || guest?.guestCount || 1;

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
      rsvpStatus: this.status,
      rsvpCompanions: Math.max(0, guestCount - 1),
    };

    if (guestId) {
      await this.weddingService.updateGuest(guestId, payload, weddingId);
    } else {
      await this.weddingService.addGuest(payload, weddingId);
    }
    this.saved.set(true);
  }
}
