import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'app-floating-add-button',
	template: `
		<button class="ds-floating-add-button" type="button" [disabled]="disabled" [attr.aria-label]="label" (click)="pressed.emit()">
			+
		</button>
	`,
	styles: [
		`
			:host {
				display: contents;
			}

			.ds-floating-add-button {
				position: fixed;
				right: max(18px, env(safe-area-inset-right));
				bottom: calc(86px + env(safe-area-inset-bottom));
				z-index: 30;
				display: grid;
				place-items: center;
				width: 53px;
				height: 53px;
				border: 0;
				border-radius: 50%;
				background: var(--color-primary);
				color: var(--color-primary-contrast);
				box-shadow: 0 10px 18px rgba(var(--color-primary-rgb), 0.18);
				cursor: pointer;
				font-size: 2rem;
				font-weight: 500;
				line-height: 1;
				transition:
					transform 160ms ease,
					box-shadow 160ms ease,
					opacity 160ms ease;
			}

			.ds-floating-add-button:active {
				transform: scale(0.94);
				box-shadow: 0 10px 24px rgba(var(--color-primary-rgb), 0.24);
			}

			.ds-floating-add-button:disabled {
				cursor: not-allowed;
				opacity: 0.45;
			}
		`,
	],
})
export class FloatingAddButtonComponent {
	@Input() label = 'Adicionar';
	@Input() disabled = false;
	@Output() readonly pressed = new EventEmitter<void>();
}
