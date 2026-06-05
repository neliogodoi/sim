import { Injectable, inject } from '@angular/core';
import { User } from '@angular/fire/auth';

import { WeddingContextService } from './wedding-context.service';
import { WeddingService } from './wedding.service';

@Injectable({
  providedIn: 'root',
})
export class AdminWeddingBootstrapService {
  private readonly weddingContextService = inject(WeddingContextService);
  private readonly weddingService = inject(WeddingService);

  async ensureWedding(user: User | null): Promise<string> {
    if (!user) {
      throw new Error('Usuario nao autenticado.');
    }

    const activeWeddingId = this.weddingContextService.currentAdminWeddingId();
    const weddings = await this.weddingService.getWeddingsByOwner(user.uid, activeWeddingId);
    const existingWedding =
      weddings.find((wedding) => wedding.id === activeWeddingId || wedding.slug === activeWeddingId) || weddings[0];

    if (existingWedding) {
      const weddingId = existingWedding.slug || existingWedding.id;
      this.weddingContextService.setActiveWeddingId(weddingId);
      return weddingId;
    }

    const coupleNames = user.displayName?.trim() || 'Novo casamento';
    const weddingId = this.generateWeddingId(coupleNames);

    await this.weddingService.createWedding(weddingId, user.uid, {
      coupleNames,
      eventDate: '',
    });
    this.weddingContextService.setActiveWeddingId(weddingId);

    return weddingId;
  }

  private generateWeddingId(coupleNames: string): string {
    const slug =
      coupleNames
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'casamento';

    return `${slug}-${crypto.randomUUID().slice(0, 8)}`;
  }
}
