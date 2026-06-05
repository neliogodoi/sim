import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, switchMap } from 'rxjs';

import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';
import { PublicNavComponent } from '../../../layout/public-nav.component';

@Component({
  selector: 'app-messages-page',
  imports: [AsyncPipe, FormsModule, PublicNavComponent],
  template: `
    @let messages = messages$ | async;

    <main class="public-page content-page">
      <h1>Recados</h1>
      <form class="form-card" (ngSubmit)="submit()">
        <label>
          Nome
          <input name="guestName" [(ngModel)]="guestName" required />
        </label>
        <label>
          Mensagem
          <textarea name="content" [(ngModel)]="content" required></textarea>
        </label>
        <button class="primary-action" type="submit">Enviar recado</button>
      </form>

      <div class="list-stack">
        @for (message of messages; track message.id) {
          @if (message.isVisible) {
            <article class="info-card">
              <h2>{{ message.guestName }}</h2>
              <p>{{ message.content }}</p>
            </article>
          }
        }
      </div>
    </main>

    <app-public-nav />
  `,
})
export class MessagesPage {
  private readonly route = inject(ActivatedRoute);
  private readonly weddingContextService = inject(WeddingContextService);
  private readonly weddingService = inject(WeddingService);

  protected readonly weddingId$ = this.weddingContextService.publicWeddingId$(this.route);
  protected readonly messages$ = this.weddingId$.pipe(
    switchMap((weddingId) => this.weddingService.publicMessages$(weddingId)),
  );
  protected guestName = '';
  protected content = '';

  async submit(): Promise<void> {
    if (!this.guestName.trim() || !this.content.trim()) {
      return;
    }

    const weddingId = await firstValueFrom(this.weddingId$);
    await this.weddingService.addMessage({
      weddingId,
      guestName: this.guestName.trim(),
      content: this.content.trim(),
      isVisible: true,
    }, weddingId);

    this.guestName = '';
    this.content = '';
  }
}
