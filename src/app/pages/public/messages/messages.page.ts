import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, map, switchMap } from 'rxjs';

import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { DEFAULT_WEDDING_ID, WeddingService } from '../../../core/services/wedding.service';
import { PublicNavComponent } from '../../../layout/public-nav.component';

@Component({
  selector: 'app-messages-page',
  imports: [AsyncPipe, FormsModule, PublicNavComponent],
  templateUrl: './messages.page.html',

  styleUrl: './messages.page.css',
})
export class MessagesPage {
  private readonly route = inject(ActivatedRoute);
  private readonly weddingContextService = inject(WeddingContextService);
  private readonly weddingService = inject(WeddingService);

  protected readonly weddingId$ = this.weddingContextService.publicWeddingId$(this.route);
  protected readonly messages$ = this.weddingId$.pipe(
    switchMap((weddingId) => this.weddingService.publicMessages$(weddingId)),
  );
  protected readonly isReadOnly$ = this.weddingId$.pipe(map((weddingId) => weddingId === DEFAULT_WEDDING_ID));
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
