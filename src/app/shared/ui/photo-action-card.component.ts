import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'app-photo-action-card',
	template: `
		<article class="ds-photo-card" [class.expanded]="expanded">
			<button class="ds-photo-card-main" type="button" (click)="expandedChange.emit(!expanded)" [attr.aria-expanded]="expanded">
				<span class="ds-photo-card-media">
					@if (imageUrl) {
						<img [src]="imageUrl" [alt]="title" />
					} @else {
						<span class="ds-photo-card-placeholder" aria-hidden="true">{{ initials }}</span>
					}
				</span>
				<span class="ds-photo-card-copy">
					<strong>{{ title }}</strong>
					<span>
						{{ subtitle }}
						<ng-content select="[status]" />
					</span>
				</span>
				<span class="ds-photo-card-more" aria-hidden="true">
					<svg viewBox="0 0 24 24">
						<circle cx="5" cy="12" r="1.4" />
						<circle cx="12" cy="12" r="1.4" />
						<circle cx="19" cy="12" r="1.4" />
					</svg>
				</span>
			</button>

			<div class="ds-photo-card-expanded" [attr.aria-hidden]="!expanded">
				<div class="ds-photo-card-photo">
					@if (imageUrl) {
						<img [src]="imageUrl" [alt]="title" />
					} @else {
						<span class="ds-photo-card-placeholder large" aria-hidden="true">{{ initials }}</span>
					}
					<div class="ds-photo-card-actions">
						<ng-content select="[actions]" />
					</div>
				</div>
				<ng-content />
			</div>
		</article>
	`,
	styles: [
		`
			.ds-photo-card {
				display: grid;
				overflow: hidden;
				border: 1px solid var(--color-border);
				border-radius: 30px;
				background: var(--color-surface);
				box-shadow: 0 18px 38px rgba(var(--color-shadow), 0.07);
			}

			.ds-photo-card-main {
				display: grid;
				grid-template-columns: auto minmax(0, 1fr) auto;
				align-items: center;
				gap: 14px;
				width: 100%;
				padding: 16px;
				border: 0;
				background: transparent;
				color: var(--color-text);
				cursor: pointer;
				text-align: left;
			}

			.ds-photo-card-media,
			.ds-photo-card-placeholder {
				display: grid;
				place-items: center;
				width: 64px;
				height: 64px;
				overflow: hidden;
				border-radius: 30%;
				background: color-mix(in srgb, var(--color-primary) 16%, var(--color-surface));
				color: var(--color-text);
				font-weight: 900;
			}

			.ds-photo-card-media img {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}

			.ds-photo-card-copy {
				display: grid;
				gap: 4px;
				min-width: 0;
			}

			.ds-photo-card-copy strong {
				overflow: hidden;
				color: var(--color-text);
				font-size: 1.05rem;
				font-weight: 900;
				line-height: 1.15;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.ds-photo-card-copy span {
				display: inline-flex;
				align-items: center;
				gap: 8px;
				color: var(--color-muted);
				font-size: 0.95rem;
			}

			.ds-photo-card-more {
				color: var(--color-text);
				margin-right: 0.5rem;
			}

			.ds-photo-card-more svg {
				width: 24px;
				height: 24px;
				fill: currentColor;
			}

			.ds-photo-card-expanded {
				display: grid;
				gap: 12px;
				max-height: 0;
				opacity: 0;
				pointer-events: none;
				transform: translateY(-8px);
				transition:
					max-height 220ms ease,
					opacity 160ms ease,
					transform 180ms ease;
			}

			.ds-photo-card.expanded .ds-photo-card-expanded {
				max-height: 520px;
				padding: 0 16px 16px;
				opacity: 1;
				pointer-events: auto;
				transform: translateY(0);
			}

			.ds-photo-card-photo {
				position: relative;
				display: grid;
				min-height: 260px;
				overflow: hidden;
				border-radius: 18px;
				background: color-mix(in srgb, var(--color-primary) 10%, var(--color-surface));
			}

			.ds-photo-card-photo img {
				width: 100%;
				height: 100%;
				min-height: 260px;
				object-fit: cover;
			}

			.ds-photo-card-placeholder.large {
				width: 100%;
				height: 260px;
				border-radius: 18px;
				font-size: 3rem;
			}

			.ds-photo-card-actions {
				position: absolute;
				top: 12px;
				right: 12px;
				display: flex;
				gap: 8px;
				padding: 8px;
				border-radius: 999px;
				background: color-mix(in srgb, var(--color-surface-strong) 82%, transparent);
				box-shadow: 0 12px 28px rgba(var(--color-shadow), 0.16);
				backdrop-filter: blur(16px);
			}

			.ds-photo-card-actions ::ng-deep .icon-action {
				background: transparent;
			}
		`,
	],
})
export class PhotoActionCardComponent {
	@Input() title = '';
	@Input() subtitle = '';
	@Input() imageUrl = '';
	@Input() initials = '';
	@Input() expanded = false;
	@Output() readonly expandedChange = new EventEmitter<boolean>();
}
