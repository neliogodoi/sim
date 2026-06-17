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
	templateUrl: './important-person-invite.page.html',

	styleUrl: './important-person-invite.page.css',
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
