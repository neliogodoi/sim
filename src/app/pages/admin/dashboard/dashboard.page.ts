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
  template: `
    <app-admin-header />
    @let weddings = weddings$ | async;
    @let wedding = activeWedding$ | async;
    @let party = weddingParty$ | async;

    <main class="admin-page dashboard-page">
      <div class="dashboard-topbar">
        <h1>Painel</h1>
        <div class="dashboard-actions">
          <a class="round-icon-action" routerLink="/admin/configuracoes" aria-label="Configuracoes">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2.8v3" />
              <path d="M12 18.2v3" />
              <path d="m4.2 4.2 2.1 2.1" />
              <path d="m17.7 17.7 2.1 2.1" />
              <path d="M2.8 12h3" />
              <path d="M18.2 12h3" />
              <path d="m4.2 19.8 2.1-2.1" />
              <path d="m17.7 6.3 2.1-2.1" />
            </svg>
          </a>
          <button class="round-icon-action" type="button" (click)="toggleCreateWedding()" aria-label="Criar casamento">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </button>
        </div>
      </div>

      @if (isCreateFormOpen) {
        <section class="form-card discreet-create-card">
          <label>
            Nomes do casal
            <input name="newWeddingNames" [(ngModel)]="newWeddingNames" placeholder="Beatriz & Nelio" />
          </label>
          <button class="primary-action" type="button" (click)="createWedding()">Criar</button>
        </section>
      }

      @if (error) {
        <p class="error-state">{{ error }}</p>
      }

      @if (wedding) {
        <section class="dashboard-wedding-card">
          <div class="dashboard-cover">
            @if (wedding.coverImageUrl) {
              <img [src]="imageUrl(wedding.coverImageUrl)" [alt]="wedding.coupleNames" />
            }
          </div>
          <div class="dashboard-wedding-copy">
            <h2>{{ wedding.coupleNames || wedding.slug || wedding.id }}</h2>
            @if (wedding.eventDate) {
              <p>{{ wedding.eventDate }}</p>
            }
            <p>/{{ wedding.slug || wedding.id }}</p>
            <div class="palette-dots dashboard-card-palette" aria-label="Paleta do casamento">
              @for (color of paletteColors(wedding); track $index) {
                <span [style.background]="color"></span>
              }
            </div>
          </div>
        </section>
      }

      @if (party?.length) {
        <section class="dashboard-party-strip" aria-label="Padrinhos">
          <h2>Padrinhos</h2>
          <div class="party-avatar-row">
            @for (member of party?.slice(0, 6); track member.id) {
              @if (member.photoUrl) {
                <img class="person-photo" [src]="imageUrl(member.photoUrl)" [alt]="shortCoupleName(member)" />
              }
            }
          </div>
        </section>
      }

      <section class="dashboard-shortcuts" aria-label="Atalhos administrativos">
        <a class="dashboard-shortcut" routerLink="/admin/configuracoes" aria-label="Configuracoes">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2.8v3" />
            <path d="M12 18.2v3" />
            <path d="m4.2 4.2 2.1 2.1" />
            <path d="m17.7 17.7 2.1 2.1" />
            <path d="M2.8 12h3" />
            <path d="M18.2 12h3" />
            <path d="m4.2 19.8 2.1-2.1" />
            <path d="m17.7 6.3 2.1-2.1" />
          </svg>
          <span>Config.</span>
        </a>
        <a class="dashboard-shortcut" routerLink="/admin/convidados" aria-label="Convidados">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="9" cy="8" r="3" />
            <path d="M3.5 19c.7-3 2.6-5 5.5-5s4.8 2 5.5 5" />
            <path d="M16 11a2.5 2.5 0 1 0-.8-4.9" />
            <path d="M17 14c2 .5 3.2 2 3.7 5" />
          </svg>
          <span>Convidados</span>
        </a>
        <a class="dashboard-shortcut" routerLink="/admin/presentes" aria-label="Presentes">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 10h16v10H4z" />
            <path d="M3 6h18v4H3z" />
            <path d="M12 6v14" />
            <path d="M12 6c-2.8 0-4.2-3-2-3 1.6 0 2 3 2 3Z" />
            <path d="M12 6c2.8 0 4.2-3 2-3-1.6 0-2 3-2 3Z" />
          </svg>
          <span>Presentes</span>
        </a>
        <a class="dashboard-shortcut" routerLink="/admin/agenda" aria-label="Agenda">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="4" y="5" width="16" height="15" rx="2" />
            <path d="M8 3v4" />
            <path d="M16 3v4" />
            <path d="M4 10h16" />
          </svg>
          <span>Agenda</span>
        </a>
        <a class="dashboard-shortcut" routerLink="/admin/padrinhos" aria-label="Padrinhos">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.7A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
          </svg>
          <span>Padrinhos</span>
        </a>
        <a class="dashboard-shortcut" routerLink="/admin/pessoas" aria-label="Pessoas importantes">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="7" r="3" />
            <path d="M5 20c.8-4 3.1-6 7-6s6.2 2 7 6" />
          </svg>
          <span>Pessoas</span>
        </a>
        <a class="dashboard-shortcut" routerLink="/admin/fornecedores" aria-label="Fornecedores">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9h16" />
            <path d="M6 9V5h12v4" />
            <path d="M6 9v10h12V9" />
            <path d="M9 13h6" />
            <path d="M9 16h4" />
          </svg>
          <span>Fornec.</span>
        </a>
        <a class="dashboard-shortcut" routerLink="/admin/mais" aria-label="Mais">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="5" cy="12" r="1.4" />
            <circle cx="12" cy="12" r="1.4" />
            <circle cx="19" cy="12" r="1.4" />
          </svg>
          <span>Mais</span>
        </a>
      </section>

      @if ((weddings?.length || 0) > 1) {
        <section class="list-stack compact-wedding-list">
          <h2>Outros casamentos</h2>
          @for (item of weddings; track item.id) {
            <button class="wedding-select-card" type="button" (click)="selectWedding(item)">
              <span>{{ item.coupleNames || item.slug || item.id }}</span>
              <small>/{{ item.slug || item.id }}</small>
            </button>
          }
        </section>
      }

    </main>
  `,
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

  protected toggleCreateWedding(): void {
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
}
