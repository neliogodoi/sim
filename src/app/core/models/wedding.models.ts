export type RsvpStatus = 'pending' | 'confirmed' | 'declined' | 'maybe';

export interface Wedding {
  id: string;
  slug?: string;
  status?: 'draft' | 'published';
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
  presetId?: string;
  primary: string;
  secondary?: string;
  tertiary?: string;
  neutral?: string;
  primarySoft?: string;
  primaryLight?: string;
  primaryPale?: string;
  contrast?: string;
  contrastSoft?: string;
  contrastRule?: 'analogous' | 'complementary' | 'splitComplementary' | 'triadic' | 'tetradic' | 'square';
  scriptFont?: string;
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

export interface WeddingPartyMember {
  id: string;
  weddingId: string;
  firstName: string;
  secondName: string;
  side: 'bride' | 'groom' | 'couple';
  invitationStatus?: 'accepted' | 'declined';
  respondedAt?: string;
  photoUrl?: string;
  sortOrder: number;
}

export interface EntranceSong {
  id: string;
  weddingId: string;
  moment: string;
  songTitle: string;
  url?: string;
  sortOrder: number;
}

export type ImportantPersonRole =
  | 'parent'
  | 'groomFather'
  | 'groomMother'
  | 'brideFather'
  | 'brideMother'
  | 'page'
  | 'maid'
  | 'family'
  | 'other';

export interface ImportantPerson {
  id: string;
  weddingId: string;
  name: string;
  secondName?: string;
  photoUrl?: string;
  role: ImportantPersonRole;
  secondRole?: ImportantPersonRole | null;
  description?: string;
  invitationStatus?: 'accepted' | 'declined';
  respondedAt?: string;
  sortOrder: number;
}

export interface Vendor {
  id: string;
  weddingId: string;
  name: string;
  category: 'buffet' | 'photography' | 'venue' | 'store' | 'decor' | 'music' | 'other';
  contactName?: string;
  phone?: string;
  url?: string;
  notes?: string;
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
