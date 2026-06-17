import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom, switchMap } from 'rxjs';

import { Guest } from '../../../core/models/wedding.models';
import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';
import { AdminHeaderComponent } from '../../../layout/admin-header.component';

@Component({
  selector: 'app-guests-page',
  imports: [AdminHeaderComponent, AsyncPipe, FormsModule],
  templateUrl: './guests.page.html',

  styleUrl: './guests.page.css',
})
export class GuestsPage {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
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
    if (this.isDemoMode()) {
      return;
    }

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
    if (this.isDemoMode()) {
      return;
    }
    this.formExpanded = true;
    this.editingGuestId = guest.id;
    this.name = guest.name;
    this.phone = guest.phone || '';
    this.groupName = guest.groupName || '';
    this.guestCount = guest.guestCount;
    this.rsvpStatus = guest.rsvpStatus;
  }

  removeGuest(guestId: string): Promise<void> {
    if (this.isDemoMode()) {
      return Promise.resolve();
    }
    return this.weddingService.deleteGuest(guestId, this.weddingContextService.currentAdminWeddingId());
  }

  protected isDemoMode(): boolean {
    return this.router.url.startsWith('/demo') || this.router.url.startsWith('/default/admin');
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
