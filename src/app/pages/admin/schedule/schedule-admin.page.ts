import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom, switchMap } from 'rxjs';

import { ScheduleItem } from '../../../core/models/wedding.models';
import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';
import { AdminHeaderComponent } from '../../../layout/admin-header.component';
import { FloatingAddButtonComponent } from '../../../shared/ui/floating-add-button.component';

@Component({
  selector: 'app-schedule-admin-page',
  imports: [AdminHeaderComponent, AsyncPipe, FormsModule, FloatingAddButtonComponent],
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
      startsAt: this.startsAt.trim(),
      locationLabel: this.locationLabel.trim(),
      description: this.description.trim(),
      sortOrder: Date.now(),
    }, weddingId);

    this.title = '';
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
    this.startsAt = '';
    this.locationLabel = '';
    this.description = '';
    this.editingItemId = '';
    this.formExpanded = false;
  }

  protected shouldShowForm(items?: ScheduleItem[] | null): boolean {
    return items?.length === 0 || this.formExpanded || !!this.editingItemId;
  }
}
