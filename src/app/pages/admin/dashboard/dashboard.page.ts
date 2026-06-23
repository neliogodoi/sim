import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';

import { DEFAULT_THEME_PRESET } from '../../../core/constants/theme-presets';
import { scriptFontCssFamily } from '../../../core/constants/script-fonts';
import { Wedding, WeddingPartyMember } from '../../../core/models/wedding.models';
import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';
import { toDisplayImageUrl } from '../../../core/utils/image-url';
import { AdminHeaderComponent } from '../../../layout/admin-header.component';
import { AppIconComponent } from '../../../shared/ui/app-icon.component';
import { ToastService } from '../../../shared/ui/toast.service';

@Component({
	selector: 'app-dashboard-page',
	imports: [AdminHeaderComponent, AsyncPipe, FormsModule, RouterLink, AppIconComponent],
	templateUrl: './dashboard.page.html',

	styleUrl: './dashboard.page.css',
})
export class DashboardPage {
	private readonly auth = inject(Auth);
	private readonly router = inject(Router);
	private readonly weddingContextService = inject(WeddingContextService);
	private readonly weddingService = inject(WeddingService);
	private readonly toastService = inject(ToastService);

	protected readonly weddings$: Observable<Wedding[]> = authState(this.auth).pipe(
		switchMap((user) =>
			user ? this.weddingService.weddingsByOwner$(user.uid, this.weddingContextService.currentAdminWeddingId()) : of([]),
		),
	);
	protected readonly activeWedding$ = this.weddingContextService.activeWeddingId$.pipe(
		switchMap((weddingId) => this.weddingService.wedding$(weddingId)),
	);
	protected readonly weddingParty$ = this.weddingContextService.activeWeddingId$.pipe(
		switchMap((weddingId) => this.weddingService.weddingParty$(weddingId)),
	);
	protected readonly guests$ = this.weddingContextService.activeWeddingId$.pipe(
		switchMap((weddingId) => this.weddingService.guests$(weddingId)),
	);
	protected newWeddingNames = '';
	protected error = '';
	protected isCreateFormOpen = false;

	protected isDemoMode(): boolean {
		return this.router.url.startsWith('/demo') || this.router.url.startsWith('/default/admin');
	}

	protected adminLink(path = ''): string {
		const base = this.isDemoMode() ? '/demo' : '/admin';
		return path ? `${base}/${path}` : base;
	}

	protected toggleCreateWedding(): void {
		if (this.isDemoMode()) {
			return;
		}
		this.isCreateFormOpen = !this.isCreateFormOpen;
		this.error = '';
	}

	async createWedding(): Promise<void> {
		const user = this.auth.currentUser;
		const coupleNames = this.newWeddingNames.trim();
		const weddingId = this.generateWeddingId(coupleNames);

		if (!user) {
			this.toastService.error('Entre novamente para criar um casamento.');
			return;
		}

		if (!coupleNames) {
			this.toastService.error('Informe os nomes do casal.');
			return;
		}

		await this.weddingService.createWedding(weddingId, user.uid, {
			coupleNames,
			eventDate: '',
			theme: {
				presetId: DEFAULT_THEME_PRESET.id,
				primary: DEFAULT_THEME_PRESET.primary,
				secondary: DEFAULT_THEME_PRESET.secondary,
				tertiary: DEFAULT_THEME_PRESET.tertiary,
				neutral: DEFAULT_THEME_PRESET.neutral,
			},
		});
		this.weddingContextService.setActiveWeddingId(weddingId);
		this.newWeddingNames = '';
		this.error = '';
		this.isCreateFormOpen = false;
		await this.router.navigateByUrl('/admin/configuracoes');
	}

	async selectWedding(wedding: Wedding): Promise<void> {
		this.weddingContextService.setActiveWeddingId(wedding.slug || wedding.id);
	}

	protected imageUrl(url?: string): string {
		return toDisplayImageUrl(url);
	}

