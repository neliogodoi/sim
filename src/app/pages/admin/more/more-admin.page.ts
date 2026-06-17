import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { AdminHeaderComponent } from '../../../layout/admin-header.component';

@Component({
	selector: 'app-more-admin-page',
	imports: [AdminHeaderComponent, RouterLink],
	templateUrl: './more-admin.page.html',

	styleUrl: './more-admin.page.css',
})
export class MoreAdminPage {
	private readonly authService = inject(AuthService);
	private readonly router = inject(Router);

	protected async logout(): Promise<void> {
		if (this.isDemoMode()) {
			return;
		}
		await this.authService.logout();
		await this.router.navigateByUrl('/admin/login');
	}

	protected isDemoMode(): boolean {
		return this.router.url.startsWith('/demo') || this.router.url.startsWith('/default/admin');
	}

	protected adminLink(path: string): string {
		const base = this.isDemoMode() ? '/demo' : '/admin';
		return `${base}/${path}`;
	}
}
