import { Component, inject } from '@angular/core';

import { AppIconComponent } from './app-icon.component';
import { ToastService } from './toast.service';

@Component({
	selector: 'app-toast-outlet',
	imports: [AppIconComponent],
	template: `
		<div class="ds-toast-stack" aria-live="polite" aria-atomic="true">
			@for (message of toastService.messages(); track message.id) {
				<button class="ds-toast" type="button" [class]="message.type" (click)="toastService.dismiss(message.id)">
					<span class="ds-toast-icon" aria-hidden="true">
						@if (message.type === 'success') {
							<app-icon name="checkmark-outline" />
						} @else if (message.type === 'error') {
							<app-icon name="alert-outline" />
						} @else {
							<app-icon name="information-outline" />
						}
					</span>
					<span>{{ message.text }}</span>
				</button>
			}
		</div>
	`,
	styles: [
		`
			.ds-toast-stack {
				position: fixed;
				top: calc(18px + env(safe-area-inset-top));
				left: 50%;
				z-index: 100;
				display: grid;
				width: min(92vw, 520px);
				gap: 10px;
				pointer-events: none;
				transform: translateX(-50%);
			}

			.ds-toast {
				display: grid;
				grid-template-columns: auto minmax(0, 1fr);
				align-items: center;
				gap: 10px;
				width: 100%;
				min-height: 52px;
				padding: 12px 14px;
				border: 1px solid color-mix(in srgb, var(--color-primary) 18%, var(--color-border));
				border-radius: 36px;
				background: color-mix(in srgb, var(--color-surface-strong) 88%, transparent);
				color: var(--color-text);
				box-shadow: 0 18px 42px rgba(var(--color-shadow), 0.18);
				backdrop-filter: blur(18px);
				cursor: pointer;
				font-weight: 800;
				line-height: 1.25;
				pointer-events: auto;
				text-align: left;
				animation: toast-in 180ms ease both;
			}

			.ds-toast.success {
				border-color: color-mix(in srgb, var(--color-success) 50%, var(--color-border));
				background: color-mix(in srgb, var(--color-success) 10%, var(--color-surface-strong));
			}

			.ds-toast.error {
				border-color: color-mix(in srgb, var(--color-danger) 50%, var(--color-border));
				background: color-mix(in srgb, var(--color-danger) 8%, var(--color-surface-strong));
			}

			.ds-toast-icon {
				display: grid;
				place-items: center;
				width: 30px;
				height: 30px;
				border-radius: 50%;
				background: color-mix(in srgb, var(--color-primary) 12%, var(--color-surface));
				color: var(--color-text);
			}

			.ds-toast.success .ds-toast-icon {
				background: color-mix(in srgb, var(--color-success) 16%, var(--color-surface));
				color: var(--color-success);
			}

			.ds-toast.error .ds-toast-icon {
				background: color-mix(in srgb, var(--color-danger) 12%, var(--color-surface));
				color: var(--color-danger);
			}

			.ds-toast app-icon {
				font-size: 18px;
				--app-icon-stroke: 28px;
			}

			@keyframes toast-in {
				from {
					opacity: 0;
					transform: translateY(-8px) scale(0.98);
				}
			}
		`,
	],
})
export class ToastOutletComponent {
	protected readonly toastService = inject(ToastService);
}
