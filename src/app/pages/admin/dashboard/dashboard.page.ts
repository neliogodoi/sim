import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AdminHeaderComponent } from '../../../layout/admin-header.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [AdminHeaderComponent, RouterLink],
  template: `
    <app-admin-header />
    <main class="admin-page">
      <h1>Painel administrativo</h1>
      <div class="admin-grid">
        <a class="info-card" routerLink="/admin/configuracoes">Configuracoes do casamento</a>
        <a class="info-card" routerLink="/admin/convidados">Convidados</a>
        <a class="info-card" routerLink="/admin/agenda">Agenda</a>
        <a class="info-card" routerLink="/admin/presentes">Presentes</a>
        <a class="info-card" routerLink="/admin/recados">Recados</a>
      </div>
    </main>
  `,
})
export class DashboardPage {}
