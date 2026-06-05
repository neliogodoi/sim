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

import {
  EntranceSong,
  GiftLink,
  Guest,
  GuestMessage,
  ImportantPerson,
  ScheduleItem,
  Vendor,
  Wedding,
  WeddingPartyMember,
} from '../models/wedding.models';

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

  weddingsByOwner$(uid: string): Observable<Wedding[]> {
    return this.col$<Wedding>('weddings', (ref) => query(ref, where('ownerIds', 'array-contains', uid)));
  }

  guests$(weddingId = DEFAULT_WEDDING_ID): Observable<Guest[]> {
    return this.col$<Guest>(`weddings/${weddingId}/guests`);
  }

  guest$(guestId: string, weddingId = DEFAULT_WEDDING_ID): Observable<Guest | undefined> {
    return this.doc$<Guest>(`weddings/${weddingId}/guests/${guestId}`);
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

  weddingParty$(weddingId = DEFAULT_WEDDING_ID): Observable<WeddingPartyMember[]> {
    return this.col$<WeddingPartyMember>(`weddings/${weddingId}/weddingParty`).pipe(
      map((items) => items.sort((first, second) => first.sortOrder - second.sortOrder)),
    );
  }

  weddingPartyMember$(memberId: string, weddingId = DEFAULT_WEDDING_ID): Observable<WeddingPartyMember | undefined> {
    return this.doc$<WeddingPartyMember>(`weddings/${weddingId}/weddingParty/${memberId}`);
  }

  entranceSongs$(weddingId = DEFAULT_WEDDING_ID): Observable<EntranceSong[]> {
    return this.col$<EntranceSong>(`weddings/${weddingId}/entranceSongs`).pipe(
      map((items) => items.sort((first, second) => first.sortOrder - second.sortOrder)),
    );
  }

  importantPeople$(weddingId = DEFAULT_WEDDING_ID): Observable<ImportantPerson[]> {
    return this.col$<ImportantPerson>(`weddings/${weddingId}/importantPeople`).pipe(
      map((items) => items.sort((first, second) => first.sortOrder - second.sortOrder)),
    );
  }

  importantPerson$(personId: string, weddingId = DEFAULT_WEDDING_ID): Observable<ImportantPerson | undefined> {
    return this.doc$<ImportantPerson>(`weddings/${weddingId}/importantPeople/${personId}`);
  }

  vendors$(weddingId = DEFAULT_WEDDING_ID): Observable<Vendor[]> {
    return this.col$<Vendor>(`weddings/${weddingId}/vendors`).pipe(
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

  async createWedding(weddingId: string, ownerUid: string, wedding: Partial<Wedding>): Promise<void> {
    const createdAt = new Date().toISOString();
    await this.setDoc(`weddings/${weddingId}`, {
      ...wedding,
      slug: weddingId,
      ownerIds: [ownerUid],
      status: wedding.status || 'published',
      createdAt,
      updatedAt: createdAt,
    });
    await this.ensureOwner(ownerUid, weddingId);
  }

  saveWedding(wedding: Partial<Wedding>, weddingId = DEFAULT_WEDDING_ID): Promise<void> {
    return this.setDoc(`weddings/${weddingId}`, {
      ...wedding,
      slug: wedding.slug || weddingId,
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

  saveWeddingPartyMember(member: Partial<WeddingPartyMember>, weddingId = DEFAULT_WEDDING_ID): Promise<void> {
    if (member.id) {
      return this.updateDoc(`weddings/${weddingId}/weddingParty/${member.id}`, member);
    }

    return this.addDoc(`weddings/${weddingId}/weddingParty`, member).then();
  }

  deleteWeddingPartyMember(memberId: string, weddingId = DEFAULT_WEDDING_ID): Promise<void> {
    return this.deleteDoc(`weddings/${weddingId}/weddingParty/${memberId}`);
  }

  updateWeddingPartyInvitation(
    memberId: string,
    invitationStatus: 'accepted' | 'declined',
    weddingId = DEFAULT_WEDDING_ID,
  ): Promise<void> {
    return this.updateDoc(`weddings/${weddingId}/weddingParty/${memberId}`, {
      invitationStatus,
      respondedAt: new Date().toISOString(),
    });
  }

  saveEntranceSong(song: Partial<EntranceSong>, weddingId = DEFAULT_WEDDING_ID): Promise<void> {
    if (song.id) {
      return this.updateDoc(`weddings/${weddingId}/entranceSongs/${song.id}`, song);
    }

    return this.addDoc(`weddings/${weddingId}/entranceSongs`, song).then();
  }

  deleteEntranceSong(songId: string, weddingId = DEFAULT_WEDDING_ID): Promise<void> {
    return this.deleteDoc(`weddings/${weddingId}/entranceSongs/${songId}`);
  }

  saveImportantPerson(person: Partial<ImportantPerson>, weddingId = DEFAULT_WEDDING_ID): Promise<void> {
    if (person.id) {
      return this.updateDoc(`weddings/${weddingId}/importantPeople/${person.id}`, person);
    }

    return this.addDoc(`weddings/${weddingId}/importantPeople`, person).then();
  }

  deleteImportantPerson(personId: string, weddingId = DEFAULT_WEDDING_ID): Promise<void> {
    return this.deleteDoc(`weddings/${weddingId}/importantPeople/${personId}`);
  }

  updateImportantPersonInvitation(
    personId: string,
    invitationStatus: 'accepted' | 'declined',
    weddingId = DEFAULT_WEDDING_ID,
  ): Promise<void> {
    return this.updateDoc(`weddings/${weddingId}/importantPeople/${personId}`, {
      invitationStatus,
      respondedAt: new Date().toISOString(),
    });
  }

  saveVendor(vendor: Partial<Vendor>, weddingId = DEFAULT_WEDDING_ID): Promise<void> {
    if (vendor.id) {
      return this.updateDoc(`weddings/${weddingId}/vendors/${vendor.id}`, vendor);
    }

    return this.addDoc(`weddings/${weddingId}/vendors`, vendor).then();
  }

  deleteVendor(vendorId: string, weddingId = DEFAULT_WEDDING_ID): Promise<void> {
    return this.deleteDoc(`weddings/${weddingId}/vendors/${vendorId}`);
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
    const result = await addFirestoreDoc(ref, this.cleanData(data));
    return result.id;
  }

  private async updateDoc(path: string, data: DocumentData): Promise<void> {
    const ref = doc(this.firestore, path);
    await updateFirestoreDoc(ref, this.cleanData(data));
  }

  private async deleteDoc(path: string): Promise<void> {
    const ref = doc(this.firestore, path);
    await deleteFirestoreDoc(ref);
  }

  private cleanData(data: DocumentData): DocumentData {
    return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
  }
}
