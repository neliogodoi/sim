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
  template: `
    <app-admin-header />
    @let gifts = gifts$ | async;

    <main class="admin-page">
      <h1>Presentes</h1>
      @if (!isDemoMode() && shouldShowForm(gifts)) {
        <form class="form-card" (ngSubmit)="saveGift()">
          <label>
            Titulo
            <input name="title" [(ngModel)]="title" required />
          </label>
          <label>
            Link
            <input name="url" [(ngModel)]="url" required />
          </label>
          <label>
            Tipo
            <select name="type" [(ngModel)]="type">
              <option value="store">Loja</option>
              <option value="pix">Pix</option>
              <option value="quota">Cota</option>
              <option value="other">Outro</option>
            </select>
          </label>
          <label>
            Descricao
            <textarea name="description" [(ngModel)]="description"></textarea>
          </label>
          <button class="primary-action" type="submit">{{ editingGiftId ? 'Salvar presente' : 'Adicionar presente' }}</button>
          @if (gifts?.length) {
            <button class="secondary-action" type="button" (click)="closeForm()">Cancelar</button>
          }
        </form>
      } @else if (!isDemoMode() && gifts?.length) {
        <button class="primary-action form-toggle-action" type="button" (click)="openForm()">Adicionar presente</button>
      }

      <div class="list-stack">
        @for (gift of gifts; track gift.id) {
          <article class="info-card admin-list-card">
            @if (!isDemoMode()) {
            <div class="card-actions">
              <button class="icon-action" type="button" (click)="editGift(gift)" aria-label="Editar presente">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" />
                  <path d="m14 6 4 4" />
                </svg>
              </button>
              <button class="icon-action" type="button" (click)="removeGift(gift.id)" aria-label="Remover presente">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 7h14" />
                  <path d="M9 7V5h6v2" />
                  <path d="M8 10v8" />
                  <path d="M16 10v8" />
                  <path d="M6.5 7 7 21h10l.5-14" />
                </svg>
              </button>
            </div>
            }
            <h2>{{ gift.title }}</h2>
            <p>{{ gift.description || gift.type }}</p>
            <a class="inline-link" [href]="gift.url" target="_blank" rel="noreferrer">Abrir link</a>
          </article>
        }
      </div>
    </main>
  `,
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
