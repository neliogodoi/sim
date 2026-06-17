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
  templateUrl: './messages-admin.page.html',

  styleUrl: './messages-admin.page.css',
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
