import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { firstValueFrom, switchMap } from 'rxjs';

import { WeddingPartyMember } from '../../../core/models/wedding.models';
import { R2UploadService } from '../../../core/services/r2-upload.service';
import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';
import { toDisplayImageUrl } from '../../../core/utils/image-url';
import { AdminHeaderComponent } from '../../../layout/admin-header.component';

@Component({
	selector: 'app-wedding-party-admin-page',
	imports: [AdminHeaderComponent, AsyncPipe, FormsModule],
	template: `
    <app-admin-header />
    @let members = members$ | async;

    <main class="admin-page">
      <h1>Padrinhos</h1>
      @if (shouldShowForm(members)) {
        <form class="form-card" (ngSubmit)="saveMember()">
          <label>
            Primeira pessoa
            <input name="firstName" [(ngModel)]="firstName" required />
          </label>
          <label>
            Segunda pessoa
            <input name="secondName" [(ngModel)]="secondName" required />
          </label>
          <label>
            Lado
            <select name="side" [(ngModel)]="side">
              <option value="couple">Casal</option>
              <option value="bride">Noiva</option>
              <option value="groom">Noivo</option>
            </select>
          </label>
          <label>
            URL da foto
            <input name="photoUrl" [(ngModel)]="photoUrl" />
          </label>
          <label>
            Enviar foto
            <input type="file" accept="image/*" [disabled]="isUploadingPhoto" (change)="uploadPhoto($event)" />
          </label>
          @if (photoUrl) {
            <img class="cover-preview" [src]="imageUrl(photoUrl)" alt="Previa da foto dos padrinhos" />
          }
          @if (uploadMessage) {
            <p class="muted-state">{{ uploadMessage }}</p>
          }
          @if (uploadError) {
            <p class="error-state">{{ uploadError }}</p>
          }
          <button class="primary-action" type="submit">{{ editingMemberId ? 'Salvar padrinhos' : 'Adicionar padrinhos' }}</button>
          @if (members?.length) {
            <button class="secondary-action" type="button" (click)="closeForm()">Cancelar</button>
          }
        </form>
      } @else {
        <button class="primary-action form-toggle-action" type="button" (click)="openForm()">Adicionar padrinhos</button>
      }

      <div class="list-stack">
        @for (member of members; track member.id) {
          <article class="info-card admin-list-card wedding-party-card compact-person-card">
            <div class="card-actions">
              <a class="icon-action" [href]="groomsmenWhatsappInviteLink(member)" target="_blank" rel="noreferrer" aria-label="Enviar convite dos padrinhos">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 6h16v12H4z" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
              </a>
              <button class="icon-action" type="button" (click)="editMember(member)" aria-label="Editar padrinhos">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" />
                  <path d="m14 6 4 4" />
                </svg>
              </button>
              <button class="icon-action" type="button" (click)="removeMember(member.id)" aria-label="Remover padrinhos">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 7h14" />
                  <path d="M9 7V5h6v2" />
                  <path d="M8 10v8" />
                  <path d="M16 10v8" />
                  <path d="M6.5 7 7 21h10l.5-14" />
                </svg>
              </button>
            </div>
            <div class="compact-card-media">
              @if (member.photoUrl) {
                <img class="person-photo" [src]="imageUrl(member.photoUrl)" [alt]="shortCoupleName(member)" />
              }
            </div>
            <div class="compact-card-copy">
              <h2>{{ shortCoupleName(member) }}</h2>
              <p>
                {{ sideLabel(member.side) }}
                @if (member.invitationStatus) {
                  ·
                  <span class="status-pill" [class.confirmed]="member.invitationStatus === 'accepted'">
                    {{ invitationLabel(member.invitationStatus) }}
                  </span>
                }
              </p>
            </div>
          </article>
        } @empty {
          <p>Nenhum padrinho cadastrado ainda.</p>
        }
      </div>
    </main>
  `,
})
export class WeddingPartyAdminPage {
	private readonly auth = inject(Auth);
	private readonly r2UploadService = inject(R2UploadService);
	private readonly weddingContextService = inject(WeddingContextService);
	private readonly weddingService = inject(WeddingService);
	private readonly changeDetectorRef = inject(ChangeDetectorRef);

