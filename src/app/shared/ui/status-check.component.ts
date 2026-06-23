import { Component, Input } from '@angular/core';
import { AppIconComponent } from './app-icon.component';

@Component({
	selector: 'app-status-check',
	imports: [AppIconComponent],
	template: `
		<span class="ds-status-check" [attr.aria-label]="label" role="img">
			<app-icon name="checkmark-outline" />
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

			.ds-status-check app-icon {
				font-size: 17px;
				--app-icon-stroke: 30px;
			}
		`,
	],
})
export class StatusCheckComponent {
	@Input() label = 'Confirmado';
}
