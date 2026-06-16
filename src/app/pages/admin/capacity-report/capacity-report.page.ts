import { AsyncPipe, DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { combineLatest, map, switchMap } from 'rxjs';

import { Guest, ImportantPerson, Vendor, WeddingPartyMember } from '../../../core/models/wedding.models';
import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';
import { AdminHeaderComponent } from '../../../layout/admin-header.component';

interface ReportLine {
  label: string;
  total: number;
  detail: string;
}

interface CapacityReport {
  total: number;
  peopleTotal: number;
  vendorTotal: number;
  confirmedGuests: number;
  pendingGuests: number;
  declinedGuests: number;
  suggestedMinSpace: number;
  suggestedComfortSpace: number;
  lines: ReportLine[];
}

@Component({
  selector: 'app-capacity-report-page',
  imports: [AdminHeaderComponent, AsyncPipe, DecimalPipe],
  template: `
    <app-admin-header />
    @let report = report$ | async;

    <main class="admin-page capacity-report-page">
      <h1>Relatório de pessoas</h1>
      <p class="muted-state">
        Visão geral para estimar espaço, buffet, circulação e estrutura do evento.
      </p>

      @if (report) {
        <section class="capacity-hero-card">
          <span>Total estimado</span>
          <strong>{{ report.total }}</strong>
          <p>pessoas envolvidas no casamento, incluindo convidados, noivos, padrinhos, pessoas especiais e fornecedores cadastrados.</p>
        </section>

        <section class="capacity-metrics">
          <article class="info-card">
            <span>Público do evento</span>
            <strong>{{ report.peopleTotal }}</strong>
            <p>Noivos, padrinhos, pessoas especiais e convidados.</p>
          </article>
          <article class="info-card">
            <span>Fornecedores</span>
            <strong>{{ report.vendorTotal }}</strong>
            <p>Contagem por fornecedor cadastrado. Equipe interna ainda não é detalhada.</p>
          </article>
          <article class="info-card">
            <span>Espaço mínimo</span>
            <strong>{{ report.suggestedMinSpace | number: '1.0-0' }} m²</strong>
            <p>Estimativa base de 1,2 m² por pessoa.</p>
          </article>
          <article class="info-card">
            <span>Espaço confortável</span>
            <strong>{{ report.suggestedComfortSpace | number: '1.0-0' }} m²</strong>
            <p>Estimativa base de 1,8 m² por pessoa.</p>
          </article>
        </section>

        <section class="info-card capacity-status-card">
          <h2>Confirmações de convidados</h2>
          <div>
            <span class="status-pill confirmed">{{ report.confirmedGuests }} confirmados</span>
            <span class="status-pill">{{ report.pendingGuests }} pendentes</span>
            <span class="status-pill">{{ report.declinedGuests }} não irão</span>
          </div>
        </section>

        <section class="list-stack">
          @for (line of report.lines; track line.label) {
            <article class="info-card capacity-line-card">
              <div>
                <h2>{{ line.label }}</h2>
                <p>{{ line.detail }}</p>
              </div>
              <strong>{{ line.total }}</strong>
            </article>
          }
        </section>

        <section class="info-card">
          <h2>Observação</h2>
          <p>
            Este relatório calcula pessoas a partir dos dados cadastrados. Para fornecedores, o sistema ainda conta
            apenas cada fornecedor como uma unidade; se precisar estimar equipe de buffet, fotografia, cerimonial e
            música separadamente, o próximo passo é adicionar quantidade de equipe em fornecedores.
          </p>
        </section>
      } @else {
        <section class="info-card">
          <h2>Carregando relatório</h2>
          <p>Buscando os dados do Firebase.</p>
        </section>
      }
    </main>
  `,
})
export class CapacityReportPage {
  private readonly weddingContextService = inject(WeddingContextService);
  private readonly weddingService = inject(WeddingService);

  protected readonly report$ = this.weddingContextService.activeWeddingId$.pipe(
    switchMap((weddingId) =>
      combineLatest({
        wedding: this.weddingService.wedding$(weddingId),
        guests: this.weddingService.guests$(weddingId),
        weddingParty: this.weddingService.weddingParty$(weddingId),
        importantPeople: this.weddingService.importantPeople$(weddingId),
        vendors: this.weddingService.vendors$(weddingId),
      }),
    ),
    map(({ guests, weddingParty, importantPeople, vendors }) =>
      this.buildReport(guests, weddingParty, importantPeople, vendors),
    ),
  );

  private buildReport(
    guests: Guest[],
    weddingParty: WeddingPartyMember[],
    importantPeople: ImportantPerson[],
    vendors: Vendor[],
  ): CapacityReport {
    const coupleTotal = 2;
    const weddingPartyTotal = weddingParty.reduce((total, member) => total + this.namedPeopleCount(member.firstName, member.secondName), 0);
    const importantPeopleTotal = importantPeople.reduce((total, person) => total + this.namedPeopleCount(person.name, person.secondName), 0);
    const guestsTotal = guests.reduce((total, guest) => total + this.safeCount(guest.guestCount), 0);
    const vendorTotal = vendors.length;
    const peopleTotal = coupleTotal + weddingPartyTotal + importantPeopleTotal + guestsTotal;
    const total = peopleTotal + vendorTotal;

    return {
      total,
      peopleTotal,
      vendorTotal,
      confirmedGuests: this.guestsByStatus(guests, 'confirmed'),
      pendingGuests: this.guestsByStatus(guests, 'pending') + this.guestsByStatus(guests, 'maybe'),
      declinedGuests: this.guestsByStatus(guests, 'declined'),
      suggestedMinSpace: total * 1.2,
      suggestedComfortSpace: total * 1.8,
      lines: [
        { label: 'Noivos', total: coupleTotal, detail: 'Casal principal do evento.' },
        { label: 'Padrinhos', total: weddingPartyTotal, detail: `${weddingParty.length} convite(s) de padrinhos cadastrados.` },
        {
          label: 'Pessoas especiais',
          total: importantPeopleTotal,
          detail: `${importantPeople.length} registro(s), contando segunda pessoa quando preenchida.`,
        },
        { label: 'Convidados', total: guestsTotal, detail: `${guests.length} convite(s), somando acompanhantes informados.` },
        { label: 'Fornecedores diversos', total: vendorTotal, detail: `${vendors.length} fornecedor(es) cadastrados.` },
      ],
    };
  }

  private namedPeopleCount(firstName?: string, secondName?: string): number {
    return (firstName?.trim() ? 1 : 0) + (secondName?.trim() ? 1 : 0);
  }

  private safeCount(value?: number): number {
    return Math.max(1, Number(value) || 1);
  }

  private guestsByStatus(guests: Guest[], status: Guest['rsvpStatus']): number {
    return guests
      .filter((guest) => guest.rsvpStatus === status)
      .reduce((total, guest) => total + this.safeCount(guest.guestCount), 0);
  }
}
