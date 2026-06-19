import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom, switchMap } from 'rxjs';

import { Vendor } from '../../../core/models/wedding.models';
import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';
import { AdminHeaderComponent } from '../../../layout/admin-header.component';
import { FloatingAddButtonComponent } from '../../../shared/ui/floating-add-button.component';

@Component({
  selector: 'app-vendors-admin-page',
  imports: [AdminHeaderComponent, AsyncPipe, FormsModule, FloatingAddButtonComponent],
  templateUrl: './vendors-admin.page.html',

  styleUrl: './vendors-admin.page.css',
})
export class VendorsAdminPage {
  private readonly weddingContextService = inject(WeddingContextService);
  private readonly weddingService = inject(WeddingService);
  private readonly router = inject(Router);

  protected readonly weddingId$ = this.weddingContextService.activeWeddingId$;
  protected readonly vendors$ = this.weddingId$.pipe(switchMap((weddingId) => this.weddingService.vendors$(weddingId)));
  protected name = '';
  protected category: Vendor['category'] = 'buffet';
  protected contactName = '';
  protected phone = '';
  protected url = '';
  protected notes = '';
  protected editingVendorId = '';
  protected formExpanded = false;

  async saveVendor(): Promise<void> {
    if (this.isDemoMode()) {
      return;
    }

    if (!this.name.trim()) {
      return;
    }

    const weddingId = await firstValueFrom(this.weddingId$);
    await this.weddingService.saveVendor(
      {
        id: this.editingVendorId || undefined,
        weddingId,
        name: this.name.trim(),
        category: this.category,
        contactName: this.contactName.trim(),
        phone: this.phone.trim(),
        url: this.url.trim(),
        notes: this.notes.trim(),
        sortOrder: Date.now(),
      },
      weddingId,
    );

    this.closeForm();
  }

  editVendor(vendor: Vendor): void {
    if (this.isDemoMode()) {
      return;
    }
    this.formExpanded = true;
    this.editingVendorId = vendor.id;
    this.name = vendor.name;
    this.category = vendor.category;
    this.contactName = vendor.contactName || '';
    this.phone = vendor.phone || '';
    this.url = vendor.url || '';
    this.notes = vendor.notes || '';
  }

  removeVendor(vendorId: string): Promise<void> {
    if (this.isDemoMode()) {
      return Promise.resolve();
    }
    return this.weddingService.deleteVendor(vendorId, this.weddingContextService.currentAdminWeddingId());
  }

  protected isDemoMode(): boolean {
    return this.router.url.startsWith('/demo') || this.router.url.startsWith('/default/admin');
  }

  protected openForm(): void {
    this.formExpanded = true;
  }

  protected closeForm(): void {
    this.name = '';
    this.category = 'buffet';
    this.contactName = '';
    this.phone = '';
    this.url = '';
    this.notes = '';
    this.editingVendorId = '';
    this.formExpanded = false;
  }

  protected shouldShowForm(vendors?: Vendor[] | null): boolean {
    return vendors?.length === 0 || this.formExpanded || !!this.editingVendorId;
  }

  protected categoryLabel(category: Vendor['category']): string {
    return {
      buffet: 'Buffet',
      photography: 'Fotografia',
      venue: 'Espaco',
      store: 'Loja',
      decor: 'Decoracao',
      music: 'Musica',
      other: 'Outro',
    }[category];
  }
}
