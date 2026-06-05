import { AsyncPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, of, switchMap } from 'rxjs';

import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';
import { toDisplayImageUrl } from '../../../core/utils/image-url';

@Component({
  selector: 'app-groomsmen-invite-page',
  imports: [AsyncPipe],
  template: `
    @let wedding = wedding$ | async;
    @let member = member$ | async;

    <main class="print-invite-page">
      <section class="print-invite-card">
        @if (wedding?.coverImageUrl) {
          <img class="print-invite-cover" [src]="imageUrl(wedding?.coverImageUrl)" [alt]="wedding?.coupleNames || 'Casamento'" />
        }
        <p class="eyebrow">Convite especial</p>
        <h1>Você aceita ser nosso padrinho?</h1>
        @if (member) {
          <p class="invite-person-name">{{ shortCoupleName(member) }}</p>
        }
        <h2>{{ wedding?.coupleNames || 'Os noivos' }}</h2>
        @if (wedding?.eventDate) {
          <p class="print-invite-date">{{ wedding?.eventDate }}</p>
        }
        <p>
          Queremos ter você ainda mais perto nesse momento. Sua presença na nossa história é importante,
          e seria uma alegria contar com você como padrinho.
        </p>
        <div class="acceptance-actions">
          <button class="acceptance-button" type="button" (click)="respond('accepted')">Sim</button>
          <button class="acceptance-button ghost" type="button" (click)="respond('declined')">Não</button>
        </div>
        @if (responseMessage()) {
          <p class="success-state">{{ responseMessage() }}</p>
        }
      </section>

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
export class GroomsmenInvitePage {
  private readonly route = inject(ActivatedRoute);
  private readonly weddingContextService = inject(WeddingContextService);
  private readonly weddingService = inject(WeddingService);

  protected readonly weddingId$ = this.weddingContextService.publicWeddingId$(this.route);
  protected readonly wedding$ = this.weddingId$.pipe(switchMap((weddingId) => this.weddingService.wedding$(weddingId)));
  protected readonly member$ = this.route.paramMap.pipe(
    switchMap((params) => {
      const memberId = params.get('memberId');
      if (!memberId) {
        return of(undefined);
      }

      return this.weddingId$.pipe(switchMap((weddingId) => this.weddingService.weddingPartyMember$(memberId, weddingId)));
    }),
  );
  protected readonly responseMessage = signal('');

  protected imageUrl(url?: string): string {
    return toDisplayImageUrl(url);
  }

  protected print(): void {
    window.print();
  }

  protected async respond(invitationStatus: 'accepted' | 'declined'): Promise<void> {
    const memberId = this.route.snapshot.paramMap.get('memberId');
    if (memberId) {
      const weddingId = await firstValueFrom(this.weddingId$);
      await this.weddingService.updateWeddingPartyInvitation(memberId, invitationStatus, weddingId);
    }

    this.responseMessage.set(invitationStatus === 'accepted' ? 'Resposta registrada. Obrigado pelo sim!' : 'Resposta registrada.');
  }

  protected shortCoupleName(member: { firstName: string; secondName: string }): string {
    return `${this.firstWord(member.firstName)} & ${this.firstWord(member.secondName)}`;
  }

  private firstWord(value: string): string {
    return value.trim().split(/\s+/)[0] || value;
  }
}
