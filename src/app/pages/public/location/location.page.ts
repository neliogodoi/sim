import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';

import { Wedding, WeddingLocation } from '../../../core/models/wedding.models';
import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';
import { PublicNavComponent } from '../../../layout/public-nav.component';

@Component({
  selector: 'app-location-page',
  imports: [AsyncPipe, PublicNavComponent],
  templateUrl: './location.page.html',

  styleUrl: './location.page.css',
})
export class LocationPage {
  private readonly route = inject(ActivatedRoute);
  private readonly weddingContextService = inject(WeddingContextService);
  private readonly weddingService = inject(WeddingService);

  protected readonly weddingId$ = this.weddingContextService.publicWeddingId$(this.route);
  protected readonly wedding$ = this.weddingId$.pipe(switchMap((weddingId) => this.weddingService.wedding$(weddingId)));

  protected locations(wedding?: Wedding | null): WeddingLocation[] {
    if (!wedding) {
      return [];
    }

    if (wedding.locations?.length) {
      return [...wedding.locations].sort((first, second) => first.sortOrder - second.sortOrder);
    }

    return [
      {
        id: 'ceremony',
        label: 'Cerimonia',
        address: wedding.ceremonyAddress || 'Endereco ainda nao configurado.',
        mapUrl: wedding.ceremonyMapUrl || '',
        sortOrder: 0,
      },
      {
        id: 'reception',
        label: 'Recepcao',
        address: wedding.receptionAddress || 'Mesmo local da cerimonia ou endereco a confirmar.',
        mapUrl: wedding.receptionMapUrl || '',
        sortOrder: 1,
      },
    ];
  }

  protected googleMapsUrl(location: WeddingLocation): string {
    if (Number.isFinite(Number(location.lat)) && Number.isFinite(Number(location.lng))) {
      return `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
    }

    return location.mapUrl || '';
  }
}
