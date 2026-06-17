import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom, switchMap } from 'rxjs';

import { GiftLink } from '../../../core/models/wedding.models';
import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';
import { AdminHeaderComponent } from '../../../layout/admin-header.component';

@Component({
  selector: 'app-gifts-admin-page',
  imports: [AdminHeaderComponent, AsyncPipe, FormsModule],
  templateUrl: './gifts-admin.page.html',

  styleUrl: './gifts-admin.page.css',
})
export class GiftsAdminPage {
  private readonly weddingContextService = inject(WeddingContextService);
  private readonly weddingService = inject(WeddingService);
  private readonly router = inject(Router);

  protected readonly weddingId$ = this.weddingContextService.activeWeddingId$;
  protected readonly gifts$ = this.weddingId$.pipe(switchMap((weddingId) => this.weddingService.gifts$(weddingId)));
  protected title = '';
  protected url = '';
  protected type: 'store' | 'pix' | 'quota' | 'other' = 'store';
  protected description = '';
  protected editingGiftId = '';
  protected formExpanded = false;

  async saveGift(): Promise<void> {
    if (this.isDemoMode()) {
      return;
    }

    if (!this.title.trim() || !this.url.trim()) {
      return;
    }

    const weddingId = await firstValueFrom(this.weddingId$);
    await this.weddingService.saveGiftLink({
      id: this.editingGiftId || undefined,
      weddingId,
      title: this.title.trim(),
      url: this.url.trim(),
      type: this.type,
      description: this.description.trim(),
      sortOrder: Date.now(),
    }, weddingId);

    this.title = '';
    this.url = '';
    this.type = 'store';
    this.description = '';
    this.editingGiftId = '';
    this.formExpanded = false;
  }

  editGift(gift: GiftLink): void {
    if (this.isDemoMode()) {
      return;
    }
    this.formExpanded = true;
    this.editingGiftId = gift.id;
    this.title = gift.title;
    this.url = gift.url;
    this.type = gift.type;
    this.description = gift.description || '';
  }

  removeGift(giftId: string): Promise<void> {
    if (this.isDemoMode()) {
      return Promise.resolve();
    }
    return this.weddingService.deleteGiftLink(giftId, this.weddingContextService.currentAdminWeddingId());
  }

  protected isDemoMode(): boolean {
    return this.router.url.startsWith('/demo') || this.router.url.startsWith('/default/admin');
  }

  protected openForm(): void {
    this.formExpanded = true;
  }

  protected closeForm(): void {
    this.title = '';
    this.url = '';
    this.type = 'store';
    this.description = '';
    this.editingGiftId = '';
    this.formExpanded = false;
  }

  protected shouldShowForm(gifts?: GiftLink[] | null): boolean {
    return gifts?.length === 0 || this.formExpanded || !!this.editingGiftId;
  }
}
