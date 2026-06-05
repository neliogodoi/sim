import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { AdminHeaderComponent } from '../../../layout/admin-header.component';

@Component({
  selector: 'app-more-admin-page',
  imports: [AdminHeaderComponent, RouterLink],
  template: `
    <app-admin-header />

    <main class="admin-page">
      <h1>Mais</h1>
      <div class="list-stack">
        <a class="info-card link-card" routerLink="/admin/agenda">
          <h2>Agenda</h2>
          <p>Organizacao interna da programacao.</p>
        </a>
        <a class="info-card link-card" routerLink="/admin/padrinhos">
          <h2>Padrinhos</h2>
          <p>Casais e fotos dos padrinhos.</p>
        </a>
        <a class="info-card link-card" [href]="groomsmenInviteUrl()" target="_blank" rel="noreferrer">
          <h2>Convite dos padrinhos</h2>
          <p>Pagina especial para imprimir ou gerar PDF.</p>
        </a>
        <a class="info-card link-card" routerLink="/admin/pessoas">
          <h2>Pessoas importantes</h2>
          <p>Pais, pajens, damas e familiares.</p>
        </a>
        <a class="info-card link-card" routerLink="/admin/musicas">
          <h2>Musicas</h2>
          <p>Entradas e links das musicas.</p>
        </a>
        <a class="info-card link-card" routerLink="/admin/fornecedores">
          <h2>Fornecedores</h2>
          <p>Buffet, fotografia, espaco, lojas e contatos.</p>
        </a>
        <a class="info-card link-card" routerLink="/admin/recados">
          <h2>Recados</h2>
          <p>Moderar mensagens dos convidados.</p>
        </a>
        <button class="secondary-action" type="button" (click)="logout()">Sair</button>
      </div>
    </main>
  `,
})
export class MoreAdminPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly weddingContextService = inject(WeddingContextService);

  protected async logout(): Promise<void> {
    await this.authService.logout();
    await this.router.navigateByUrl('/admin/login');
  }

  protected groomsmenInviteUrl(): string {
    return `/${this.weddingContextService.currentAdminWeddingId()}/convite-padrinhos`;
  }
}
