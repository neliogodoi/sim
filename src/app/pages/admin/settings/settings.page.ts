import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';

import { Wedding } from '../../../core/models/wedding.models';
import { R2UploadService } from '../../../core/services/r2-upload.service';
import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';
import { toDisplayImageUrl } from '../../../core/utils/image-url';
import { AdminHeaderComponent } from '../../../layout/admin-header.component';
import { ImageUploadFieldComponent } from '../../../shared/ui/image-upload-field.component';
import { ToastService } from '../../../shared/ui/toast.service';

@Component({
	selector: 'app-settings-page',
	imports: [AdminHeaderComponent, AsyncPipe, FormsModule, ImageUploadFieldComponent],
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
	private readonly toastService = inject(ToastService);
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

		await this.weddingService.saveWedding({
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
		}, weddingId);
		this.toastService.success('Configurações salvas.');
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
			this.toastService.success('Foto enviada e salva.');
		} catch (error) {
			this.uploadMessage = '';
			this.uploadError = error instanceof Error ? error.message : 'Nao foi possivel enviar a foto.';
			this.toastService.error(this.uploadError);
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
	}
}
