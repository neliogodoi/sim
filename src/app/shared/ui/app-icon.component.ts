import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';

@Component({
	selector: 'app-icon',
	standalone: true,
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	template: `
		<ion-icon
			[name]="name"
			[attr.aria-hidden]="label ? null : 'true'"
			[attr.aria-label]="label || null"
		></ion-icon>
	`,
	styles: [
		`
			:host {
				display: inline-grid;
				place-items: center;
				line-height: 1;
			}

			ion-icon {
				font-size: inherit;
				color: inherit;
				--ionicon-stroke-width: var(--app-icon-stroke, 32px);
			}
		`,
	],
})
export class AppIconComponent {
	@Input({ required: true }) name = '';
	@Input() label = '';
}
