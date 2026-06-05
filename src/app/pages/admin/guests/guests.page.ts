import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { firstValueFrom, switchMap } from 'rxjs';

import { Guest } from '../../../core/models/wedding.models';
import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';
import { AdminHeaderComponent } from '../../../layout/admin-header.component';

@Component({
  selector: 'app-guests-page',
  imports: [AdminHeaderComponent, AsyncPipe, FormsModule],
  template: `
    <app-admin-header />
    @let guests = guests$ | async;

    <main class="admin-page">
      <h1>Convidados</h1>
      <section class="summary-card">
        <span>Total de convidados</span>
        <strong>{{ totalGuests(guests) }}</strong>
        <span>Confirmados</span>
        <strong>{{ confirmedGuests(guests) }}</strong>
      </section>

      @if (shouldShowForm(guests)) {
        <form class="form-card" (ngSubmit)="addGuest()">
          <label>
            Nome
            <input name="name" [(ngModel)]="name" required />
          </label>
          <label>
            Telefone
            <input name="phone" [(ngModel)]="phone" />
          </label>
          <label>
            Grupo ou familia
            <input name="groupName" [(ngModel)]="groupName" />
          </label>
          <label>
            Quantidade
            <input type="number" min="1" name="guestCount" [(ngModel)]="guestCount" />
          </label>
          <label>
            Status
            <select name="rsvpStatus" [(ngModel)]="rsvpStatus">
              <option value="pending">Pendente</option>
              <option value="confirmed">Confirmado</option>
              <option value="declined">Nao vai</option>
              <option value="maybe">Talvez</option>
            </select>
          </label>
          <button class="primary-action" type="submit">{{ editingGuestId ? 'Salvar convidado' : 'Adicionar convidado' }}</button>
          @if (guests?.length) {
            <button class="secondary-action" type="button" (click)="closeForm()">Cancelar</button>
          }
        </form>
      } @else if (guests?.length) {
        <button class="primary-action form-toggle-action" type="button" (click)="openForm()">Adicionar convidado</button>
      }

      <div class="list-stack">
        @for (guest of guests; track guest.id) {
          <article class="info-card admin-list-card">
            <div class="card-actions">
              <a class="icon-action" [href]="whatsappInviteLink(guest)" target="_blank" rel="noreferrer" aria-label="Enviar convite do convidado">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 6h16v12H4z" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
              </a>
              <button class="icon-action" type="button" (click)="editGuest(guest)" aria-label="Editar convidado">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" />
                  <path d="m14 6 4 4" />
                </svg>
              </button>
              <button class="icon-action" type="button" (click)="removeGuest(guest.id)" aria-label="Remover convidado">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 7h14" />
                  <path d="M9 7V5h6v2" />
                  <path d="M8 10v8" />
                  <path d="M16 10v8" />
                  <path d="M6.5 7 7 21h10l.5-14" />
                </svg>
              </button>
            </div>
            <h2>{{ guest.name }}</h2>
            <p>
              <span class="status-pill" [class.confirmed]="guest.rsvpStatus === 'confirmed'">
                {{ rsvpLabel(guest.rsvpStatus) }}
              </span>
              · {{ guest.guestCount }} pessoa(s)
            </p>
          </article>
        } @empty {
          <p>Nenhum convidado cadastrado ainda.</p>
        }
      </div>
    </main>
  `,
})
export class GuestsPage {
  private readonly auth = inject(Auth);
  private readonly weddingContextService = inject(WeddingContextService);
  private readonly weddingService = inject(WeddingService);

  protected readonly weddingId$ = this.weddingContextService.activeWeddingId$;
  protected readonly guests$ = this.weddingId$.pipe(switchMap((weddingId) => this.weddingService.guests$(weddingId)));
  protected name = '';
  protected phone = '';
  protected groupName = '';
  protected guestCount = 1;
  protected rsvpStatus: 'pending' | 'confirmed' | 'declined' | 'maybe' = 'pending';
  protected editingGuestId = '';
  protected formExpanded = false;

  async addGuest(): Promise<void> {
    if (!this.name.trim()) {
      return;
    }

    const weddingId = await firstValueFrom(this.weddingId$);
    const user = await firstValueFrom(authState(this.auth));
    if (user) {
      await this.weddingService.ensureOwner(user.uid, weddingId);
    }

    const payload = {
      weddingId,
      name: this.name.trim(),
      phone: this.phone.trim(),
      groupName: this.groupName.trim(),
      guestCount: Number(this.guestCount) || 1,
      rsvpStatus: this.rsvpStatus,
    };

    if (this.editingGuestId) {
      await this.weddingService.updateGuest(this.editingGuestId, payload, weddingId);
    } else {
      await this.weddingService.addGuest(payload, weddingId);
    }

    this.name = '';
    this.phone = '';
    this.groupName = '';
    this.guestCount = 1;
    this.rsvpStatus = 'pending';
    this.editingGuestId = '';
    this.formExpanded = false;
  }

  editGuest(guest: Guest): void {
    this.formExpanded = true;
    this.editingGuestId = guest.id;
    this.name = guest.name;
    this.phone = guest.phone || '';
    this.groupName = guest.groupName || '';
    this.guestCount = guest.guestCount;
    this.rsvpStatus = guest.rsvpStatus;
  }

  removeGuest(guestId: string): Promise<void> {
    return this.weddingService.deleteGuest(guestId, this.weddingContextService.currentAdminWeddingId());
  }

  protected openForm(): void {
    this.formExpanded = true;
  }

  protected closeForm(): void {
    this.name = '';
    this.phone = '';
    this.groupName = '';
    this.guestCount = 1;
    this.rsvpStatus = 'pending';
    this.editingGuestId = '';
    this.formExpanded = false;
  }

  protected shouldShowForm(guests?: Guest[] | null): boolean {
    return guests?.length === 0 || this.formExpanded || !!this.editingGuestId;
  }

  protected totalGuests(guests?: Guest[] | null): number {
    return (guests || []).reduce((total, guest) => total + (Number(guest.guestCount) || 1), 0);
  }

  protected confirmedGuests(guests?: Guest[] | null): number {
    return (guests || [])
      .filter((guest) => guest.rsvpStatus === 'confirmed')
      .reduce((total, guest) => total + (Number(guest.guestCount) || 1), 0);
  }

  protected rsvpLabel(status: Guest['rsvpStatus']): string {
    return {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      declined: 'Nao vai',
      maybe: 'Talvez',
    }[status];
  }

  protected whatsappInviteLink(guest: Guest): string {
    const invitationUrl = `${window.location.origin}/${this.weddingContextService.currentAdminWeddingId()}/convite/${guest.id}`;
    const text = `Ola, ${guest.name}! Segue seu convite para confirmar presenca: ${invitationUrl}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }
}
