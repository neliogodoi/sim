import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { PublicNavComponent } from '../../../layout/public-nav.component';

@Component({
  selector: 'app-more-page',
  imports: [PublicNavComponent, RouterLink],
  template: `
    <main class="public-page content-page">
      <h1>Mais</h1>
      <div class="list-stack">
        <a class="info-card link-card" [routerLink]="link('presentes')">
          <h2>Presentes</h2>
          <p>Lista de presentes dos noivos.</p>
        </a>
        <a class="info-card link-card" [routerLink]="link('padrinhos')">
          <h2>Padrinhos</h2>
          <p>Pessoas escolhidas para estar perto nesse momento.</p>
        </a>
        <a class="info-card link-card" [routerLink]="link('musicas')">
          <h2>Musicas</h2>
          <p>Trilha das entradas da cerimonia.</p>
        </a>
        <a class="info-card link-card" [routerLink]="link('agenda')">
          <h2>Agenda</h2>
          <p>Programacao do evento.</p>
        </a>
        <a class="info-card link-card" [routerLink]="link('recados')">
          <h2>Recados</h2>
          <p>Mensagens dos convidados.</p>
        </a>
      </div>
    </main>

    <app-public-nav />
  `,
})
export class MorePage {
  private readonly route = inject(ActivatedRoute);

  protected link(path: string): string[] {
    const slug = this.route.snapshot.paramMap.get('slug');
    return slug ? ['/', slug, path] : ['/', path];
  }
}
