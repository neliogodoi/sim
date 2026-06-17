import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';

import { Wedding, WeddingPartyMember } from '../../../core/models/wedding.models';
import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';
import { toDisplayImageUrl } from '../../../core/utils/image-url';
import { AdminHeaderComponent } from '../../../layout/admin-header.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [AdminHeaderComponent, AsyncPipe, FormsModule, RouterLink],
  templateUrl: './dashboard.page.html',

  styleUrl: './dashboard.page.css',
})
export class DashboardPage {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly weddingContextService = inject(WeddingContextService);
  private readonly weddingService = inject(WeddingService);

  protected readonly weddings$: Observable<Wedding[]> = authState(this.auth).pipe(
    switchMap((user) =>
      user ? this.weddingService.weddingsByOwner$(user.uid, this.weddingContextService.currentAdminWeddingId()) : of([]),
    ),
  );
  protected readonly activeWedding$ = this.weddingContextService.activeWeddingId$.pipe(
    switchMap((weddingId) => this.weddingService.wedding$(weddingId)),
  );
  protected readonly weddingParty$ = this.weddingContextService.activeWeddingId$.pipe(
    switchMap((weddingId) => this.weddingService.weddingParty$(weddingId)),
  );
  protected newWeddingNames = '';
  protected error = '';
  protected isCreateFormOpen = false;

  protected isDemoMode(): boolean {
    return this.router.url.startsWith('/demo') || this.router.url.startsWith('/default/admin');
  }

  protected adminLink(path = ''): string {
    const base = this.isDemoMode() ? '/demo' : '/admin';
    return path ? `${base}/${path}` : base;
  }

  protected toggleCreateWedding(): void {
    if (this.isDemoMode()) {
      return;
    }
    this.isCreateFormOpen = !this.isCreateFormOpen;
    this.error = '';
  }

  async createWedding(): Promise<void> {
    const user = this.auth.currentUser;
    const coupleNames = this.newWeddingNames.trim();
    const weddingId = this.generateWeddingId(coupleNames);

    if (!user) {
      this.error = 'Entre novamente para criar um casamento.';
      return;
    }

    if (!coupleNames) {
      this.error = 'Informe os nomes do casal.';
      return;
    }

    await this.weddingService.createWedding(weddingId, user.uid, {
      coupleNames,
      eventDate: '',
    });
    this.weddingContextService.setActiveWeddingId(weddingId);
    this.newWeddingNames = '';
    this.error = '';
    this.isCreateFormOpen = false;
    await this.router.navigateByUrl('/admin/configuracoes');
  }

  async selectWedding(wedding: Wedding): Promise<void> {
    this.weddingContextService.setActiveWeddingId(wedding.slug || wedding.id);
  }

  protected imageUrl(url?: string): string {
    return toDisplayImageUrl(url);
  }

  protected paletteColors(wedding?: Wedding | null): string[] {
    return [
      wedding?.theme?.primary || '#f2f2f2',
      wedding?.theme?.secondary || '#ffffff',
      wedding?.theme?.tertiary || '#eeeeee',
      wedding?.theme?.neutral || '#ffffff',
    ];
  }

  protected shortCoupleName(member: WeddingPartyMember): string {
    return `${this.firstWord(member.firstName)} & ${this.firstWord(member.secondName)}`;
  }

  private firstWord(value: string): string {
    return value.trim().split(/\s+/)[0] || value;
  }

  private generateWeddingId(coupleNames: string): string {
    const slug =
      coupleNames
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '');

    return `${slug || 'casamento'}-${crypto.randomUUID().slice(0, 8)}`;
  }

  protected async shareWedding(wedding?: Wedding | null): Promise<void> {
    if (!wedding) {
      this.error = 'Selecione um casamento para compartilhar.';
      return;
    }

    const slug = wedding.slug || wedding.id;
    const url = `${window.location.origin}/${slug}`;

    if (navigator.share) {
      await navigator.share({
        title: wedding.coupleNames || 'Nosso casamento',
        text: 'Veja nosso site de casamento',
        url,
      });
      return;
    }

    await navigator.clipboard.writeText(url);
  }
}
