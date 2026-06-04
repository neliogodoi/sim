import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PublicNavComponent } from '../../../layout/public-nav.component';
import { WeddingService } from '../../../core/services/wedding.service';

@Component({
  selector: 'app-rsvp-page',
  imports: [FormsModule, PublicNavComponent],
  template: `
    <main class="public-page content-page">
      <h1>Confirmar presenca</h1>
      <p>Informe seus dados para ajudar os noivos na organizacao.</p>

      <form class="form-card" (ngSubmit)="submit()">
        <label>
          Nome
          <input name="name" [(ngModel)]="name" required />
        </label>
        <label>
          Telefone
          <input name="phone" [(ngModel)]="phone" />
        </label>
        <label>
          Resposta
          <select name="status" [(ngModel)]="status">
            <option value="confirmed">Vou</option>
            <option value="declined">Nao vou</option>
            <option value="maybe">Talvez</option>
          </select>
        </label>
        <label>
          Quantidade de pessoas
          <input type="number" min="1" name="guestCount" [(ngModel)]="guestCount" />
        </label>
        <button class="primary-action" type="submit">Enviar resposta</button>
      </form>

      @if (saved()) {
        <p class="success-state">Resposta enviada. Obrigado!</p>
      }
    </main>

    <app-public-nav />
  `,
})
export class RsvpPage {
  private readonly weddingService = inject(WeddingService);

  protected name = '';
  protected phone = '';
  protected status: 'confirmed' | 'declined' | 'maybe' = 'confirmed';
  protected guestCount = 1;
  protected readonly saved = signal(false);

  async submit(): Promise<void> {
    if (!this.name.trim()) {
      return;
    }

    await this.weddingService.addGuest({
      weddingId: 'default',
      name: this.name.trim(),
      phone: this.phone.trim(),
      groupName: '',
      guestCount: Number(this.guestCount) || 1,
      rsvpStatus: this.status,
      rsvpCompanions: Math.max(0, (Number(this.guestCount) || 1) - 1),
    });
    this.saved.set(true);
  }
}
