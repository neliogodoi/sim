import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';

import { PublicNavComponent } from '../../../layout/public-nav.component';
import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';
import { toDisplayImageUrl } from '../../../core/utils/image-url';

@Component({
  selector: 'app-home-page',
  imports: [AsyncPipe, PublicNavComponent, RouterLink],
  template: `
    @let wedding = wedding$ | async;

    <main class="public-page home-page">
      <section class="hero" [class.hero-empty]="!wedding?.coverImageUrl">
        @if (wedding?.coverImageUrl) {
          <img [src]="imageUrl(wedding?.coverImageUrl)" alt="Foto do casal" />
        } @else {
          <div class="hero-placeholder"></div>
        }

        <button class="palette-button" type="button" aria-label="Paleta ativa"></button>
      </section>

      <section class="home-content">
        <div class="ornament" aria-hidden="true">♥</div>
        <h1>{{ wedding?.coupleNames || 'Beatriz & Nélio' }}</h1>
        <p class="date">{{ wedding?.eventDate || '10/06/2026' }}</p>
        <p class="countdown">{{ countdownLabel(wedding?.eventDate) }}</p>
        <p class="message">
          {{
            wedding?.welcomeMessage ||
              'Estamos preparando esse momento com muito carinho e queremos viver cada detalhe ao lado de pessoas especiais.'
          }}
        </p>
        <a class="primary-action" [routerLink]="confirmPresenceLink()">Confirmar presenca</a>
      </section>
    </main>

    <app-public-nav />
  `,
})
export class HomePage {
  private readonly route = inject(ActivatedRoute);
  private readonly weddingContextService = inject(WeddingContextService);
  private readonly weddingService = inject(WeddingService);

  protected readonly weddingId$ = this.weddingContextService.publicWeddingId$(this.route);
  protected readonly wedding$ = this.weddingId$.pipe(switchMap((weddingId) => this.weddingService.wedding$(weddingId)));

  protected confirmPresenceLink(): string[] {
    const slug = this.route.snapshot.paramMap.get('slug');
    return slug ? ['/', slug, 'confirmar-presenca'] : ['/', 'confirmar-presenca'];
  }

  protected imageUrl(url?: string): string {
    return toDisplayImageUrl(url);
  }

  protected countdownLabel(eventDate?: string): string {
    if (!eventDate) {
      return 'Faltam alguns dias para o grande momento';
    }

    const target = this.parseDate(eventDate);
    if (!target) {
      return 'Faltam alguns dias para o grande momento';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const days = Math.ceil((target.getTime() - today.getTime()) / 86_400_000);

    if (days === 0) {
      return 'Hoje e o grande dia';
    }

    if (days < 0) {
      return 'Esse momento ja ficou na memoria';
    }

    return days === 1 ? 'Falta 1 dia' : `Faltam ${days} dias`;
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
}
