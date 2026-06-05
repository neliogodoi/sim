import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom, switchMap } from 'rxjs';

import { ImportantPerson } from '../../../core/models/wedding.models';
import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';
import { AdminHeaderComponent } from '../../../layout/admin-header.component';

@Component({
  selector: 'app-important-people-admin-page',
  imports: [AdminHeaderComponent, AsyncPipe, FormsModule],
  template: `
    <app-admin-header />
    @let people = people$ | async;

    <main class="admin-page">
      <h1>Pessoas importantes</h1>
      @if (shouldShowForm(people)) {
        <form class="form-card" (ngSubmit)="savePerson()">
          <label>
            Nome
            <input name="name" [(ngModel)]="name" required />
          </label>
          <label>
            Papel
            <select name="role" [(ngModel)]="role">
              <option value="parent">Pais</option>
              <option value="page">Pajem</option>
              <option value="maid">Dama</option>
              <option value="family">Familia</option>
              <option value="other">Outro</option>
            </select>
          </label>
          <label>
            Observacao
            <textarea name="description" [(ngModel)]="description"></textarea>
          </label>
          <button class="primary-action" type="submit">{{ editingPersonId ? 'Salvar pessoa' : 'Adicionar pessoa' }}</button>
          @if (people?.length) {
            <button class="secondary-action" type="button" (click)="closeForm()">Cancelar</button>
          }
        </form>
      } @else {
        <button class="primary-action form-toggle-action" type="button" (click)="openForm()">Adicionar pessoa</button>
      }

      <div class="list-stack">
        @for (person of people; track person.id) {
          <article class="info-card admin-list-card">
            <div class="card-actions">
              <button class="icon-action" type="button" (click)="editPerson(person)" aria-label="Editar pessoa">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" />
                  <path d="m14 6 4 4" />
                </svg>
              </button>
              <button class="icon-action" type="button" (click)="removePerson(person.id)" aria-label="Remover pessoa">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 7h14" />
                  <path d="M9 7V5h6v2" />
                  <path d="M8 10v8" />
                  <path d="M16 10v8" />
                  <path d="M6.5 7 7 21h10l.5-14" />
                </svg>
              </button>
            </div>
            <h2>{{ person.name }}</h2>
            <p>{{ roleLabel(person.role) }}</p>
            @if (person.description) {
              <p>{{ person.description }}</p>
            }
          </article>
        } @empty {
          <p>Nenhuma pessoa cadastrada ainda.</p>
        }
      </div>
    </main>
  `,
})
export class ImportantPeopleAdminPage {
  private readonly weddingContextService = inject(WeddingContextService);
  private readonly weddingService = inject(WeddingService);

  protected readonly weddingId$ = this.weddingContextService.activeWeddingId$;
  protected readonly people$ = this.weddingId$.pipe(
    switchMap((weddingId) => this.weddingService.importantPeople$(weddingId)),
  );
  protected name = '';
  protected role: ImportantPerson['role'] = 'parent';
  protected description = '';
  protected editingPersonId = '';
  protected formExpanded = false;

  async savePerson(): Promise<void> {
    if (!this.name.trim()) {
      return;
    }

    const weddingId = await firstValueFrom(this.weddingId$);
    await this.weddingService.saveImportantPerson(
      {
        id: this.editingPersonId || undefined,
        weddingId,
        name: this.name.trim(),
        role: this.role,
        description: this.description.trim(),
        sortOrder: Date.now(),
      },
      weddingId,
    );

    this.closeForm();
  }

  editPerson(person: ImportantPerson): void {
    this.formExpanded = true;
    this.editingPersonId = person.id;
    this.name = person.name;
    this.role = person.role;
    this.description = person.description || '';
  }

  removePerson(personId: string): Promise<void> {
    return this.weddingService.deleteImportantPerson(personId, this.weddingContextService.currentAdminWeddingId());
  }

  protected openForm(): void {
    this.formExpanded = true;
  }

  protected closeForm(): void {
    this.name = '';
    this.role = 'parent';
    this.description = '';
    this.editingPersonId = '';
    this.formExpanded = false;
  }

  protected shouldShowForm(people?: ImportantPerson[] | null): boolean {
    return !people?.length || this.formExpanded || !!this.editingPersonId;
  }

  protected roleLabel(role: ImportantPerson['role']): string {
    return {
      parent: 'Pais',
      page: 'Pajem',
      maid: 'Dama',
      family: 'Familia',
      other: 'Outro',
    }[role];
  }
}
