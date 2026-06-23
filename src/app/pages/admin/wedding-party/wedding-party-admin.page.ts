import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom, switchMap } from 'rxjs';

import { WeddingPartyMember } from '../../../core/models/wedding.models';
import { R2UploadService } from '../../../core/services/r2-upload.service';
import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';
import { toDisplayImageUrl } from '../../../core/utils/image-url';
import { AdminHeaderComponent } from '../../../layout/admin-header.component';
import { AppIconComponent } from '../../../shared/ui/app-icon.component';
import { ImageUploadFieldComponent } from '../../../shared/ui/image-upload-field.component';
import { ToastService } from '../../../shared/ui/toast.service';

@Component({
	selector: 'app-wedding-party-admin-page',
	imports: [
		AdminHeaderComponent,
		AppIconComponent,
		AsyncPipe,
		FormsModule,
		ImageUploadFieldComponent,
	],
	templateUrl: './wedding-party-admin.page.html',

	styleUrl: './wedding-party-admin.page.css',
})
export class WeddingPartyAdminPage {
	private readonly auth = inject(Auth);
	private readonly router = inject(Router);
	private readonly r2UploadService = inject(R2UploadService);
	private readonly weddingContextService = inject(WeddingContextService);
	private readonly weddingService = inject(WeddingService);
	private readonly changeDetectorRef = inject(ChangeDetectorRef);
	private readonly toastService = inject(ToastService);

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
	protected openActionsMemberId = '';
	protected expandedMemberId = '';
	protected searchTerm = '';

	async saveMember(): Promise<void> {
		if (this.isDemoMode()) {
			return;
		}

		if (!this.firstName.trim() || !this.secondName.trim()) {
			return;
		}

		const weddingId = await firstValueFrom(this.weddingId$);
		const user = await firstValueFrom(authState(this.auth));
		if (user) {
			await this.weddingService.ensureOwner(user.uid, weddingId);
		}

		const isEditing = !!this.editingMemberId;

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
		this.toastService.success(isEditing ? 'Padrinhos salvos.' : 'Padrinhos adicionados.');
	}

	editMember(member: WeddingPartyMember): void {
		if (this.isDemoMode()) {
			return;
		}
		this.openActionsMemberId = '';
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
		if (this.isDemoMode()) {
			return Promise.resolve();
		}
		this.openActionsMemberId = '';
		return this.weddingService.deleteWeddingPartyMember(memberId, this.weddingContextService.currentAdminWeddingId());
	}

	protected async copyInviteLink(member: WeddingPartyMember): Promise<void> {
		try {
			await navigator.clipboard.writeText(this.groomsmenInviteUrl(member));
			this.toastService.success('Link copiado.');
		} catch {
			this.toastService.error('Nao foi possivel copiar o link.');
		}
		this.openActionsMemberId = '';
	}

	protected toggleActions(memberId: string): void {
		this.openActionsMemberId = this.openActionsMemberId === memberId ? '' : memberId;
	}

	protected setExpandedMember(memberId: string, expanded: boolean): void {
		this.expandedMemberId = expanded ? memberId : '';
		this.openActionsMemberId = '';
	}

	protected isExpanded(memberId: string, isFirst = false): boolean {
		return this.expandedMemberId ? this.expandedMemberId === memberId : isFirst;
	}

	protected isActionsOpen(memberId: string): boolean {
		return this.openActionsMemberId === memberId;
	}

	protected isDemoMode(): boolean {
		return this.router.url.startsWith('/demo') || this.router.url.startsWith('/default/admin');
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
		return members?.length === 0 || this.formExpanded || !!this.editingMemberId;
	}

	protected filteredMembers(members?: WeddingPartyMember[] | null): WeddingPartyMember[] {
		const term = this.normalizeSearch(this.searchTerm);
		if (!term) {
			return members || [];
		}

		return (members || []).filter((member) =>
			[
				member.firstName,
				member.secondName,
				this.sideLabel(member.side),
				this.invitationText(member.invitationStatus),
				this.fullCoupleName(member),
			]
				.filter(Boolean)
				.some((value) => this.normalizeSearch(value || '').includes(term)),
		);
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
			this.toastService.success('Foto enviada. Salve para concluir.');
		} catch (error) {
			this.uploadMessage = '';
			this.uploadError = error instanceof Error ? error.message : 'Nao foi possivel enviar a foto.';
			this.toastService.error(this.uploadError);
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

	protected fullCoupleName(member: WeddingPartyMember): string {
		return `${member.firstName} & ${member.secondName}`;
	}

	protected compactInitials(member: WeddingPartyMember): string {
		return `${this.firstWord(member.firstName)[0] || ''}${this.firstWord(member.secondName)[0] || ''}`.toUpperCase();
	}

	protected groomsmenInviteUrl(member: WeddingPartyMember): string {
		return `${window.location.origin}/${this.weddingContextService.currentAdminWeddingId()}/convite-padrinhos/${member.id}`;
	}

	protected groomsmenPrintUrl(member: WeddingPartyMember): string {
		return `${this.groomsmenInviteUrl(member)}?print=1`;
	}

	protected groomsmenWhatsappInviteLink(member: WeddingPartyMember): string {
		const invitationUrl = this.groomsmenInviteUrl(member);
		const text = `${this.shortCoupleName(member)}! Tenho um convite especial para vocês:\n\n${invitationUrl}`;
		return `https://wa.me/?text=${encodeURIComponent(text)}`;
	}

	protected invitationLabel(status: 'accepted' | 'declined'): string {
		return status === 'accepted' ? 'Aceitou' : 'Nao aceitou';
	}

	protected invitationText(status?: 'accepted' | 'declined'): string {
		if (status === 'accepted') {
			return 'Convite aceito';
		}

		if (status === 'declined') {
			return 'Convite recusado';
		}

		return 'Convite pendente';
	}

	protected invitationIcon(status?: 'accepted' | 'declined'): string {
		if (status === 'accepted') {
			return '✓';
		}

		if (status === 'declined') {
			return '×';
		}

		return '•';
	}

	protected acceptedCount(members?: WeddingPartyMember[] | null): number {
		return (members || []).filter((member) => member.invitationStatus === 'accepted').length;
	}

	protected categoryBadgeClass(side: 'bride' | 'groom' | 'couple'): string {
		return `badge-${side}`;
	}

	protected async goToMore(): Promise<void> {
		await this.router.navigateByUrl(this.isDemoMode() ? '/demo/mais' : '/admin/mais');
	}

	private firstWord(value: string): string {
		return value.trim().split(/\s+/)[0] || value;
	}

	sideLabel(side: 'bride' | 'groom' | 'couple'): string {
		return {
			bride: 'Padrinhos da noiva',
			groom: 'Padrinhos do noivo',
			couple: 'Padrinhos do casal',
		}[side];
	}

	private normalizeSearch(value: string): string {
		return value
			.trim()
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '');
	}
}
