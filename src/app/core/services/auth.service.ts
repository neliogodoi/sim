import { Injectable, inject } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  User,
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

  async loginWithGoogle(): Promise<void> {
    try {
      await signInWithPopup(this.auth, this.googleProvider);
    } catch (error: unknown) {
      if (this.shouldUseRedirectFallback(error)) {
        await signInWithRedirect(this.auth, this.googleProvider);
        return;
      }

      throw error;
    }
  }

  completeRedirectLogin(): Promise<unknown> {
    return getRedirectResult(this.auth);
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async register(displayName: string, email: string, password: string): Promise<void> {
    const credential = await createUserWithEmailAndPassword(this.auth, email, password);
    const normalizedName = displayName.trim();
    if (normalizedName) {
      await updateProfile(credential.user, { displayName: normalizedName });
    }
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
