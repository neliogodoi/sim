import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { combineLatest, filter, map, startWith, switchMap } from 'rxjs';

import { scriptFontCssFamily } from '../constants/script-fonts';
import { WeddingTheme } from '../models/wedding.models';
import { WeddingContextService } from './wedding-context.service';
import { WeddingService } from './wedding.service';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly router = inject(Router);
  private readonly weddingContextService = inject(WeddingContextService);
  private readonly weddingService = inject(WeddingService);

  initialize(): void {
    combineLatest([this.currentUrl$(), this.weddingContextService.activeWeddingId$])
      .pipe(
        map(([url, activeWeddingId]) => this.weddingIdFromUrl(url, activeWeddingId)),
        switchMap((weddingId) => this.weddingService.wedding$(weddingId)),
      )
      .subscribe((wedding) => {
        const root = document.documentElement;
        this.applyPrimaryColor(root, wedding?.theme?.primary || this.defaultPrimaryColor());
        this.applyScriptFont(root, wedding?.theme?.scriptFont);
      });
  }

  applyPrimaryColor(root: HTMLElement, primary: string): void {
    const color = this.hexToRgb(primary) ?? this.hexToRgb('#f2f2f2');
    if (!color) {
      return;
    }

    const text = this.mix(color, { red: 0, green: 0, blue: 0 }, 0.5);
    const muted = this.mix(color, { red: 120, green: 120, blue: 120 }, 0.45);
    const border = this.mix(color, { red: 255, green: 255, blue: 255 }, 0.78);
    const background = this.mix(color, { red: 255, green: 255, blue: 255 }, 0.93);
    const surface = this.mix(color, { red: 255, green: 255, blue: 255 }, 0.97);
    const soft = this.mix(color, { red: 255, green: 255, blue: 255 }, 0.88);
    const contrast = this.relativeLuminance(color) > 0.45 ? '#17200f' : '#fffdf8';

    root.style.setProperty('--color-primary', this.rgbToHex(color));
    root.style.setProperty('--color-primary-rgb', `${color.red}, ${color.green}, ${color.blue}`);
    root.style.setProperty('--color-primary-contrast', contrast);
    root.style.setProperty('--color-background', this.rgbToHex(background));
    root.style.setProperty('--color-background-rgb', `${background.red}, ${background.green}, ${background.blue}`);
    root.style.setProperty('--color-surface', this.rgbToHex(surface));
    root.style.setProperty('--color-surface-strong', '#ffffff');
    root.style.setProperty('--color-text', this.rgbToHex(text));
    root.style.setProperty('--color-muted', this.rgbToHex(muted));
    root.style.setProperty('--color-border', this.rgbToHex(border));
    root.style.setProperty('--color-soft', this.rgbToHex(soft));
    root.style.setProperty('--color-shadow', `${color.red}, ${color.green}, ${color.blue}`);
    root.style.setProperty('--color-qr-dark', this.rgbToHex(text));
    root.style.setProperty('--color-qr-light', this.rgbToHex(surface));
  }

  applyScriptFont(root: HTMLElement, scriptFont?: string): void {
    root.style.setProperty(
      '--font-script',
      `${scriptFontCssFamily(scriptFont)}, 'Brittany Signature', 'Great Vibes', Georgia, 'Times New Roman', serif`,
    );
  }

  private currentUrl$() {
    return this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    );
  }

  private weddingIdFromUrl(url: string, activeWeddingId: string): string {
    const [path] = url.split('?');
    const [firstSegment = ''] = path.split('/').filter(Boolean);

    if (firstSegment === 'admin') {
      return activeWeddingId;
    }

    if (firstSegment === 'demo') {
      return 'default';
    }

    if (!firstSegment || this.publicRouteSegments().has(firstSegment)) {
      return 'default';
    }

    return firstSegment;
  }

  private publicRouteSegments(): Set<string> {
    return new Set([
      'album',
      'confirmar-presenca',
      'convite',
      'convite-especial',
      'convite-padrinhos',
      'local',
      'mais',
      'presentes',
      'recados',
    ]);
  }

  private defaultPrimaryColor(): WeddingTheme['primary'] {
    return '#f2f2f2';
  }

  private hexToRgb(hex: string): Rgb | null {
    const normalized = hex.trim().replace('#', '');
    const value =
      normalized.length === 3
        ? normalized
            .split('')
            .map((part) => `${part}${part}`)
            .join('')
        : normalized;

    if (!/^[0-9a-fA-F]{6}$/.test(value)) {
      return null;
    }

    return {
      red: Number.parseInt(value.slice(0, 2), 16),
      green: Number.parseInt(value.slice(2, 4), 16),
      blue: Number.parseInt(value.slice(4, 6), 16),
    };
  }

  private mix(color: Rgb, target: Rgb, targetWeight: number): Rgb {
    const sourceWeight = 1 - targetWeight;
    return {
      red: Math.round(color.red * sourceWeight + target.red * targetWeight),
      green: Math.round(color.green * sourceWeight + target.green * targetWeight),
      blue: Math.round(color.blue * sourceWeight + target.blue * targetWeight),
    };
  }

  private rgbToHex(color: Rgb): string {
    return `#${[color.red, color.green, color.blue]
      .map((value) => value.toString(16).padStart(2, '0'))
      .join('')}`;
  }

  private relativeLuminance(color: Rgb): number {
    const [red, green, blue] = [color.red, color.green, color.blue].map((value) => {
      const channel = value / 255;
      return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });

    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  }
}

interface Rgb {
  red: number;
  green: number;
  blue: number;
}
