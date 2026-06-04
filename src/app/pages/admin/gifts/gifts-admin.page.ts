import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
      </form>

      <div class="list-stack">
        @for (gift of gifts; track gift.id) {
          <article class="info-card">
            <h2>{{ gift.title }}</h2>
            <p>{{ gift.url }}</p>
            <button class="secondary-action" type="button" (click)="editGift(gift)">Editar</button>
            <button class="secondary-action" type="button" (click)="removeGift(gift.id)">Remover</button>
          </article>
        }
      </div>
    </main>
  `,
})
export class GiftsAdminPage {
  private readonly weddingService = inject(WeddingService);

  protected readonly gifts$ = this.weddingService.gifts$();
  protected title = '';
  protected url = '';
  protected type: 'store' | 'pix' | 'quota' | 'other' = 'store';
  protected description = '';
  protected editingGiftId = '';

  async saveGift(): Promise<void> {
    if (!this.title.trim() || !this.url.trim()) {
      return;
    }

    await this.weddingService.saveGiftLink({
      id: this.editingGiftId || undefined,
      weddingId: 'default',
      title: this.title.trim(),
      url: this.url.trim(),
      type: this.type,
      description: this.description.trim(),
      sortOrder: Date.now(),
    });

    this.title = '';
    this.url = '';
    this.type = 'store';
    this.description = '';
    this.editingGiftId = '';
  }

  editGift(gift: {
    id: string;
    title: string;
    url: string;
    type: 'store' | 'pix' | 'quota' | 'other';
    description?: string;
  }): void {
    this.editingGiftId = gift.id;
    this.title = gift.title;
    this.url = gift.url;
    this.type = gift.type;
    this.description = gift.description || '';
  }

  removeGift(giftId: string): Promise<void> {
    return this.weddingService.deleteGiftLink(giftId);
  }
}
