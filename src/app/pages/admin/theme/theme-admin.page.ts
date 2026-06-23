import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';

import { DEFAULT_SCRIPT_FONT, SCRIPT_FONT_OPTIONS, normalizeScriptFont } from '../../../core/constants/script-fonts';
import { Wedding, WeddingTheme } from '../../../core/models/wedding.models';
import {
	GeneratedWeddingTheme,
	ThemeGeneratorService,
	WEDDING_THEME_RECIPES,
	WeddingThemeRecipe,
	WeddingThemeRecipeId,
} from '../../../core/services/theme-generator.service';
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
	protected readonly themeRecipes = WEDDING_THEME_RECIPES;
	protected scriptFont = DEFAULT_SCRIPT_FONT;
	protected coupleNames = 'Os noivos';
	protected creatorPrimaryColor = '#8A3A4A';
	protected recipeId: WeddingThemeRecipeId = 'elegant';
	protected isFontPickerOpen = false;
	protected isRecipePickerOpen = false;
	protected isApplyingGeneratedTheme = false;

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
		return this.themeGenerator.generateTheme(this.creatorPrimaryColor, this.recipeId);
	}

	protected generatedPaletteSwatches(): Array<{ label: string; token: string; color: string }> {
		const theme = this.generatedTheme();
		return [
			{ label: 'Principal', token: 'primary', color: theme.primary },
			{ label: 'Acento', token: 'contrast', color: theme.contrast },
			{ label: 'Fundo', token: 'background', color: theme.background },
			{ label: 'Superficie', token: 'surface', color: theme.surface },
			{ label: 'Texto', token: 'text', color: theme.text },
			{ label: 'Borda', token: 'border', color: theme.border },
		];
	}

	protected selectedRecipe(): WeddingThemeRecipe {
		return this.themeRecipes.find((recipe) => recipe.id === this.recipeId) || this.themeRecipes[0];
	}

	protected selectRecipe(recipeId: WeddingThemeRecipeId): void {
		this.recipeId = recipeId;
		this.isRecipePickerOpen = false;
	}

	protected selectScriptFont(fontValue: string): void {
		this.scriptFont = normalizeScriptFont(fontValue);
		this.isFontPickerOpen = false;
	}

	protected selectedScriptFontLabel(): string {
		return this.scriptFontOptions.find((font) => font.value === this.scriptFont)?.label || this.scriptFontOptions[0].label;
	}

	protected toggleFontPicker(): void {
		this.isFontPickerOpen = !this.isFontPickerOpen;
	}

	protected toggleRecipePicker(): void {
		this.isRecipePickerOpen = !this.isRecipePickerOpen;
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

			await this.persistTheme(generatedTheme, weddingId);
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

		await this.persistTheme(generatedTheme, weddingId);
		this.toastService.success('Tema salvo.');
	}

	private async persistTheme(generatedTheme: GeneratedWeddingTheme, weddingId: string): Promise<void> {
		this.currentWeddingTheme = {
			presetId: 'generated',
			...generatedTheme,
			secondary: generatedTheme.contrast,
			tertiary: generatedTheme.primaryPale,
			neutral: generatedTheme.background,
			scriptFont: normalizeScriptFont(this.scriptFont),
		};

		await this.weddingService.saveWedding(
			{
				theme: this.currentWeddingTheme,
			},
			weddingId,
		);
	}

	protected selectedScriptFontCssFamily(): string {
		return this.scriptFontOptions.find((font) => font.value === this.scriptFont)?.cssFamily || this.scriptFontOptions[0].cssFamily;
	}

	private applyWedding(wedding: Wedding): void {
		this.currentWeddingTheme = wedding.theme;
		this.creatorPrimaryColor = wedding.theme?.primary || this.creatorPrimaryColor;
		this.recipeId = wedding.theme?.recipeId || this.recipeIdFromLegacy(wedding.theme?.contrastRule) || this.recipeId;
		this.scriptFont = normalizeScriptFont(wedding.theme?.scriptFont);
		this.coupleNames = wedding.coupleNames || 'Os noivos';
	}

	private recipeIdFromLegacy(contrastRule?: WeddingTheme['contrastRule']): WeddingThemeRecipeId | undefined {
		const recipeByLegacyRule: Record<string, WeddingThemeRecipeId> = {
			analogous: 'elegant',
			complementary: 'bold',
			splitComplementary: 'romantic',
			triadic: 'editorial',
			tetradic: 'ceremonial',
			square: 'modern',
		};
		return contrastRule ? recipeByLegacyRule[String(contrastRule)] : undefined;
	}
}
