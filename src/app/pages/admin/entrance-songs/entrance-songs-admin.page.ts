import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom, switchMap } from 'rxjs';

import { EntranceSong } from '../../../core/models/wedding.models';
import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';
import { AdminHeaderComponent } from '../../../layout/admin-header.component';

@Component({
	selector: 'app-entrance-songs-admin-page',
	imports: [AdminHeaderComponent, AsyncPipe, FormsModule],
	templateUrl: './entrance-songs-admin.page.html',

	styleUrl: './entrance-songs-admin.page.css',
})
export class EntranceSongsAdminPage {
	private readonly weddingContextService = inject(WeddingContextService);
	private readonly weddingService = inject(WeddingService);
	private readonly router = inject(Router);

	protected readonly weddingId$ = this.weddingContextService.activeWeddingId$;
	protected readonly songs$ = this.weddingId$.pipe(
		switchMap((weddingId) => this.weddingService.entranceSongs$(weddingId)),
	);
	protected moment = '';
	protected songTitle = '';
	protected url = '';
	protected editingSongId = '';
	protected formExpanded = false;

	async saveSong(): Promise<void> {
		if (this.isDemoMode()) {
			return;
		}

		if (!this.moment.trim() || !this.songTitle.trim()) {
			return;
		}

		const weddingId = await firstValueFrom(this.weddingId$);
		await this.weddingService.saveEntranceSong(
			{
				id: this.editingSongId || undefined,
				weddingId,
				moment: this.moment.trim(),
				songTitle: this.songTitle.trim(),
				url: this.url.trim(),
				sortOrder: Date.now(),
			},
			weddingId,
		);

		this.moment = '';
		this.songTitle = '';
		this.url = '';
		this.editingSongId = '';
		this.formExpanded = false;
	}

	editSong(song: EntranceSong): void {
		if (this.isDemoMode()) {
			return;
		}
		this.formExpanded = true;
		this.editingSongId = song.id;
		this.moment = song.moment;
		this.songTitle = song.songTitle;
		this.url = song.url || '';
	}

	removeSong(songId: string): Promise<void> {
		if (this.isDemoMode()) {
			return Promise.resolve();
		}
		return this.weddingService.deleteEntranceSong(songId, this.weddingContextService.currentAdminWeddingId());
	}

	protected isDemoMode(): boolean {
		return this.router.url.startsWith('/demo') || this.router.url.startsWith('/default/admin');
	}

	protected openForm(): void {
		this.formExpanded = true;
	}

	protected closeForm(): void {
		this.moment = '';
		this.songTitle = '';
		this.url = '';
		this.editingSongId = '';
		this.formExpanded = false;
	}

	protected shouldShowForm(songs?: EntranceSong[] | null): boolean {
		return songs?.length === 0 || this.formExpanded || !!this.editingSongId;
	}
}
