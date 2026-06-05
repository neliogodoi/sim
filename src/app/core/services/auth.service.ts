import { Injectable, inject } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  User,
  UserCredential,
  authState,
  createUserWithEmailAndPassword,
  getRedirectResult,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
} from '@angular/fire/auth';
import { FirebaseError } from 'firebase/app';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly googleProvider = new GoogleAuthProvider();

  readonly user$: Observable<User | null> = authState(this.auth);

  currentUser(): User | null {
    return this.auth.currentUser;
  }

  async loginWithGoogle(): Promise<User | null> {
    try {
      const credential = await signInWithPopup(this.auth, this.googleProvider);
      return credential.user;
    } catch (error: unknown) {
      if (this.shouldUseRedirectFallback(error)) {
        await signInWithRedirect(this.auth, this.googleProvider);
        return null;
      }

      throw error;
    }
  }

  completeRedirectLogin(): Promise<UserCredential | null> {
    return getRedirectResult(this.auth);
  }

  async login(email: string, password: string): Promise<User> {
    const credential = await signInWithEmailAndPassword(this.auth, email, password);
    return credential.user;
  }

  async register(displayName: string, email: string, password: string): Promise<User> {
    const credential = await createUserWithEmailAndPassword(this.auth, email, password);
    const normalizedName = displayName.trim();
    if (normalizedName) {
      await updateProfile(credential.user, { displayName: normalizedName });
    }
    return credential.user;
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }

  isSignedIn$(): Observable<User | null> {
    return this.user$;
  }

  private shouldUseRedirectFallback(error: unknown): boolean {
    return (
      error instanceof FirebaseError &&
      (error.code === 'auth/popup-blocked' ||
        error.code === 'auth/operation-not-supported-in-this-environment')
    );
  }
}
