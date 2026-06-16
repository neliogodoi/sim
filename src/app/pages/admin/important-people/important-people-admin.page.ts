import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom, switchMap } from 'rxjs';

import { ImportantPerson } from '../../../core/models/wedding.models';
import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';
import { AdminHeaderComponent } from '../../../layout/admin-header.component';

@Component({
	selector: 'app-important-people-admin-page',
	imports: [AdminHeaderComponent, AsyncPipe, FormsModule],
	template: `
    <app-admin-header />
    @let people = people$ | async;

    <main class="admin-page">
      <h1>Pessoas importantes</h1>
      @if (shouldShowForm(people)) {
        <form class="form-card" (ngSubmit)="savePerson()">
          <label>
            Primeira pessoa
            <input name="name" [(ngModel)]="name" required />
          </label>
          <label>
            Papel da primeira pessoa
            <select name="role" [(ngModel)]="role">
              <option value="groomFather">Pai do noivo</option>
              <option value="groomMother">Mãe do noivo</option>
              <option value="brideFather">Pai da noiva</option>
              <option value="brideMother">Mãe da noiva</option>
              <option value="page">Pajem</option>
              <option value="maid">Dama</option>
              <option value="family">Familia</option>
              <option value="other">Outro</option>
            </select>
          </label>
          <label>
            Segunda pessoa
            <input name="secondName" [(ngModel)]="secondName" />
          </label>
          <label>
            Papel da segunda pessoa
            <select name="secondRole" [(ngModel)]="secondRole">
              <option value="groomMother">Mãe do noivo</option>
              <option value="groomFather">Pai do noivo</option>
              <option value="brideMother">Mãe da noiva</option>
              <option value="brideFather">Pai da noiva</option>
              <option value="page">Pajem</option>
              <option value="maid">Dama</option>
              <option value="family">Familia</option>
              <option value="other">Outro</option>
            </select>
          </label>
          <label>
            Observacao
            <textarea name="description" [(ngModel)]="description"></textarea>
          </label>
          <button class="primary-action" type="submit" [disabled]="isDemoMode()">{{ editingPersonId ? 'Salvar pessoa' : 'Adicionar pessoa' }}</button>
          @if (people?.length) {
            <button class="secondary-action" type="button" (click)="closeForm()">Cancelar</button>
          }
        </form>
      } @else if (people?.length) {
        <button class="primary-action form-toggle-action" type="button" [disabled]="isDemoMode()" (click)="openForm()">Adicionar pessoa</button>
      }

      <div class="list-stack">
        @for (person of people; track person.id) {
          <article class="info-card admin-list-card">
            <div class="card-actions" [class.demo-disabled]="isDemoMode()" [attr.aria-disabled]="isDemoMode()">
              <a class="icon-action" [href]="importantPersonPrintUrl(person)" target="_blank" rel="noreferrer" aria-label="Imprimir convite especial">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 8V4h10v4" />
                  <path d="M6 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1" />
                  <path d="M7 14h10v6H7z" />
                </svg>
              </a>
              <a class="icon-action" [href]="importantPersonWhatsappInviteLink(person)" target="_blank" rel="noreferrer" aria-label="Enviar convite especial">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 6h16v12H4z" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
              </a>
              <button class="icon-action" type="button" (click)="editPerson(person)" aria-label="Editar pessoa">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" />
                  <path d="m14 6 4 4" />
                </svg>
              </button>
              <button class="icon-action" type="button" (click)="removePerson(person.id)" aria-label="Remover pessoa">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 7h14" />
                  <path d="M9 7V5h6v2" />
                  <path d="M8 10v8" />
                  <path d="M16 10v8" />
                  <path d="M6.5 7 7 21h10l.5-14" />
                </svg>
              </button>
            </div>
            <h2>{{ personDisplayName(person) }}</h2>
            <p>
              {{ roleDisplay(person) }}
              @if (person.invitationStatus) {
                ·
                <span class="status-pill" [class.confirmed]="person.invitationStatus === 'accepted'">
                  {{ invitationLabel(person.invitationStatus) }}
                </span>
              }
            </p>
            @if (person.description) {
              <p>{{ person.description }}</p>
            }
          </article>
        } @empty {
          <p>Nenhuma pessoa cadastrada ainda.</p>
        }
      </div>
    </main>
  `,
})
export class ImportantPeopleAdminPage {
	private readonly weddingContextService = inject(WeddingContextService);
	private readonly weddingService = inject(WeddingService);
	private readonly router = inject(Router);

