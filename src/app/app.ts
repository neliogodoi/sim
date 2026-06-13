import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { Router, RouterOutlet, NavigationCancel, NavigationEnd, NavigationError, NavigationStart } from '@angular/router';
import { take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ThemeService } from './core/services/theme.service';

@Component({
	selector: 'app-root',
	imports: [RouterOutlet],
	templateUrl: './app.html',
	styleUrl: './app.css',
})
export class App implements OnInit {
	private readonly themeService = inject(ThemeService);
	private readonly router = inject(Router);
	private readonly auth = inject(Auth);
	private readonly destroyRef = inject(DestroyRef);

	protected isLoading = this.shouldShowLoading(this.router.url) || this.router.url.startsWith('/admin');
	private routerLoading = this.shouldShowLoading(this.router.url);
	private authReady = false;
	private needsAuthGate = this.router.url.startsWith('/admin');

	ngOnInit(): void {
		this.themeService.initialize();
		this.watchRouter();
		this.watchAuthState();
		this.syncLoadingState();
	}

	private watchRouter(): void {
		this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
			if (event instanceof NavigationStart) {
				this.routerLoading = this.shouldShowLoading(event.url);
			}

			if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
				this.routerLoading = false;
				this.needsAuthGate = event instanceof NavigationEnd && event.urlAfterRedirects.startsWith('/admin');
			}

			this.syncLoadingState();
		});
	}

	private watchAuthState(): void {
		authState(this.auth)
			.pipe(take(1), takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: () => {
					this.authReady = true;
					this.syncLoadingState();
				},
				error: () => {
					this.authReady = true;
					this.syncLoadingState();
				},
			});
	}

	private syncLoadingState(): void {
		this.isLoading = this.routerLoading || (this.needsAuthGate && !this.authReady);
	}

	private shouldShowLoading(url: string): boolean {
		const [path] = url.split('?');
		return path !== '/' && path.length > 0;
	}
}
