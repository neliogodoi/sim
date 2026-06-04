import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-admin-header',
  imports: [RouterLink],
  template: `
    <header class="admin-header">
      <a routerLink="/admin" class="admin-logo">SIM Admin</a>
      <nav aria-label="Administracao">
        <a routerLink="/admin/configuracoes">Configuracoes</a>
        <a routerLink="/admin/convidados">Convidados</a>
        <a routerLink="/admin/agenda">Agenda</a>
        <a routerLink="/admin/presentes">Presentes</a>
        <a routerLink="/admin/recados">Recados</a>
      </nav>
      <button type="button" (click)="logout()">Sair</button>
    </header>
  `,
})
export class AdminHeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  async logout(): Promise<void> {
    await this.authService.logout();
    await this.router.navigateByUrl('/admin/login');
  }
}
