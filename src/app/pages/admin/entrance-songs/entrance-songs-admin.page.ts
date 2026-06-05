import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom, switchMap } from 'rxjs';

import { EntranceSong } from '../../../core/models/wedding.models';
import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';
import { AdminHeaderComponent } from '../../../layout/admin-header.component';

@Component({
  selector: 'app-entrance-songs-admin-page',
  imports: [AdminHeaderComponent, AsyncPipe, FormsModule],
  template: `
    <app-admin-header />
    @let songs = songs$ | async;

    <main class="admin-page">
      <h1>Musicas de entrada</h1>
      @if (shouldShowForm(songs)) {
        <form class="form-card" (ngSubmit)="saveSong()">
          <label>
            Momento
            <input name="moment" [(ngModel)]="moment" placeholder="Entrada da noiva" required />
          </label>
          <label>
            Musica
            <input name="songTitle" [(ngModel)]="songTitle" required />
          </label>
          <label>
            Link
            <input name="url" [(ngModel)]="url" />
          </label>
          <button class="primary-action" type="submit">{{ editingSongId ? 'Salvar musica' : 'Adicionar musica' }}</button>
          @if (songs?.length) {
            <button class="secondary-action" type="button" (click)="closeForm()">Cancelar</button>
          }
        </form>
      } @else {
        <button class="primary-action form-toggle-action" type="button" (click)="openForm()">Adicionar musica</button>
      }

      <div class="list-stack">
        @for (song of songs; track song.id) {
          <article class="info-card admin-list-card">
            <div class="card-actions">
              <button class="icon-action" type="button" (click)="editSong(song)" aria-label="Editar musica">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" />
                  <path d="m14 6 4 4" />
                </svg>
              </button>
              <button class="icon-action" type="button" (click)="removeSong(song.id)" aria-label="Remover musica">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 7h14" />
                  <path d="M9 7V5h6v2" />
                  <path d="M8 10v8" />
                  <path d="M16 10v8" />
                  <path d="M6.5 7 7 21h10l.5-14" />
                </svg>
              </button>
            </div>
            <h2>{{ song.moment }}</h2>
            <p>{{ song.songTitle }}</p>
            @if (song.url) {
              <a class="inline-link" [href]="song.url" target="_blank" rel="noreferrer">Abrir link</a>
            }
          </article>
        } @empty {
          <p>Nenhuma musica cadastrada ainda.</p>
        }
      </div>
    </main>
  `,
})
export class EntranceSongsAdminPage {
  private readonly weddingContextService = inject(WeddingContextService);
  private readonly weddingService = inject(WeddingService);

  protected readonly weddingId$ = this.weddingContextService.activeWeddingId$;
  protected readonly songs$ = this.weddingId$.pipe(
    switchMap((weddingId) => this.weddingService.entranceSongs$(weddingId)),
  );
  protected moment = '';
  protected songTitle = '';
  protected url = '';
  protected editingSongId = '';
  protected formExpanded = false;

  async saveSong(): Promise<void> {
    if (!this.moment.trim() || !this.songTitle.trim()) {
      return;
    }

    const weddingId = await firstValueFrom(this.weddingId$);
    await this.weddingService.saveEntranceSong(
      {
        id: this.editingSongId || undefined,
        weddingId,
        moment: this.moment.trim(),
        songTitle: this.songTitle.trim(),
        url: this.url.trim(),
        sortOrder: Date.now(),
      },
      weddingId,
    );

    this.moment = '';
    this.songTitle = '';
    this.url = '';
    this.editingSongId = '';
    this.formExpanded = false;
  }

  editSong(song: EntranceSong): void {
    this.formExpanded = true;
    this.editingSongId = song.id;
    this.moment = song.moment;
    this.songTitle = song.songTitle;
    this.url = song.url || '';
  }

  removeSong(songId: string): Promise<void> {
    return this.weddingService.deleteEntranceSong(songId, this.weddingContextService.currentAdminWeddingId());
  }

  protected openForm(): void {
    this.formExpanded = true;
  }

  protected closeForm(): void {
    this.moment = '';
    this.songTitle = '';
    this.url = '';
    this.editingSongId = '';
    this.formExpanded = false;
  }

  protected shouldShowForm(songs?: EntranceSong[] | null): boolean {
    return !songs?.length || this.formExpanded || !!this.editingSongId;
  }
}
