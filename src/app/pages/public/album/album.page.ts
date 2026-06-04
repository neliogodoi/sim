import { AsyncPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import QRCode from 'qrcode';

import { WeddingService } from '../../../core/services/wedding.service';
import { PublicNavComponent } from '../../../layout/public-nav.component';

@Component({
  selector: 'app-album-page',
  imports: [AsyncPipe, PublicNavComponent],
  template: `
    @let wedding = wedding$ | async;

    <main class="public-page content-page album-page">
      <h1>Album compartilhado</h1>
      <p>Abra o album no Google Fotos ou aponte a camera para o QR Code.</p>

      @if (wedding?.sharedAlbumUrl) {
        @if (qrCodeUrl()) {
          <img class="qr-image" [src]="qrCodeUrl()" alt="QR Code do album compartilhado" />
        } @else {
          <div class="qr-placeholder" aria-label="QR Code do album">QR</div>
        }
        <a class="primary-action" [href]="wedding?.sharedAlbumUrl" target="_blank" rel="noreferrer">
          Abrir album
        </a>
      } @else {
        <p>Album ainda nao configurado.</p>
      }
    </main>

    <app-public-nav />
  `,
})
export class AlbumPage {
  private readonly weddingService = inject(WeddingService);

  protected readonly wedding$ = this.weddingService.wedding$();
  protected readonly qrCodeUrl = signal('');

  constructor() {
    this.wedding$.subscribe((wedding) => {
      void this.generateQrCode(wedding?.sharedAlbumUrl);
    });
  }

  private async generateQrCode(url?: string): Promise<void> {
    if (!url) {
      this.qrCodeUrl.set('');
      return;
    }

    this.qrCodeUrl.set(
      await QRCode.toDataURL(url, {
        margin: 2,
        width: 280,
        color: {
          dark: this.cssVariable('--color-qr-dark', '#222222'),
          light: this.cssVariable('--color-qr-light', '#ffffff'),
        },
      }),
    );
  }

  private cssVariable(name: string, fallback: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  }
}
