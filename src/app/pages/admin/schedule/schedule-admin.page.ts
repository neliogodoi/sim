import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom, switchMap } from 'rxjs';

import { ScheduleItem } from '../../../core/models/wedding.models';
import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';
import { AdminHeaderComponent } from '../../../layout/admin-header.component';
import { AppIconComponent } from '../../../shared/ui/app-icon.component';
import { FloatingAddButtonComponent } from '../../../shared/ui/floating-add-button.component';

@Component({
  selector: 'app-schedule-admin-page',
  imports: [AdminHeaderComponent, AsyncPipe, FormsModule, FloatingAddButtonComponent, AppIconComponent],
  templateUrl: './schedule-admin.page.html',

  styleUrl: './schedule-admin.page.css',
})
export class ScheduleAdminPage {
  private readonly weddingContextService = inject(WeddingContextService);
  private readonly weddingService = inject(WeddingService);
  private readonly router = inject(Router);

  protected readonly weddingId$ = this.weddingContextService.activeWeddingId$;
  protected readonly schedule$ = this.weddingId$.pipe(switchMap((weddingId) => this.weddingService.schedule$(weddingId)));
  protected title = '';
  protected date = '';
  protected startsAt = '';
  protected locationLabel = '';
  protected description = '';
  protected editingItemId = '';
  protected formExpanded = false;

  async saveItem(): Promise<void> {
    if (this.isDemoMode()) {
      return;
    }

    if (!this.title.trim() || !this.startsAt.trim()) {
      return;
    }

    const weddingId = await firstValueFrom(this.weddingId$);
    await this.weddingService.saveScheduleItem({
      id: this.editingItemId || undefined,
      weddingId,
      title: this.title.trim(),
      date: this.date || undefined,
      startsAt: this.startsAt.trim(),
      locationLabel: this.locationLabel.trim(),
      description: this.description.trim(),
      sortOrder: this.scheduleSortOrder(this.date, this.startsAt),
    }, weddingId);

    this.title = '';
    this.date = '';
    this.startsAt = '';
    this.locationLabel = '';
    this.description = '';
    this.editingItemId = '';
    this.formExpanded = false;
  }

  editItem(item: ScheduleItem): void {
    if (this.isDemoMode()) {
      return;
    }
    this.formExpanded = true;
    this.editingItemId = item.id;
    this.title = item.title;
    this.date = item.date || '';
    this.startsAt = item.startsAt;
    this.locationLabel = item.locationLabel || '';
    this.description = item.description || '';
  }

  removeItem(itemId: string): Promise<void> {
    if (this.isDemoMode()) {
      return Promise.resolve();
    }
    return this.weddingService.deleteScheduleItem(itemId, this.weddingContextService.currentAdminWeddingId());
  }

  protected isDemoMode(): boolean {
    return this.router.url.startsWith('/demo') || this.router.url.startsWith('/default/admin');
  }

  protected openForm(): void {
    this.formExpanded = true;
  }

  protected closeForm(): void {
    this.title = '';
    this.date = '';
    this.startsAt = '';
    this.locationLabel = '';
    this.description = '';
    this.editingItemId = '';
    this.formExpanded = false;
  }

  protected shouldShowForm(items?: ScheduleItem[] | null): boolean {
    return items?.length === 0 || this.formExpanded || !!this.editingItemId;
  }

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

  private scheduleSortOrder(date?: string, startsAt?: string): number {
    if (!date) {
      return Date.now();
    }

    const normalizedTime = /^\d{2}:\d{2}$/.test(startsAt || '') ? `${startsAt}:00` : startsAt || '00:00:00';
    const parsed = new Date(`${date}T${normalizedTime}`);
    return Number.isNaN(parsed.getTime()) ? Date.now() : parsed.getTime();
  }
}
