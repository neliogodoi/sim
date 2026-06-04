import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { WeddingService } from '../../../core/services/wedding.service';
import { AdminHeaderComponent } from '../../../layout/admin-header.component';

@Component({
  selector: 'app-schedule-admin-page',
  imports: [AdminHeaderComponent, AsyncPipe, FormsModule],
  template: `
    <app-admin-header />
    @let items = schedule$ | async;

    <main class="admin-page">
      <h1>Agenda</h1>
      <form class="form-card" (ngSubmit)="saveItem()">
        <label>
          Titulo
          <input name="title" [(ngModel)]="title" required />
        </label>
        <label>
          Horario
          <input name="startsAt" [(ngModel)]="startsAt" placeholder="16:00" required />
        </label>
        <label>
          Local
          <input name="locationLabel" [(ngModel)]="locationLabel" />
        </label>
        <label>
          Descricao
          <textarea name="description" [(ngModel)]="description"></textarea>
        </label>
        <button class="primary-action" type="submit">{{ editingItemId ? 'Salvar item' : 'Adicionar item' }}</button>
      </form>

      <div class="list-stack">
        @for (item of items; track item.id) {
          <article class="info-card">
            <h2>{{ item.title }}</h2>
            <p>{{ item.startsAt }} · {{ item.locationLabel || 'Sem local especifico' }}</p>
            <button class="secondary-action" type="button" (click)="editItem(item)">Editar</button>
            <button class="secondary-action" type="button" (click)="removeItem(item.id)">Remover</button>
          </article>
        }
      </div>
    </main>
  `,
})
export class ScheduleAdminPage {
  private readonly weddingService = inject(WeddingService);

  protected readonly schedule$ = this.weddingService.schedule$();
  protected title = '';
  protected startsAt = '';
  protected locationLabel = '';
  protected description = '';
  protected editingItemId = '';

  async saveItem(): Promise<void> {
    if (!this.title.trim() || !this.startsAt.trim()) {
      return;
    }

    await this.weddingService.saveScheduleItem({
      id: this.editingItemId || undefined,
      weddingId: 'default',
      title: this.title.trim(),
      startsAt: this.startsAt.trim(),
      locationLabel: this.locationLabel.trim(),
      description: this.description.trim(),
      sortOrder: Date.now(),
    });

    this.title = '';
    this.startsAt = '';
    this.locationLabel = '';
    this.description = '';
    this.editingItemId = '';
  }

  editItem(item: {
    id: string;
    title: string;
    startsAt: string;
    locationLabel?: string;
    description?: string;
  }): void {
    this.editingItemId = item.id;
    this.title = item.title;
    this.startsAt = item.startsAt;
    this.locationLabel = item.locationLabel || '';
    this.description = item.description || '';
  }

  removeItem(itemId: string): Promise<void> {
    return this.weddingService.deleteScheduleItem(itemId);
  }
}