	protected readonly weddingId$ = this.weddingContextService.activeWeddingId$;
	protected readonly members$ = this.weddingId$.pipe(
		switchMap((weddingId) => this.weddingService.weddingParty$(weddingId)),
	);
	protected firstName = '';
	protected secondName = '';
	protected side: 'bride' | 'groom' | 'couple' = 'couple';
	protected photoUrl = '';
	protected editingMemberId = '';
	protected formExpanded = false;
	protected isUploadingPhoto = false;
	protected uploadMessage = '';
	protected uploadError = '';

	async saveMember(): Promise<void> {
		if (!this.firstName.trim() || !this.secondName.trim()) {
			return;
		}

		const weddingId = await firstValueFrom(this.weddingId$);
		const user = await firstValueFrom(authState(this.auth));
		if (user) {
			await this.weddingService.ensureOwner(user.uid, weddingId);
		}

		await this.weddingService.saveWeddingPartyMember(
			{
				id: this.editingMemberId || undefined,
				weddingId,
				firstName: this.firstName.trim(),
				secondName: this.secondName.trim(),
				side: this.side,
				photoUrl: this.photoUrl.trim(),
				sortOrder: Date.now(),
			},
			weddingId,
		);

		this.firstName = '';
		this.secondName = '';
		this.side = 'couple';
		this.photoUrl = '';
		this.editingMemberId = '';
		this.formExpanded = false;
		this.uploadMessage = '';
		this.uploadError = '';
	}

	editMember(member: WeddingPartyMember): void {
		this.formExpanded = true;
		this.editingMemberId = member.id;
		this.firstName = member.firstName;
		this.secondName = member.secondName;
		this.side = member.side;
		this.photoUrl = member.photoUrl || '';
		this.uploadMessage = '';
		this.uploadError = '';
	}

	removeMember(memberId: string): Promise<void> {
		return this.weddingService.deleteWeddingPartyMember(memberId, this.weddingContextService.currentAdminWeddingId());
	}

	protected openForm(): void {
		this.formExpanded = true;
	}

	protected closeForm(): void {
		this.firstName = '';
		this.secondName = '';
		this.side = 'couple';
		this.photoUrl = '';
		this.editingMemberId = '';
		this.formExpanded = false;
		this.uploadMessage = '';
		this.uploadError = '';
	}

	protected shouldShowForm(members?: WeddingPartyMember[] | null): boolean {
		return !members?.length || this.formExpanded || !!this.editingMemberId;
	}

	protected async uploadPhoto(event: Event): Promise<void> {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) {
			return;
		}

		this.isUploadingPhoto = true;
		this.uploadError = '';
		this.uploadMessage = 'Enviando foto...';

		try {
			this.photoUrl = await this.r2UploadService.uploadImage(file);
			this.uploadMessage = 'Foto enviada. Salve para concluir.';
		} catch (error) {
			this.uploadMessage = '';
			this.uploadError = error instanceof Error ? error.message : 'Nao foi possivel enviar a foto.';
		} finally {
			this.isUploadingPhoto = false;
			input.value = '';
			this.changeDetectorRef.detectChanges();
		}
	}

	protected imageUrl(url?: string): string {
		return toDisplayImageUrl(url);
	}

	protected shortCoupleName(member: WeddingPartyMember): string {
		return `${this.firstWord(member.firstName)} & ${this.firstWord(member.secondName)}`;
	}

	protected groomsmenInviteUrl(member: WeddingPartyMember): string {
		return `${window.location.origin}/${this.weddingContextService.currentAdminWeddingId()}/convite-padrinhos/${member.id}`;
	}

	protected groomsmenWhatsappInviteLink(member: WeddingPartyMember): string {
		const invitationUrl = this.groomsmenInviteUrl(member);
		const text = `${this.shortCoupleName(member)}! Tenho um convite especial para vocês:\n\n${invitationUrl}`;
		return `https://wa.me/?text=${encodeURIComponent(text)}`;
	}

	protected invitationLabel(status: 'accepted' | 'declined'): string {
		return status === 'accepted' ? 'Aceitou' : 'Nao aceitou';
	}

	private firstWord(value: string): string {
		return value.trim().split(/\s+/)[0] || value;
	}

	sideLabel(side: 'bride' | 'groom' | 'couple'): string {
		return {
			bride: 'Noiva',
			groom: 'Noivo',
			couple: 'Casal',
		}[side];
	}
}
