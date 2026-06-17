import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';

import { DEFAULT_SCRIPT_FONT, SCRIPT_FONT_OPTIONS, normalizeScriptFont } from '../../../core/constants/script-fonts';
import { Wedding } from '../../../core/models/wedding.models';
import { R2UploadService } from '../../../core/services/r2-upload.service';
import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';
import { toDisplayImageUrl } from '../../../core/utils/image-url';
import { AdminHeaderComponent } from '../../../layout/admin-header.component';

const DEFAULT_PALETTE = {
	primary: '#f2f2f2',
	secondary: '#ffffff',
	tertiary: '#eeeeee',
	neutral: '#ffffff',
};

@Component({
	selector: 'app-settings-page',
	imports: [AdminHeaderComponent, AsyncPipe, FormsModule],
	templateUrl: './settings.page.html',

	styleUrl: './settings.page.css',
})
export class SettingsPage implements OnInit {
	private readonly weddingContextService = inject(WeddingContextService);
	private readonly weddingService = inject(WeddingService);
	private readonly r2UploadService = inject(R2UploadService);
	private readonly auth = inject(Auth);
	private readonly destroyRef = inject(DestroyRef);
	private readonly changeDetectorRef = inject(ChangeDetectorRef);
	private hasLoadedWedding = false;

	protected readonly weddingId$ = this.weddingContextService.activeWeddingId$;
	protected readonly wedding$ = this.weddingId$.pipe(switchMap((weddingId) => this.weddingService.wedding$(weddingId)));
	protected slug = this.weddingContextService.currentAdminWeddingId();
	protected coupleNames = '';
	protected eventDate = '';
	protected welcomeMessage = '';
	protected coverImageUrl = '';
	protected sharedAlbumUrl = '';
	protected ceremonyAddress = '';
	protected ceremonyMapUrl = '';

	protected receptionAddress = '';
	protected receptionMapUrl = '';
	protected primary = DEFAULT_PALETTE.primary;
	protected secondary = DEFAULT_PALETTE.secondary;
	protected tertiary = DEFAULT_PALETTE.tertiary;
	protected neutral = DEFAULT_PALETTE.neutral;
	protected scriptFont = DEFAULT_SCRIPT_FONT;
	protected readonly scriptFontOptions = SCRIPT_FONT_OPTIONS;
	protected isUploadingCover = false;
	protected uploadMessage = '';
	protected uploadError = '';

	ngOnInit(): void {
		this.wedding$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((wedding) => {
			if (!wedding || this.hasLoadedWedding) {
				return;
			}

			this.applyWedding(wedding);
			this.hasLoadedWedding = true;
		});
	}

	async save(): Promise<void> {
		const uid = this.auth.currentUser?.uid;
		const weddingId = this.weddingContextService.currentAdminWeddingId();
		if (uid) {
			await this.weddingService.ensureOwner(uid, weddingId);
		}

		return this.weddingService.saveWedding({
			slug: weddingId,
			coupleNames: this.coupleNames || 'Os noivos',
			eventDate: this.eventDate || '10/06/2026',
			welcomeMessage: this.welcomeMessage,
			coverImageUrl: this.coverImageUrl,
			sharedAlbumUrl: this.sharedAlbumUrl,
			ceremonyAddress: this.ceremonyAddress,
			ceremonyMapUrl: this.ceremonyMapUrl,
			receptionAddress: this.receptionAddress,
			receptionMapUrl: this.receptionMapUrl,
			theme: {
				primary: this.normalizeColor(this.primary, DEFAULT_PALETTE.primary),
				secondary: this.normalizeColor(this.secondary, DEFAULT_PALETTE.secondary),
				tertiary: this.normalizeColor(this.tertiary, DEFAULT_PALETTE.tertiary),
				neutral: this.normalizeColor(this.neutral, DEFAULT_PALETTE.neutral),
				scriptFont: normalizeScriptFont(this.scriptFont),
			},
		}, weddingId);
	}

	protected imageUrl(url?: string): string {
		return toDisplayImageUrl(url);
	}

	protected async uploadCoverImage(event: Event): Promise<void> {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) {
			return;
		}

		this.isUploadingCover = true;
		this.uploadError = '';
		this.uploadMessage = 'Enviando foto...';

		try {
			const url = await this.r2UploadService.uploadImage(file);
			this.coverImageUrl = url;
			await this.saveCoverImageUrl(url);
			this.uploadMessage = 'Foto enviada e salva.';
		} catch (error) {
			this.uploadMessage = '';
			this.uploadError = error instanceof Error ? error.message : 'Nao foi possivel enviar a foto.';
		} finally {
			this.isUploadingCover = false;
			input.value = '';
			this.changeDetectorRef.detectChanges();
		}
	}

	private async saveCoverImageUrl(coverImageUrl: string): Promise<void> {
		const uid = this.auth.currentUser?.uid;
		const weddingId = this.weddingContextService.currentAdminWeddingId();
		if (uid) {
			await this.weddingService.ensureOwner(uid, weddingId);
		}

		await this.weddingService.saveWedding({
			coverImageUrl,
		}, weddingId);
	}

	private applyWedding(wedding: Wedding): void {
		this.slug = wedding.slug || wedding.id || this.weddingContextService.currentAdminWeddingId();
		this.coupleNames = wedding.coupleNames || '';
		this.eventDate = wedding.eventDate || '';
		this.welcomeMessage = wedding.welcomeMessage || '';
		this.coverImageUrl = wedding.coverImageUrl || '';
		this.sharedAlbumUrl = wedding.sharedAlbumUrl || '';
		this.ceremonyAddress = wedding.ceremonyAddress || '';
		this.ceremonyMapUrl = wedding.ceremonyMapUrl || '';
		this.receptionAddress = wedding.receptionAddress || '';
		this.receptionMapUrl = wedding.receptionMapUrl || '';
		this.primary = this.normalizeColor(wedding.theme?.primary, DEFAULT_PALETTE.primary);
		this.secondary = this.normalizeColor(wedding.theme?.secondary, DEFAULT_PALETTE.secondary);
		this.tertiary = this.normalizeColor(wedding.theme?.tertiary, DEFAULT_PALETTE.tertiary);
		this.neutral = this.normalizeColor(wedding.theme?.neutral, DEFAULT_PALETTE.neutral);
		this.scriptFont = normalizeScriptFont(wedding.theme?.scriptFont);
	}

	private normalizeColor(value: string | undefined, fallback: string): string {
		const normalized = (value || '').trim();
		return /^#[0-9a-fA-F]{6}$/.test(normalized) ? normalized : fallback;
	}
}
