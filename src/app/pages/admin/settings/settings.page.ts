import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';

import { Wedding, WeddingLocation } from '../../../core/models/wedding.models';
import { R2UploadService } from '../../../core/services/r2-upload.service';
import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';
import { toDisplayImageUrl } from '../../../core/utils/image-url';
import { AdminHeaderComponent } from '../../../layout/admin-header.component';
import { ImageUploadFieldComponent } from '../../../shared/ui/image-upload-field.component';
import { LocationMapPickerComponent, MapPoint } from '../../../shared/ui/location-map-picker.component';
import { ToastService } from '../../../shared/ui/toast.service';

@Component({
	selector: 'app-settings-page',
	imports: [AdminHeaderComponent, AsyncPipe, FormsModule, ImageUploadFieldComponent, LocationMapPickerComponent],
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
	protected locations: WeddingLocation[] = this.defaultLocations();
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

		const locations = this.normalizedLocations();
		const ceremony = locations[0];
		const reception = locations[1];

		await this.weddingService.saveWedding({
			slug: weddingId,
			coupleNames: this.coupleNames || 'Os noivos',
			eventDate: this.eventDate || '10/06/2026',
			welcomeMessage: this.welcomeMessage,
			coverImageUrl: this.coverImageUrl,
			sharedAlbumUrl: this.sharedAlbumUrl,
			ceremonyAddress: ceremony?.address || '',
			ceremonyMapUrl: ceremony ? this.googleMapsUrl(ceremony) : '',
			receptionAddress: reception?.address || '',
			receptionMapUrl: reception ? this.googleMapsUrl(reception) : '',
			locations,
		}, weddingId);
		this.toastService.success('Configurações salvas.');
	}

	protected addLocation(): void {
		this.locations = [
			...this.locations,
			{
				id: crypto.randomUUID(),
				label: 'Novo local',
				address: '',
				sortOrder: this.locations.length,
			},
		];
	}

	protected removeLocation(locationId: string): void {
		this.locations = this.locations
			.filter((location) => location.id !== locationId)
			.map((location, index) => ({ ...location, sortOrder: index }));
	}

	protected setLocationPoint(index: number, point: MapPoint): void {
		this.locations = this.locations.map((location, locationIndex) =>
			locationIndex === index
				? {
						...location,
						lat: Number(point.lat.toFixed(6)),
						lng: Number(point.lng.toFixed(6)),
						mapUrl: this.googleMapsUrl(point),
					}
				: location,
		);
	}

	protected googleMapsUrl(location: Pick<WeddingLocation, 'lat' | 'lng' | 'mapUrl'>): string {
		if (Number.isFinite(Number(location.lat)) && Number.isFinite(Number(location.lng))) {
			return `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
		}

		return location.mapUrl || '';
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
		this.locations = this.locationsFromWedding(wedding);
	}

	private normalizedLocations(): WeddingLocation[] {
		return this.locations
			.map((location, index) => ({
				...location,
				id: location.id || crypto.randomUUID(),
				label: location.label?.trim() || `Local ${index + 1}`,
				address: location.address?.trim() || '',
				mapUrl: this.googleMapsUrl(location),
				sortOrder: index,
			}))
			.filter((location) => location.label || location.address || this.googleMapsUrl(location));
	}

	private locationsFromWedding(wedding: Wedding): WeddingLocation[] {
		if (wedding.locations?.length) {
			return [...wedding.locations]
				.sort((first, second) => first.sortOrder - second.sortOrder)
				.map((location, index) => ({
					...location,
					id: location.id || crypto.randomUUID(),
					sortOrder: index,
				}));
		}

		return this.defaultLocations(wedding);
	}

	private defaultLocations(wedding?: Wedding): WeddingLocation[] {
		return [
			{
				id: 'ceremony',
				label: 'Local da Cerimonia',
				address: wedding?.ceremonyAddress || '',
				mapUrl: wedding?.ceremonyMapUrl || '',
				sortOrder: 0,
			},
			{
				id: 'reception',
				label: 'Local da Recepcao',
				address: wedding?.receptionAddress || '',
				mapUrl: wedding?.receptionMapUrl || '',
				sortOrder: 1,
			},
		];
	}
}
