import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom, switchMap } from 'rxjs';

import { ScheduleItem } from '../../../core/models/wedding.models';
import { WeddingContextService } from '../../../core/services/wedding-context.service';
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
      @if (shouldShowForm(items)) {
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
          @if (items?.length) {
            <button class="secondary-action" type="button" (click)="closeForm()">Cancelar</button>
          }
        </form>
      } @else {
        <button class="primary-action form-toggle-action" type="button" (click)="openForm()">Adicionar item</button>
      }

      <div class="list-stack">
        @for (item of items; track item.id) {
          <article class="info-card admin-list-card">
            <div class="card-actions">
              <button class="icon-action" type="button" (click)="editItem(item)" aria-label="Editar item">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" />
                  <path d="m14 6 4 4" />
                </svg>
              </button>
              <button class="icon-action" type="button" (click)="removeItem(item.id)" aria-label="Remover item">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 7h14" />
                  <path d="M9 7V5h6v2" />
                  <path d="M8 10v8" />
                  <path d="M16 10v8" />
                  <path d="M6.5 7 7 21h10l.5-14" />
                </svg>
              </button>
            </div>
            <h2>{{ item.title }}</h2>
            <p>{{ item.startsAt }} · {{ item.locationLabel || 'Sem local especifico' }}</p>
          </article>
        }
      </div>
    </main>
  `,
})
export class ScheduleAdminPage {
  private readonly weddingContextService = inject(WeddingContextService);
  private readonly weddingService = inject(WeddingService);

  protected readonly weddingId$ = this.weddingContextService.activeWeddingId$;
  protected readonly schedule$ = this.weddingId$.pipe(switchMap((weddingId) => this.weddingService.schedule$(weddingId)));
  protected title = '';
  protected startsAt = '';
  protected locationLabel = '';
  protected description = '';
  protected editingItemId = '';
  protected formExpanded = false;

  async saveItem(): Promise<void> {
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
    this.formExpanded = true;
    this.editingItemId = item.id;
    this.title = item.title;
    this.startsAt = item.startsAt;
    this.locationLabel = item.locationLabel || '';
    this.description = item.description || '';
  }

  removeItem(itemId: string): Promise<void> {
    return this.weddingService.deleteScheduleItem(itemId, this.weddingContextService.currentAdminWeddingId());
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
    return !items?.length || this.formExpanded || !!this.editingItemId;
  }
}
