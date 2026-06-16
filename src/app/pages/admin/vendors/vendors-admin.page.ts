import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom, switchMap } from 'rxjs';

import { Vendor } from '../../../core/models/wedding.models';
import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';
import { AdminHeaderComponent } from '../../../layout/admin-header.component';

@Component({
  selector: 'app-vendors-admin-page',
  imports: [AdminHeaderComponent, AsyncPipe, FormsModule],
  template: `
    <app-admin-header />
    @let vendors = vendors$ | async;

    <main class="admin-page">
      <h1>Fornecedores</h1>
      @if (shouldShowForm(vendors)) {
        <form class="form-card" (ngSubmit)="saveVendor()">
          <label>
            Nome
            <input name="name" [(ngModel)]="name" required />
          </label>
          <label>
            Categoria
            <select name="category" [(ngModel)]="category">
              <option value="buffet">Buffet</option>
              <option value="photography">Fotografia</option>
              <option value="venue">Espaco</option>
              <option value="store">Loja</option>
              <option value="decor">Decoracao</option>
              <option value="music">Musica</option>
              <option value="other">Outro</option>
            </select>
          </label>
          <label>
            Contato
            <input name="contactName" [(ngModel)]="contactName" />
          </label>
          <label>
            Telefone
            <input name="phone" [(ngModel)]="phone" />
          </label>
          <label>
            Link
            <input name="url" [(ngModel)]="url" />
          </label>
          <label>
            Observacoes
            <textarea name="notes" [(ngModel)]="notes"></textarea>
          </label>
          <button class="primary-action" type="submit" [disabled]="isDemoMode()">{{ editingVendorId ? 'Salvar fornecedor' : 'Adicionar fornecedor' }}</button>
          @if (vendors?.length) {
            <button class="secondary-action" type="button" (click)="closeForm()">Cancelar</button>
          }
        </form>
      } @else if (vendors?.length) {
        <button class="primary-action form-toggle-action" type="button" [disabled]="isDemoMode()" (click)="openForm()">Adicionar fornecedor</button>
      }

      <div class="list-stack">
        @for (vendor of vendors; track vendor.id) {
          <article class="info-card admin-list-card">
            <div class="card-actions" [class.demo-disabled]="isDemoMode()" [attr.aria-disabled]="isDemoMode()">
              <button class="icon-action" type="button" (click)="editVendor(vendor)" aria-label="Editar fornecedor">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" />
                  <path d="m14 6 4 4" />
                </svg>
              </button>
              <button class="icon-action" type="button" (click)="removeVendor(vendor.id)" aria-label="Remover fornecedor">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 7h14" />
                  <path d="M9 7V5h6v2" />
                  <path d="M8 10v8" />
                  <path d="M16 10v8" />
                  <path d="M6.5 7 7 21h10l.5-14" />
                </svg>
              </button>
            </div>
            <h2>{{ vendor.name }}</h2>
            <p>{{ categoryLabel(vendor.category) }}</p>
            @if (vendor.contactName || vendor.phone) {
              <p>{{ vendor.contactName || 'Contato' }}{{ vendor.phone ? ' · ' + vendor.phone : '' }}</p>
            }
            @if (vendor.url) {
              <a class="inline-link" [href]="vendor.url" target="_blank" rel="noreferrer">Abrir link</a>
            }
            @if (vendor.notes) {
              <p>{{ vendor.notes }}</p>
            }
          </article>
        } @empty {
          <p>Nenhum fornecedor cadastrado ainda.</p>
        }
      </div>
    </main>
  `,
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
