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
				right: max(22px, env(safe-area-inset-right));
				bottom: calc(92px + env(safe-area-inset-bottom));
				z-index: 30;
				display: grid;
				place-items: center;
				width: 62px;
				height: 62px;
				border: 0;
				border-radius: 50%;
				background: var(--color-primary);
				color: #ffffff;
				box-shadow: 0 10px 15px rgba(var(--color-shadow), 0.48);
				cursor: pointer;
				font-size: 2.35rem;
				font-weight: 500;
				line-height: 1;
				transition:
					transform 160ms ease,
					box-shadow 160ms ease,
					opacity 160ms ease;
			}

			.ds-floating-add-button:active {
				transform: scale(0.94);
				box-shadow: 0 10px 24px rgba(var(--color-shadow), 0.24);
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
