import { Component, inject } from '@angular/core';

import { ToastService } from './toast.service';

@Component({
	selector: 'app-toast-outlet',
	template: `
		<div class="ds-toast-stack" aria-live="polite" aria-atomic="true">
			@for (message of toastService.messages(); track message.id) {
				<button class="ds-toast" type="button" [class]="message.type" (click)="toastService.dismiss(message.id)">
					<span class="ds-toast-icon" aria-hidden="true">
						@if (message.type === 'success') {
							<svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6" /></svg>
						} @else if (message.type === 'error') {
							<svg viewBox="0 0 24 24"><path d="M12 7v6" /><path d="M12 17h.01" /></svg>
						} @else {
							<svg viewBox="0 0 24 24"><path d="M12 8h.01" /><path d="M11 12h1v5h1" /></svg>
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
				border-radius: 18px;
				background: color-mix(in srgb, var(--color-surface-strong) 92%, transparent);
				color: var(--color-text);
				box-shadow: 0 18px 42px rgba(var(--color-shadow), 0.16);
				backdrop-filter: blur(18px);
				cursor: pointer;
				font-weight: 800;
				line-height: 1.25;
				pointer-events: auto;
				text-align: left;
				animation: toast-in 180ms ease both;
			}

			.ds-toast.success {
				border-color: color-mix(in srgb, var(--color-success) 32%, var(--color-border));
			}

			.ds-toast.error {
				border-color: color-mix(in srgb, var(--color-danger) 34%, var(--color-border));
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

			.ds-toast svg {
				width: 18px;
				height: 18px;
				fill: none;
				stroke: currentColor;
				stroke-linecap: round;
				stroke-linejoin: round;
				stroke-width: 2.4;
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
