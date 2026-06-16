import { AsyncPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, filter, firstValueFrom, map, of, switchMap, take } from 'rxjs';

import { ImportantPerson } from '../../../core/models/wedding.models';
import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { DEFAULT_WEDDING_ID, WeddingService } from '../../../core/services/wedding.service';
import { toDisplayImageUrl } from '../../../core/utils/image-url';

@Component({
	selector: 'app-important-person-invite-page',
	imports: [AsyncPipe],
	template: `
    @let wedding = wedding$ | async;
    @let person = person$ | async;
    @let isReadOnly = isReadOnly$ | async;

    <main class="print-invite-page special-invite-page">
      <section class="print-invite-card special-person-invite-card">
        <section class="hero" [class.hero-empty]="!wedding?.coverImageUrl">
          @if (wedding?.coverImageUrl) {
            <img [src]="imageUrl(wedding?.coverImageUrl)" [alt]="wedding?.coupleNames || 'Casamento'" />
          } @else {
            <div class="hero-placeholder"></div>
          }
        </section>

        <div class="special-invite-content">
          <div class="ornament" aria-hidden="true">♥</div>
          <h2 class="invite-couple-name">{{ wedding?.coupleNames || 'Os noivos' }}</h2>
          @if (wedding?.eventDate) {
            <p class="date">{{ wedding?.eventDate }}</p>
          }
          <p class="eyebrow">Convite especial</p>
          @if (person) {
            <h1 class="special-person-question">
              {{ person.secondName ? 'Vocês aceitam participar desse momento conosco?' : 'Você aceita participar desse momento conosco?' }}
            </h1>
            <p class="special-person-name">{{ personDisplayName(person) }}</p>
            <p class="invite-role">{{ roleDisplay(person) }}</p>
          }
          <p class="invite-message">
            {{ person?.secondName ? 'A presença de vocês tem' : 'Sua presença tem' }} um significado especial para nós.
            Queremos celebrar esse dia ao lado de pessoas que fazem parte da nossa história.
          </p>
          @if (!isReadOnly) {
            <div class="acceptance-actions">
              <button class="acceptance-button" type="button" (click)="respond('accepted')">Sim</button>
              <button class="acceptance-button ghost" type="button" (click)="respond('declined')">Não</button>
            </div>
            @if (responseMessage()) {
              <p class="success-state">{{ responseMessage() }}</p>
            }
          } @else {
            <p class="muted-state">Este convite está disponível apenas para visualização.</p>
          }
        </div>
      </section>

    </main>
  `,
})
export class ImportantPersonInvitePage implements OnInit {
	private readonly route = inject(ActivatedRoute);
	private readonly weddingContextService = inject(WeddingContextService);
	private readonly weddingService = inject(WeddingService);

	protected readonly weddingId$ = this.weddingContextService.publicWeddingId$(this.route);
	protected readonly wedding$ = this.weddingId$.pipe(switchMap((weddingId) => this.weddingService.wedding$(weddingId)));
	protected readonly isReadOnly$ = this.weddingId$.pipe(map((weddingId) => weddingId === DEFAULT_WEDDING_ID));
	protected readonly person$ = this.route.paramMap.pipe(
		switchMap((params) => {
			const personId = params.get('personId');
			if (!personId) {
				return of(undefined);
			}

			return this.weddingId$.pipe(switchMap((weddingId) => this.weddingService.importantPerson$(personId, weddingId)));
		}),
	);
	protected readonly responseMessage = signal('');

	protected imageUrl(url?: string): string {
		return toDisplayImageUrl(url);
	}

	ngOnInit(): void {
		combineLatest([this.route.queryParamMap, this.wedding$, this.person$])
			.pipe(
				filter(([params, wedding, person]) => params.get('print') === '1' && !!wedding && !!person),
				take(1),
			)
			.subscribe(() => setTimeout(() => window.print()));
	}

	protected async respond(invitationStatus: 'accepted' | 'declined'): Promise<void> {
		const personId = this.route.snapshot.paramMap.get('personId');
		if (!personId) {
			this.responseMessage.set('Convite individual nao encontrado.');
			return;
		}

		const weddingId = await firstValueFrom(this.weddingId$);
		await this.weddingService.updateImportantPersonInvitation(personId, invitationStatus, weddingId);
		this.responseMessage.set(invitationStatus === 'accepted' ? 'Resposta registrada. Obrigado pelo sim!' : 'Resposta registrada.');
	}

	protected roleLabel(role: ImportantPerson['role']): string {
		return {
			parent: 'Pais',
			groomFather: 'Pai do noivo',
			groomMother: 'Mãe do noivo',
			brideFather: 'Pai da noiva',
			brideMother: 'Mãe da noiva',
			page: 'Pajem',
			maid: 'Dama',
			family: 'Familia',
			other: 'Convidado especial',
		}[role];
	}

	protected personDisplayName(person: ImportantPerson): string {
		return person.secondName ? `${person.name.split(" ")[0]} & ${person.secondName.split(" ")[0]}` : person.name.split(" ")[0];
	}

	protected roleDisplay(person: ImportantPerson): string {
		return person.secondName && person.secondRole
			? `${this.roleLabel(person.role)} & ${this.roleLabel(person.secondRole)}`
			: this.roleLabel(person.role);
	}
}
