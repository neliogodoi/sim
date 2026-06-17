import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';

import { WeddingPartyMember } from '../../../core/models/wedding.models';
import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';
import { toDisplayImageUrl } from '../../../core/utils/image-url';
import { PublicNavComponent } from '../../../layout/public-nav.component';

@Component({
  selector: 'app-wedding-party-page',
  imports: [AsyncPipe, PublicNavComponent],
  templateUrl: './wedding-party.page.html',

  styleUrl: './wedding-party.page.css',
})
export class WeddingPartyPage {
  private readonly route = inject(ActivatedRoute);
  private readonly weddingContextService = inject(WeddingContextService);
  private readonly weddingService = inject(WeddingService);

  protected readonly weddingId$ = this.weddingContextService.publicWeddingId$(this.route);
  protected readonly members$ = this.weddingId$.pipe(
    switchMap((weddingId) => this.weddingService.weddingParty$(weddingId)),
  );

  protected imageUrl(url?: string): string {
    return toDisplayImageUrl(url);
  }

  protected coupleName(member: WeddingPartyMember): string {
    return `${member.firstName} & ${member.secondName}`;
  }

  protected sideLabel(side: 'bride' | 'groom' | 'couple'): string {
    return {
      bride: 'Noiva',
      groom: 'Noivo',
      couple: 'Casal',
    }[side];
  }
}
