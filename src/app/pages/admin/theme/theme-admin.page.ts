import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';

import { DEFAULT_SCRIPT_FONT, SCRIPT_FONT_OPTIONS, normalizeScriptFont } from '../../../core/constants/script-fonts';
import { Wedding } from '../../../core/models/wedding.models';
import { ContrastRule, GeneratedWeddingTheme, ThemeGeneratorService } from '../../../core/services/theme-generator.service';
import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';
import { AdminHeaderComponent } from '../../../layout/admin-header.component';
import { ToastService } from '../../../shared/ui/toast.service';

@Component({
	selector: 'app-theme-admin-page',
	imports: [AdminHeaderComponent, AsyncPipe, FormsModule],
	templateUrl: './theme-admin.page.html',
	styleUrl: './theme-admin.page.css',
})
export class ThemeAdminPage implements OnInit {
	private readonly weddingContextService = inject(WeddingContextService);
	private readonly weddingService = inject(WeddingService);
	private readonly themeGenerator = inject(ThemeGeneratorService);
	private readonly auth = inject(Auth);
	private readonly destroyRef = inject(DestroyRef);
	private readonly toastService = inject(ToastService);
	private hasLoadedWedding = false;
	private currentWeddingTheme?: Wedding['theme'];

	protected readonly weddingId$ = this.weddingContextService.activeWeddingId$;
	protected readonly wedding$ = this.weddingId$.pipe(switchMap((weddingId) => this.weddingService.wedding$(weddingId)));
	protected readonly scriptFontOptions = SCRIPT_FONT_OPTIONS;
	protected scriptFont = DEFAULT_SCRIPT_FONT;
	protected coupleNames = 'Os noivos';
	protected creatorPrimaryColor = '#8A3A4A';
	protected contrastRule: ContrastRule = 'analogous';
	protected isApplyingGeneratedTheme = false;
	protected readonly contrastRules: Array<{ value: ContrastRule; label: string; description: string }> = [
		{ value: 'analogous', label: 'Elegante', description: 'Harmonico, suave e romantico.' },
		{ value: 'complementary', label: 'Marcante', description: 'Mais contraste e presenca visual.' },
		{ value: 'splitComplementary', label: 'Refinado', description: 'Contraste equilibrado sem pesar.' },
		{ value: 'triadic', label: 'Editorial', description: 'Criativo, sofisticado e autoral.' },
		{ value: 'tetradic', label: 'Cerimonial', description: 'Rico em nuances para composicoes classicas.' },
		{ value: 'square', label: 'Moderno', description: 'Mais ousado, ritmado e contemporaneo.' },
	];

	ngOnInit(): void {
		this.wedding$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((wedding) => {
			if (!wedding || this.hasLoadedWedding) {
				return;
			}

			this.applyWedding(wedding);
			this.hasLoadedWedding = true;
		});
	}

	protected generatedTheme(): GeneratedWeddingTheme {
		return this.themeGenerator.generateTheme(this.creatorPrimaryColor, this.contrastRule);
	}

	protected generatedPaletteSwatches(): Array<{ label: string; token: string; color: string }> {
		const theme = this.generatedTheme();
		return [
			{ label: 'Principal', token: 'primary', color: theme.primary },
			{ label: 'Suave', token: 'primarySoft', color: theme.primarySoft },
			{ label: 'Claro', token: 'primaryLight', color: theme.primaryLight },
			{ label: 'Palido', token: 'primaryPale', color: theme.primaryPale },
			{ label: 'Contraste', token: 'contrast', color: theme.contrast },
			{ label: 'Contraste suave', token: 'contrastSoft', color: theme.contrastSoft },
		];
	}

	protected async applyGeneratedTheme(): Promise<void> {
		const uid = this.auth.currentUser?.uid;
		const weddingId = this.weddingContextService.currentAdminWeddingId();
		const generatedTheme = this.generatedTheme();
		this.isApplyingGeneratedTheme = true;

		try {
			if (uid) {
				await this.weddingService.ensureOwner(uid, weddingId);
			}

			await this.weddingService.saveWedding(
				{
					theme: {
						presetId: 'generated',
						...generatedTheme,
						secondary: generatedTheme.contrast,
						tertiary: generatedTheme.primaryPale,
						neutral: generatedTheme.background,
						scriptFont: normalizeScriptFont(this.scriptFont),
					},
				},
				weddingId,
			);

			this.currentWeddingTheme = {
				presetId: 'generated',
				...generatedTheme,
				secondary: generatedTheme.contrast,
				tertiary: generatedTheme.primaryPale,
				neutral: generatedTheme.background,
				scriptFont: normalizeScriptFont(this.scriptFont),
			};
			this.toastService.success('Tema aplicado com sucesso.');
		} catch {
			this.toastService.error('Nao foi possivel aplicar o tema. Tente novamente.');
		} finally {
			this.isApplyingGeneratedTheme = false;
		}
	}

	protected async save(): Promise<void> {
		const uid = this.auth.currentUser?.uid;
		const weddingId = this.weddingContextService.currentAdminWeddingId();
		const generatedTheme = this.generatedTheme();
		if (uid) {
			await this.weddingService.ensureOwner(uid, weddingId);
		}

		await this.weddingService.saveWedding(
			{
				theme: {
					presetId: 'generated',
					...generatedTheme,
					secondary: generatedTheme.contrast,
					tertiary: generatedTheme.primaryPale,
					neutral: generatedTheme.background,
					scriptFont: normalizeScriptFont(this.scriptFont),
				},
			},
			weddingId,
		);
		this.currentWeddingTheme = {
			presetId: 'generated',
			...generatedTheme,
			secondary: generatedTheme.contrast,
			tertiary: generatedTheme.primaryPale,
			neutral: generatedTheme.background,
			scriptFont: normalizeScriptFont(this.scriptFont),
		};
		this.toastService.success('Tema salvo.');
	}

	protected selectedScriptFontCssFamily(): string {
		return this.scriptFontOptions.find((font) => font.value === this.scriptFont)?.cssFamily || this.scriptFontOptions[0].cssFamily;
	}

	private applyWedding(wedding: Wedding): void {
		this.currentWeddingTheme = wedding.theme;
		this.creatorPrimaryColor = wedding.theme?.primary || this.creatorPrimaryColor;
		this.contrastRule = wedding.theme?.contrastRule || this.contrastRule;
		this.scriptFont = normalizeScriptFont(wedding.theme?.scriptFont);
		this.coupleNames = wedding.coupleNames || 'Os noivos';
	}
}