	protected scriptFontCssFamily(wedding?: Wedding | null): string {
		return scriptFontCssFamily(wedding?.theme?.scriptFont);
	}

	protected countdownLabel(eventDate?: string): string {
		const days = this.countdownDays(eventDate);
		if (days === null) {
			return 'Faltam alguns dias para o grande momento';
		}

		if (days === 0) {
			return 'Hoje e o grande dia';
		}

		if (days < 0) {
			return 'Esse momento ja ficou na memoria';
		}

		return days === 1 ? 'dia para o SIM' : `dias para o SIM`;
	}

	protected countdownValue(eventDate?: string): string {
		const days = this.countdownDays(eventDate);
		if (days === null) {
			return 'SIM';
		}

		if (days === 0) {
			return 'Hoje';
		}

		if (days < 0) {
			return 'Memória';
		}

		return String(days);
	}

	protected formattedEventDate(eventDate?: string): string {
		const date = this.parseDate(eventDate || '');
		if (!date) {
			return 'Data a definir';
		}

		return new Intl.DateTimeFormat('pt-BR', {
			day: '2-digit',
			month: 'long',
			year: 'numeric',
		}).format(date);
	}

	protected totalGuests(guests?: { guestCount: number }[] | null): number {
		return (guests || []).reduce((total, guest) => total + (Number(guest.guestCount) || 1), 0);
	}

	protected confirmedGuests(guests?: { guestCount: number; rsvpStatus?: string }[] | null): number {
		return (guests || [])
			.filter((guest) => guest.rsvpStatus === 'confirmed')
			.reduce((total, guest) => total + (Number(guest.guestCount) || 1), 0);
	}

	protected guestConfirmationRate(guests?: { guestCount: number; rsvpStatus?: string }[] | null): number {
		const total = this.totalGuests(guests);
		if (!total) {
			return 0;
		}

		return Math.round((this.confirmedGuests(guests) / total) * 100);
	}

	protected acceptedWeddingParty(party?: WeddingPartyMember[] | null): number {
		return (party || []).filter((member) => member.invitationStatus === 'accepted').length;
	}

	protected partyConfirmationRate(party?: WeddingPartyMember[] | null): number {
		const total = party?.length || 0;
		if (!total) {
			return 0;
		}

		return Math.round((this.acceptedWeddingParty(party) / total) * 100);
	}

	private countdownDays(eventDate?: string): number | null {
		if (!eventDate) {
			return null;
		}

		const target = this.parseDate(eventDate);
		if (!target) {
			return null;
		}

		const today = new Date();
		today.setHours(0, 0, 0, 0);
		target.setHours(0, 0, 0, 0);

		const days = Math.ceil((target.getTime() - today.getTime()) / 86_400_000);

		return days;
	}

	private parseDate(value: string): Date | null {
		if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
			return new Date(`${value}T00:00:00`);
		}

		const parts = value.split('/');
		if (parts.length === 3) {
			const [day, month, year] = parts;
			return new Date(`${year}-${month}-${day}T00:00:00`);
		}

		const date = new Date(value);
		return Number.isNaN(date.getTime()) ? null : date;
	}

	private generateWeddingId(coupleNames: string): string {
		const slug =
			coupleNames
				.trim()
				.toLowerCase()
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '')
				.replace(/[^a-z0-9-]+/g, '-')
				.replace(/^-+|-+$/g, '');

		return `${slug || 'casamento'}-${crypto.randomUUID().slice(0, 8)}`;
	}

	protected async shareWedding(wedding?: Wedding | null): Promise<void> {
		if (!wedding) {
			this.toastService.error('Selecione um casamento para compartilhar.');
			return;
		}

		const slug = wedding.slug || wedding.id;
		const url = `${window.location.origin}/${slug}`;

		if (navigator.share) {
			await navigator.share({
				title: wedding.coupleNames || 'Nosso casamento',
				text: 'Veja nosso site de casamento',
				url,
			});
			return;
		}

		await navigator.clipboard.writeText(url);
		this.toastService.success('Link copiado.');
	}
}
