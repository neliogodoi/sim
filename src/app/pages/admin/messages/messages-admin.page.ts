import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';

import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';
import { AdminHeaderComponent } from '../../../layout/admin-header.component';

@Component({
  selector: 'app-messages-admin-page',
  imports: [AdminHeaderComponent, AsyncPipe],
  template: `
    <app-admin-header />
    @let messages = messages$ | async;

    <main class="admin-page">
      <h1>Recados</h1>
      <div class="list-stack">
        @for (message of messages; track message.id) {
          <article class="info-card admin-list-card">
            @if (!isDemoMode()) {
            <div class="card-actions">
              <button
                class="icon-action"
                type="button"
                (click)="toggleVisibility(message.id, !message.isVisible)"
                [attr.aria-label]="message.isVisible ? 'Ocultar recado' : 'Publicar recado'"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                  <path d="M12 9.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z" />
                </svg>
              </button>
              <button class="icon-action" type="button" (click)="removeMessage(message.id)" aria-label="Remover recado">
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
            <h2>{{ message.guestName }}</h2>
            <p>{{ message.content }}</p>
            <p>{{ message.isVisible ? 'Visivel publicamente' : 'Oculto' }}</p>
          </article>
        } @empty {
          <p>Nenhum recado enviado ainda.</p>
        }
      </div>
    </main>
  `,
})
export class MessagesAdminPage {
  private readonly weddingContextService = inject(WeddingContextService);
  private readonly weddingService = inject(WeddingService);
  private readonly router = inject(Router);

  protected readonly weddingId$ = this.weddingContextService.activeWeddingId$;
  protected readonly messages$ = this.weddingId$.pipe(switchMap((weddingId) => this.weddingService.messages$(weddingId)));

  toggleVisibility(messageId: string, isVisible: boolean): Promise<void> {
    if (this.isDemoMode()) {
      return Promise.resolve();
    }
    return this.weddingService.updateMessage(messageId, { isVisible }, this.weddingContextService.currentAdminWeddingId());
  }

  removeMessage(messageId: string): Promise<void> {
    if (this.isDemoMode()) {
      return Promise.resolve();
    }
    return this.weddingService.deleteMessage(messageId, this.weddingContextService.currentAdminWeddingId());
  }

  protected isDemoMode(): boolean {
    return this.router.url.startsWith('/demo') || this.router.url.startsWith('/default/admin');
  }
}
