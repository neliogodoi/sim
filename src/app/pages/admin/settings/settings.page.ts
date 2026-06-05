import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
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

@Component({
  selector: 'app-settings-page',
  imports: [AdminHeaderComponent, AsyncPipe, FormsModule],
  template: `
    <app-admin-header />
    @let wedding = wedding$ | async;

    <main class="admin-page">
      <h1>Configuracoes</h1>
      <form class="form-card" (ngSubmit)="save()">
        <label>
          Slug publico
          <input name="slug" [(ngModel)]="slug" disabled />
        </label>
        <label>
          Nomes do casal
          <input name="coupleNames" [(ngModel)]="coupleNames" [placeholder]="wedding?.coupleNames || 'Beatriz & Nélio'" />
        </label>
        <label>
          Data
          <input name="eventDate" [(ngModel)]="eventDate" [placeholder]="wedding?.eventDate || '10/06/2026'" />
        </label>
        <label>
          Mensagem
          <textarea name="welcomeMessage" [(ngModel)]="welcomeMessage" [placeholder]="wedding?.welcomeMessage || 'Mensagem dos noivos'"></textarea>
        </label>
        <label>
          URL da foto de capa
          <input name="coverImageUrl" [(ngModel)]="coverImageUrl" placeholder="Link publico do Google Drive ou URL direta" />
        </label>
        <label>
          Enviar foto de capa
          <input type="file" accept="image/*" [disabled]="isUploadingCover" (change)="uploadCoverImage($event)" />
        </label>
        @if (coverImageUrl) {
          <img class="cover-preview" [src]="imageUrl(coverImageUrl)" alt="Previa da foto de capa" />
        }
        @if (uploadMessage) {
          <p class="muted-state">{{ uploadMessage }}</p>
        }
        @if (uploadError) {
          <p class="error-state">{{ uploadError }}</p>
        }
        <label>
          Link do album Google Fotos
          <input name="sharedAlbumUrl" [(ngModel)]="sharedAlbumUrl" [placeholder]="wedding?.sharedAlbumUrl || 'https://photos.app.goo.gl/...'" />
        </label>
        <label>
          Endereco da cerimonia
          <input name="ceremonyAddress" [(ngModel)]="ceremonyAddress" [placeholder]="wedding?.ceremonyAddress || 'Endereco'" />
        </label>
        <label>
          Link Google Maps
          <input name="ceremonyMapUrl" [(ngModel)]="ceremonyMapUrl" [placeholder]="wedding?.ceremonyMapUrl || 'https://maps.google.com/...'" />
        </label>
        <label>
          Endereco da recepcao
          <input name="receptionAddress" [(ngModel)]="receptionAddress" [placeholder]="wedding?.receptionAddress || 'Endereco'" />
        </label>
        <label>
          Link Google Maps da recepcao
          <input name="receptionMapUrl" [(ngModel)]="receptionMapUrl" [placeholder]="wedding?.receptionMapUrl || 'https://maps.google.com/...'" />
        </label>
        <label>
          Cor principal
          <input type="color" name="primary" [(ngModel)]="primary" />
        </label>
        <button class="primary-action" type="submit">Salvar</button>
      </form>
    </main>
  `,
})
export class SettingsPage {
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
  protected primary = '#f2f2f2';
  protected isUploadingCover = false;
  protected uploadMessage = '';
  protected uploadError = '';

  constructor() {
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
      coupleNames: this.coupleNames || 'Beatriz & Nélio',
      eventDate: this.eventDate || '10/06/2026',
      welcomeMessage: this.welcomeMessage,
      coverImageUrl: this.coverImageUrl,
      sharedAlbumUrl: this.sharedAlbumUrl,
      ceremonyAddress: this.ceremonyAddress,
      ceremonyMapUrl: this.ceremonyMapUrl,
      receptionAddress: this.receptionAddress,
      receptionMapUrl: this.receptionMapUrl,
      theme: {
        primary: this.primary,
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
    this.primary = wedding.theme?.primary || this.primary;
  }
}
