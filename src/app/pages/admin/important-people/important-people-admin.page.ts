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
	templateUrl: './important-people-admin.page.html',

	styleUrl: './important-people-admin.page.css',
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
