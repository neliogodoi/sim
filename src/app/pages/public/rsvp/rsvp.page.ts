import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, map, of, switchMap } from 'rxjs';

import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { DEFAULT_WEDDING_ID, WeddingService } from '../../../core/services/wedding.service';

@Component({
  selector: 'app-rsvp-page',
  imports: [AsyncPipe, FormsModule],
  templateUrl: './rsvp.page.html',

  styleUrl: './rsvp.page.css',
})
export class RsvpPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly weddingContextService = inject(WeddingContextService);
  private readonly weddingService = inject(WeddingService);
  private readonly weddingId$ = this.weddingContextService.publicWeddingId$(this.route);
  protected readonly wedding$ = this.weddingId$.pipe(switchMap((weddingId) => this.weddingService.wedding$(weddingId)));
  protected readonly isReadOnly$ = this.weddingId$.pipe(map((weddingId) => weddingId === DEFAULT_WEDDING_ID));
  protected readonly guest$ = this.route.paramMap.pipe(
    switchMap((params) => {
      const guestId = params.get('guestId');
      if (!guestId) {
        return of(undefined);
      }

      return this.weddingId$.pipe(switchMap((weddingId) => this.weddingService.guest$(guestId, weddingId)));
    }),
  );

  protected name = '';
  protected phone = '';
  protected status: 'confirmed' | 'declined' | 'maybe' = 'confirmed';
  protected guestCount = 1;
  protected guestCountChanged = false;
  protected readonly saved = signal(false);

  ngOnInit(): void {
    this.guest$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((guest) => {
      if (!guest || this.guestCountChanged) {
        return;
      }

      this.name = guest.name;
      this.phone = guest.phone || '';
      this.guestCount = guest.guestCount || 1;
    });
  }

  async submit(status: 'confirmed' | 'declined' | 'maybe'): Promise<void> {
    const guest = await firstValueFrom(this.guest$);
    const name = this.name.trim() || guest?.name || '';
    const phone = this.phone.trim() || guest?.phone || '';
    const guestCount = this.guestCountChanged ? Number(this.guestCount) || 1 : guest?.guestCount || Number(this.guestCount) || 1;

    if (!name) {
      return;
    }

    const weddingId = await firstValueFrom(this.weddingId$);
    const guestId = this.route.snapshot.paramMap.get('guestId');
    const payload = {
      weddingId,
      name,
      phone,
      groupName: guest?.groupName || '',
      guestCount,
      rsvpStatus: status,
      rsvpCompanions: Math.max(0, guestCount - 1),
    };

    if (guestId) {
      await this.weddingService.updateGuest(guestId, payload, weddingId);
    } else {
      await this.weddingService.addGuest(payload, weddingId);
    }
    this.saved.set(true);
  }

  protected print(): void {
    window.print();
  }
}
