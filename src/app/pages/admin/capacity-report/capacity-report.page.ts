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
  templateUrl: './capacity-report.page.html',

  styleUrl: './capacity-report.page.css',
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
