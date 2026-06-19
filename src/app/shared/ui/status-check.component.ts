import { Component, Input } from '@angular/core';

@Component({
	selector: 'app-status-check',
	template: `
		<span class="ds-status-check" [attr.aria-label]="label" role="img">
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path d="m5 12 4.2 4.2L19 6.4" />
			</svg>
		</span>
	`,
	styles: [
		`
			.ds-status-check {
				display: inline-grid;
				place-items: center;
				width: 28px;
				height: 28px;
				border: 1px solid color-mix(in srgb, var(--color-success) 42%, var(--color-border));
				border-radius: 50%;
				background: color-mix(in srgb, var(--color-success) 14%, var(--color-surface));
				color: var(--color-success);
				vertical-align: middle;
			}

			.ds-status-check svg {
				width: 17px;
				height: 17px;
				fill: none;
				stroke: currentColor;
				stroke-linecap: round;
				stroke-linejoin: round;
				stroke-width: 2.6;
			}
		`,
	],
})
export class StatusCheckComponent {
	@Input() label = 'Confirmado';
}
