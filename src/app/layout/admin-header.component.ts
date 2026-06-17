import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
	selector: 'app-admin-header',
	imports: [RouterLink, RouterLinkActive],
	templateUrl: './admin-header.component.html',

	styleUrl: './admin-header.component.css',
})
export class AdminHeaderComponent {
	constructor(private readonly router: Router) {}

	protected isDemoMode(): boolean {
		return this.router.url.startsWith('/demo') || this.router.url.startsWith('/default/admin');
	}

	protected link(path = ''): string {
		const base = this.isDemoMode() ? '/demo' : '/admin';
		return path ? `${base}/${path}` : base;
	}
}
