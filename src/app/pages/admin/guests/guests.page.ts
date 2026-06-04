import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
      </form>

      <div class="list-stack">
        @for (guest of guests; track guest.id) {
          <article class="info-card">
            <h2>{{ guest.name }}</h2>
            <p>{{ guest.rsvpStatus }} · {{ guest.guestCount }} pessoa(s)</p>
            <button class="secondary-action" type="button" (click)="editGuest(guest)">Editar</button>
            <button class="secondary-action" type="button" (click)="removeGuest(guest.id)">Remover</button>
          </article>
        } @empty {
          <p>Nenhum convidado cadastrado ainda.</p>
        }
      </div>
    </main>
  `,
})
export class GuestsPage {
  private readonly weddingService = inject(WeddingService);

  protected readonly guests$ = this.weddingService.guests$();
  protected name = '';
  protected phone = '';
  protected groupName = '';
  protected guestCount = 1;
  protected rsvpStatus: 'pending' | 'confirmed' | 'declined' | 'maybe' = 'pending';
  protected editingGuestId = '';

  async addGuest(): Promise<void> {
    if (!this.name.trim()) {
      return;
    }

    const payload = {
      weddingId: 'default',
      name: this.name.trim(),
      phone: this.phone.trim(),
      groupName: this.groupName.trim(),
      guestCount: Number(this.guestCount) || 1,
      rsvpStatus: this.rsvpStatus,
    };

    if (this.editingGuestId) {
      await this.weddingService.updateGuest(this.editingGuestId, payload);
    } else {
      await this.weddingService.addGuest(payload);
    }

    this.name = '';
    this.phone = '';
    this.groupName = '';
    this.guestCount = 1;
    this.rsvpStatus = 'pending';
    this.editingGuestId = '';
  }

  editGuest(guest: {
    id: string;
    name: string;
    phone?: string;
    groupName?: string;
    guestCount: number;
    rsvpStatus: 'pending' | 'confirmed' | 'declined' | 'maybe';
  }): void {
    this.editingGuestId = guest.id;
    this.name = guest.name;
    this.phone = guest.phone || '';
    this.groupName = guest.groupName || '';
    this.guestCount = guest.guestCount;
    this.rsvpStatus = guest.rsvpStatus;
  }

  removeGuest(guestId: string): Promise<void> {
    return this.weddingService.deleteGuest(guestId);
  }
}
