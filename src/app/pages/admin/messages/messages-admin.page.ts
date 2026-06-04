import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';

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
          <article class="info-card">
            <h2>{{ message.guestName }}</h2>
            <p>{{ message.content }}</p>
            <p>{{ message.isVisible ? 'Visivel publicamente' : 'Oculto' }}</p>
            <button class="secondary-action" type="button" (click)="toggleVisibility(message.id, !message.isVisible)">
              {{ message.isVisible ? 'Ocultar' : 'Publicar' }}
            </button>
            <button class="secondary-action" type="button" (click)="removeMessage(message.id)">Remover</button>
          </article>
        } @empty {
          <p>Nenhum recado enviado ainda.</p>
        }
      </div>
    </main>
  `,
})
export class MessagesAdminPage {
  private readonly weddingService = inject(WeddingService);

  protected readonly messages$ = this.weddingService.messages$();

  toggleVisibility(messageId: string, isVisible: boolean): Promise<void> {
    return this.weddingService.updateMessage(messageId, { isVisible });
  }

  removeMessage(messageId: string): Promise<void> {
    return this.weddingService.deleteMessage(messageId);
  }
}
