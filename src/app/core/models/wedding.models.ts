export type RsvpStatus = 'pending' | 'confirmed' | 'declined' | 'maybe';

export interface Wedding {
  id: string;
  coupleNames: string;
  eventDate: string;
  coverImageUrl?: string;
  welcomeMessage?: string;
  sharedAlbumUrl?: string;
  ceremonyAddress?: string;
  ceremonyMapUrl?: string;
  receptionAddress?: string;
  receptionMapUrl?: string;
  theme?: WeddingTheme;
  createdAt?: string;
  updatedAt?: string;
}

export interface WeddingTheme {
  primary: string;
  primaryContrast?: string;
  background?: string;
  surface?: string;
  text?: string;
  muted?: string;
  border?: string;
}

export interface Guest {
  id: string;
  weddingId: string;
  name: string;
  phone?: string;
  groupName?: string;
  guestCount: number;
  rsvpStatus: RsvpStatus;
  rsvpCompanions?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScheduleItem {
  id: string;
  weddingId: string;
  title: string;
  description?: string;
  startsAt: string;
  locationLabel?: string;
  sortOrder: number;
}

export interface GiftLink {
  id: string;
  weddingId: string;
  title: string;
  description?: string;
  url: string;
  type: 'store' | 'pix' | 'quota' | 'other';
  sortOrder: number;
}

export interface GuestMessage {
  id: string;
  weddingId: string;
  guestName: string;
  content: string;
  isVisible: boolean;
  createdAt?: string;
}
