import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, map, of } from 'rxjs';

import { DEFAULT_WEDDING_ID } from './wedding.service';

const ACTIVE_WEDDING_KEY = 'sim.activeWeddingId';

@Injectable({
  providedIn: 'root',
})
export class WeddingContextService {
  private readonly activeWeddingId = new BehaviorSubject<string>(this.storedWeddingId());

  readonly activeWeddingId$ = this.activeWeddingId.asObservable();

  publicWeddingId$(route: ActivatedRoute): Observable<string> {
    return route.paramMap.pipe(map((params) => params.get('slug') || DEFAULT_WEDDING_ID));
  }

  currentAdminWeddingId(): string {
    return this.activeWeddingId.value;
  }

  setActiveWeddingId(weddingId: string): void {
    const value = this.normalizeWeddingId(weddingId);
    localStorage.setItem(ACTIVE_WEDDING_KEY, value);
    this.activeWeddingId.next(value);
  }

  slugPath(path = ''): string[] {
    const weddingId = this.activeWeddingId.value;
    return ['/', weddingId, path].filter(Boolean);
  }

  private storedWeddingId(): string {
    return this.normalizeWeddingId(localStorage.getItem(ACTIVE_WEDDING_KEY) || DEFAULT_WEDDING_ID);
  }

  private normalizeWeddingId(value: string): string {
    return (
      value
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '') || DEFAULT_WEDDING_ID
    );
  }
}
