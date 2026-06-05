import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';

import { Wedding } from '../../../core/models/wedding.models';
import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';
import { AdminHeaderComponent } from '../../../layout/admin-header.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [AdminHeaderComponent, AsyncPipe, FormsModule, RouterLink],
  template: `
    <app-admin-header />
    @let weddings = weddings$ | async;

    <main class="admin-page">
      <h1>Painel administrativo</h1>

      <section class="form-card">
        <h2>Casamentos</h2>
        <label>
          Nomes do casal
          <input name="newWeddingNames" [(ngModel)]="newWeddingNames" placeholder="Beatriz & Nelio" />
        </label>
        <button class="primary-action" type="button" (click)="createWedding()">Criar casamento</button>
        @if (error) {
          <p class="error-state">{{ error }}</p>
        }
      </section>

      <div class="list-stack">
        @for (wedding of weddings; track wedding.id) {
          <article class="info-card">
            <h2>{{ wedding.coupleNames || wedding.slug || wedding.id }}</h2>
            <p>/{{ wedding.slug || wedding.id }}</p>
            <button class="secondary-action" type="button" (click)="selectWedding(wedding)">Administrar</button>
          </article>
        } @empty {
          <p>Nenhum casamento criado ainda.</p>
        }
      </div>

      <div class="admin-grid">
        <a class="info-card" routerLink="/admin/configuracoes">Configuracoes do casamento</a>
        <a class="info-card" routerLink="/admin/convidados">Convidados</a>
        <a class="info-card" routerLink="/admin/agenda">Agenda</a>
        <a class="info-card" routerLink="/admin/presentes">Presentes</a>
        <a class="info-card" routerLink="/admin/padrinhos">Padrinhos</a>
        <a class="info-card" routerLink="/admin/musicas">Musicas</a>
        <a class="info-card" routerLink="/admin/recados">Recados</a>
      </div>
    </main>
  `,
})
export class DashboardPage {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly weddingContextService = inject(WeddingContextService);
  private readonly weddingService = inject(WeddingService);

  protected readonly weddings$: Observable<Wedding[]> = of(this.auth.currentUser).pipe(
    switchMap((user) => (user ? this.weddingService.weddingsByOwner$(user.uid) : of([]))),
  );
  protected newWeddingNames = '';
  protected error = '';

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
    await this.router.navigateByUrl('/admin/configuracoes');
  }

  async selectWedding(wedding: Wedding): Promise<void> {
    this.weddingContextService.setActiveWeddingId(wedding.slug || wedding.id);
    await this.router.navigateByUrl('/admin/configuracoes');
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
}
