import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';

import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';
import { PublicNavComponent } from '../../../layout/public-nav.component';
import { AppIconComponent } from '../../../shared/ui/app-icon.component';

@Component({
  selector: 'app-schedule-page',
  imports: [AsyncPipe, PublicNavComponent, AppIconComponent],
  templateUrl: './schedule.page.html',

  styleUrl: './schedule.page.css',
})
export class SchedulePage {
  private readonly route = inject(ActivatedRoute);
  private readonly weddingContextService = inject(WeddingContextService);
  private readonly weddingService = inject(WeddingService);

  protected readonly weddingId$ = this.weddingContextService.publicWeddingId$(this.route);
  protected readonly schedule$ = this.weddingId$.pipe(switchMap((weddingId) => this.weddingService.schedule$(weddingId)));

  protected formattedDate(date?: string): string {
    if (!date) {
      return 'Data a definir';
    }

    const parsed = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(parsed);
  }

  protected dayLabel(date?: string): string {
    if (!date) {
      return '--';
    }

    const parsed = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      return '--';
    }

    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit' }).format(parsed);
  }

  protected monthLabel(date?: string): string {
    if (!date) {
      return 'definir';
    }

    const parsed = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      return 'definir';
    }

    return new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(parsed).replace('.', '');
  }
}
