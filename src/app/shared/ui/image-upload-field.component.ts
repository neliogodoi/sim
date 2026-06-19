import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'app-image-upload-field',
	template: `
		<div class="ds-image-upload">
			<input
				#fileInput
				class="ds-image-upload-input"
				type="file"
				accept="image/*"
				[disabled]="disabled || uploading"
				(change)="fileSelected.emit($event)"
			/>

			@if (imageUrl) {
				<div class="ds-image-upload-preview">
					<img [src]="imageUrl" [alt]="alt" />
					<button class="ds-image-upload-change" type="button" [disabled]="disabled || uploading" (click)="fileInput.click()">
						{{ uploading ? 'Enviando...' : 'Trocar imagem' }}
					</button>
				</div>
			} @else {
				<button class="ds-image-upload-empty" type="button" [disabled]="disabled || uploading" (click)="fileInput.click()">
					<span aria-hidden="true">+</span>
					<strong>{{ uploading ? 'Enviando...' : emptyTitle }}</strong>
					<small>{{ emptyDescription }}</small>
				</button>
			}
		</div>
	`,
	styles: [
		`
			.ds-image-upload {
				display: grid;
				gap: 10px;
			}

			.ds-image-upload-input {
				position: absolute;
				width: 1px;
				height: 1px;
				overflow: hidden;
				clip: rect(0 0 0 0);
				white-space: nowrap;
			}

			.ds-image-upload-empty,
			.ds-image-upload-preview {
				position: relative;
				display: grid;
				place-items: center;
				min-height: 220px;
				overflow: hidden;
				border: 1px dashed color-mix(in srgb, var(--color-primary) 32%, var(--color-border));
				border-radius: 24px;
				background:
					radial-gradient(circle at 50% 0%, rgba(var(--color-primary-rgb), 0.12), transparent 42%),
					color-mix(in srgb, var(--color-surface-strong) 88%, transparent);
				color: var(--color-text);
				cursor: pointer;
				text-align: center;
			}

			.ds-image-upload-empty {
				gap: 6px;
				padding: 24px;
			}

			.ds-image-upload-empty span {
				display: grid;
				place-items: center;
				width: 54px;
				height: 54px;
				border-radius: 50%;
				background: var(--color-primary);
				color: #ffffff;
				font-size: 2rem;
				line-height: 1;
			}

			.ds-image-upload-empty strong {
				font-size: 1rem;
			}

			.ds-image-upload-empty small {
				color: var(--color-muted);
				line-height: 1.35;
			}

			.ds-image-upload-preview img {
				width: 100%;
				height: 100%;
				min-height: 220px;
				object-fit: cover;
			}

			.ds-image-upload-change {
				position: absolute;
				right: 14px;
				bottom: 14px;
				min-height: 40px;
				padding: 0 16px;
				border: 0;
				border-radius: 999px;
				background: color-mix(in srgb, var(--color-surface-strong) 92%, transparent);
				color: var(--color-text);
				box-shadow: 0 12px 26px rgba(var(--color-shadow), 0.14);
				cursor: pointer;
				font-weight: 900;
			}

			.ds-image-upload-empty:disabled,
			.ds-image-upload-change:disabled {
				cursor: not-allowed;
				opacity: 0.5;
			}
		`,
	],
})
export class ImageUploadFieldComponent {
	@Input() imageUrl = '';
	@Input() alt = 'Previa da imagem';
	@Input() emptyTitle = 'Adicionar imagem';
	@Input() emptyDescription = 'Toque para escolher uma foto do dispositivo.';
	@Input() disabled = false;
	@Input() uploading = false;
	@Output() readonly fileSelected = new EventEmitter<Event>();
}
