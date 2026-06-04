import { Injectable, inject } from '@angular/core';
import {
  CollectionReference,
  DocumentData,
  Firestore,
  Query,
  addDoc as addFirestoreDoc,
  collection,
  collectionData,
  deleteDoc as deleteFirestoreDoc,
  doc,
  docData,
  query,
  setDoc as setFirestoreDoc,
  updateDoc as updateFirestoreDoc,
  where,
} from '@angular/fire/firestore';
import { Observable, catchError, map, of } from 'rxjs';

import { GiftLink, Guest, GuestMessage, ScheduleItem, Wedding } from '../models/wedding.models';

export const DEFAULT_WEDDING_ID = 'default';

type QueryFn<T extends DocumentData = DocumentData> = (ref: CollectionReference<T>) => Query<T>;

@Injectable({
  providedIn: 'root',
})
export class WeddingService {
  private readonly firestore = inject(Firestore);

  wedding$(weddingId = DEFAULT_WEDDING_ID): Observable<Wedding | undefined> {
    return this.doc$<Wedding>(`weddings/${weddingId}`);
  }

  guests$(weddingId = DEFAULT_WEDDING_ID): Observable<Guest[]> {
    return this.col$<Guest>(`weddings/${weddingId}/guests`);
  }

  schedule$(weddingId = DEFAULT_WEDDING_ID): Observable<ScheduleItem[]> {
    return this.col$<ScheduleItem>(`weddings/${weddingId}/scheduleItems`).pipe(
      map((items) => items.sort((first, second) => first.sortOrder - second.sortOrder)),
    );
  }

  gifts$(weddingId = DEFAULT_WEDDING_ID): Observable<GiftLink[]> {
    return this.col$<GiftLink>(`weddings/${weddingId}/giftLinks`).pipe(
      map((items) => items.sort((first, second) => first.sortOrder - second.sortOrder)),
    );
  }

  messages$(weddingId = DEFAULT_WEDDING_ID): Observable<GuestMessage[]> {
    return this.col$<GuestMessage>(`weddings/${weddingId}/messages`);
  }

  publicMessages$(weddingId = DEFAULT_WEDDING_ID): Observable<GuestMessage[]> {
    return this.col$<GuestMessage>(`weddings/${weddingId}/messages`, (ref) =>
      query(ref, where('isVisible', '==', true)),
    );
  }

  async ensureOwner(uid: string, weddingId = DEFAULT_WEDDING_ID): Promise<void> {
    await this.setDoc(`weddings/${weddingId}/owners/${uid}`, {
      uid,
      createdAt: new Date().toISOString(),
    });
  }

  saveWedding(wedding: Partial<Wedding>, weddingId = DEFAULT_WEDDING_ID): Promise<void> {
    return this.setDoc(`weddings/${weddingId}`, {
      ...wedding,
      updatedAt: new Date().toISOString(),
    });
  }

  updateGuest(guestId: string, guest: Partial<Guest>, weddingId = DEFAULT_WEDDING_ID): Promise<void> {
    return this.updateDoc(`weddings/${weddingId}/guests/${guestId}`, {
      ...guest,
      updatedAt: new Date().toISOString(),
    });
  }

  addGuest(guest: Omit<Guest, 'id'>, weddingId = DEFAULT_WEDDING_ID): Promise<string> {
    return this.addDoc(`weddings/${weddingId}/guests`, {
      ...guest,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  deleteGuest(guestId: string, weddingId = DEFAULT_WEDDING_ID): Promise<void> {
    return this.deleteDoc(`weddings/${weddingId}/guests/${guestId}`);
  }

  saveScheduleItem(item: Partial<ScheduleItem>, weddingId = DEFAULT_WEDDING_ID): Promise<void> {
    if (item.id) {
      return this.updateDoc(`weddings/${weddingId}/scheduleItems/${item.id}`, item);
    }

    return this.addDoc(`weddings/${weddingId}/scheduleItems`, item).then();
  }

  deleteScheduleItem(itemId: string, weddingId = DEFAULT_WEDDING_ID): Promise<void> {
    return this.deleteDoc(`weddings/${weddingId}/scheduleItems/${itemId}`);
  }

  saveGiftLink(gift: Partial<GiftLink>, weddingId = DEFAULT_WEDDING_ID): Promise<void> {
    if (gift.id) {
      return this.updateDoc(`weddings/${weddingId}/giftLinks/${gift.id}`, gift);
    }

    return this.addDoc(`weddings/${weddingId}/giftLinks`, gift).then();
  }

  deleteGiftLink(giftId: string, weddingId = DEFAULT_WEDDING_ID): Promise<void> {
    return this.deleteDoc(`weddings/${weddingId}/giftLinks/${giftId}`);
  }

  addMessage(message: Omit<GuestMessage, 'id'>, weddingId = DEFAULT_WEDDING_ID): Promise<string> {
    return this.addDoc(`weddings/${weddingId}/messages`, {
      ...message,
      createdAt: new Date().toISOString(),
    });
  }

  updateMessage(messageId: string, message: Partial<GuestMessage>, weddingId = DEFAULT_WEDDING_ID): Promise<void> {
    return this.updateDoc(`weddings/${weddingId}/messages/${messageId}`, message);
  }

  deleteMessage(messageId: string, weddingId = DEFAULT_WEDDING_ID): Promise<void> {
    return this.deleteDoc(`weddings/${weddingId}/messages/${messageId}`);
  }

  private doc$<T extends DocumentData = DocumentData>(path: string): Observable<T | undefined> {
    const ref = doc(this.firestore, path);
    return (docData(ref, { idField: 'id' }) as Observable<T | undefined>).pipe(
      catchError(() => of(undefined)),
    );
  }

  private col$<T extends DocumentData = DocumentData>(path: string, queryFn?: QueryFn<T>): Observable<T[]> {
    const ref = collection(this.firestore, path) as CollectionReference<T>;
    const target = queryFn ? queryFn(ref) : ref;
    return (collectionData(target, { idField: 'id' }) as Observable<T[]>).pipe(catchError(() => of([])));
  }

  private async setDoc(path: string, data: DocumentData): Promise<void> {
    const ref = doc(this.firestore, path);
    await setFirestoreDoc(ref, data, { merge: true });
  }

  private async addDoc(path: string, data: DocumentData): Promise<string> {
    const ref = collection(this.firestore, path);
    const result = await addFirestoreDoc(ref, data);
    return result.id;
  }

  private async updateDoc(path: string, data: DocumentData): Promise<void> {
    const ref = doc(this.firestore, path);
    await updateFirestoreDoc(ref, data);
  }

  private async deleteDoc(path: string): Promise<void> {
    const ref = doc(this.firestore, path);
    await deleteFirestoreDoc(ref);
  }
}
