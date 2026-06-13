import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import QRCode from 'qrcode';
import { switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { WeddingContextService } from '../../../core/services/wedding-context.service';
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
export class AlbumPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly weddingContextService = inject(WeddingContextService);
  private readonly weddingService = inject(WeddingService);

  protected readonly weddingId$ = this.weddingContextService.publicWeddingId$(this.route);
  protected readonly wedding$ = this.weddingId$.pipe(switchMap((weddingId) => this.weddingService.wedding$(weddingId)));
  protected readonly qrCodeUrl = signal('');

  ngOnInit(): void {
    this.wedding$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((wedding) => {
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
