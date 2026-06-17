import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';

import { PublicNavComponent } from '../../../layout/public-nav.component';
import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';
import { toDisplayImageUrl } from '../../../core/utils/image-url';

@Component({
	selector: 'app-home-page',
	imports: [AsyncPipe, PublicNavComponent],
	templateUrl: './home.page.html',

	styleUrl: './home.page.css',
})
export class HomePage {
	private readonly route = inject(ActivatedRoute);
	private readonly weddingContextService = inject(WeddingContextService);
	private readonly weddingService = inject(WeddingService);

	protected readonly weddingId$ = this.weddingContextService.publicWeddingId$(this.route);
	protected readonly wedding$ = this.weddingId$.pipe(switchMap((weddingId) => this.weddingService.wedding$(weddingId)));

	protected imageUrl(url?: string): string {
		return toDisplayImageUrl(url);
	}

	protected paletteColors(
		wedding?: { theme?: { primary?: string; secondary?: string; tertiary?: string; neutral?: string } } | null,
	): string[] {
		return [
			wedding?.theme?.primary || '#f2f2f2',
			wedding?.theme?.secondary || '#ffffff',
			wedding?.theme?.tertiary || '#eeeeee',
			wedding?.theme?.neutral || '#ffffff',
		];
	}

	protected countdownLabel(eventDate?: string): string {
		if (!eventDate) {
			return 'Faltam alguns dias para o grande momento';
		}

		const target = this.parseDate(eventDate);
		if (!target) {
			return 'Faltam alguns dias para o grande momento';
		}

		const today = new Date();
		today.setHours(0, 0, 0, 0);
		target.setHours(0, 0, 0, 0);

		const days = Math.ceil((target.getTime() - today.getTime()) / 86_400_000);

		if (days === 0) {
			return 'Hoje e o grande dia';
		}

		if (days < 0) {
			return 'Esse momento ja ficou na memoria';
		}

		return days === 1 ? 'Falta 1 dia' : `Faltam ${days} dias`;
	}

	private parseDate(value: string): Date | null {
		if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
			return new Date(`${value}T00:00:00`);
		}

		const parts = value.split('/');
		if (parts.length === 3) {
			const [day, month, year] = parts;
			return new Date(`${year}-${month}-${day}T00:00:00`);
		}

		const date = new Date(value);
		return Number.isNaN(date.getTime()) ? null : date;
	}
}