	protected readonly weddingId$ = this.weddingContextService.activeWeddingId$;
	protected readonly people$ = this.weddingId$.pipe(
		switchMap((weddingId) => this.weddingService.importantPeople$(weddingId)),
	);
	protected name = '';
	protected secondName = '';
	protected role: ImportantPerson['role'] = 'groomFather';
	protected secondRole: ImportantPerson['role'] = 'groomMother';
	protected description = '';
	protected editingPersonId = '';
	protected formExpanded = false;

	async savePerson(): Promise<void> {
		if (this.isDemoMode()) {
			return;
		}

		if (!this.name.trim()) {
			return;
		}

		const weddingId = await firstValueFrom(this.weddingId$);
		await this.weddingService.saveImportantPerson(
			{
				id: this.editingPersonId || undefined,
				weddingId,
				name: this.name.trim(),
				secondName: this.secondName.trim(),
				role: this.role,
				secondRole: this.secondName.trim() ? this.secondRole : null,
				description: this.description.trim(),
				sortOrder: Date.now(),
			},
			weddingId,
		);

		this.closeForm();
	}

	editPerson(person: ImportantPerson): void {
		if (this.isDemoMode()) {
			return;
		}
		this.formExpanded = true;
		this.editingPersonId = person.id;
		this.name = person.name;
		this.secondName = person.secondName || '';
		this.role = person.role;
		this.secondRole = person.secondRole || 'groomMother';
		this.description = person.description || '';
	}

	removePerson(personId: string): Promise<void> {
		if (this.isDemoMode()) {
			return Promise.resolve();
		}
		return this.weddingService.deleteImportantPerson(personId, this.weddingContextService.currentAdminWeddingId());
	}

	protected isDemoMode(): boolean {
		return this.router.url.startsWith('/demo') || this.router.url.startsWith('/default/admin');
	}

	protected openForm(): void {
		this.formExpanded = true;
	}

	protected closeForm(): void {
		this.name = '';
		this.secondName = '';
		this.role = 'groomFather';
		this.secondRole = 'groomMother';
		this.description = '';
		this.editingPersonId = '';
		this.formExpanded = false;
	}

	protected shouldShowForm(people?: ImportantPerson[] | null): boolean {
		return people?.length === 0 || this.formExpanded || !!this.editingPersonId;
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
			other: 'Outro',
		}[role];
	}

	protected invitationLabel(status: 'accepted' | 'declined'): string {
		return status === 'accepted' ? 'Aceitou' : 'Nao aceitou';
	}

	protected personDisplayName(person: ImportantPerson): string {
		return person.secondName ? `${person.name.split(" ")[0]} & ${person.secondName.split(" ")[0]}` : person.name.split(" ")[0];
	}

	protected roleDisplay(person: ImportantPerson): string {
		return person.secondName && person.secondRole
			? `${this.roleLabel(person.role)} & ${this.roleLabel(person.secondRole)}`
			: this.roleLabel(person.role);
	}

	protected importantPersonInviteUrl(person: ImportantPerson): string {
		return `${window.location.origin}/${this.weddingContextService.currentAdminWeddingId()}/convite-especial/${person.id}`;
	}

	protected importantPersonPrintUrl(person: ImportantPerson): string {
		return `${this.importantPersonInviteUrl(person)}?print=1`;
	}

	protected importantPersonWhatsappInviteLink(person: ImportantPerson): string {
		const invitationUrl = this.importantPersonInviteUrl(person);
		const text = `${this.personDisplayName(person)}! Tenho um convite especial para ${person.secondName ? 'vocês' : 'você'}:\n\n${invitationUrl}`;
		return `https://wa.me/?text=${encodeURIComponent(text)}`;
	}
}
