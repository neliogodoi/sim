import { AsyncPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, filter, firstValueFrom, from, map, of, shareReplay, switchMap, take } from 'rxjs';

import { normalizeScriptFont } from '../../../core/constants/script-fonts';
import { Wedding, WeddingPartyMember } from '../../../core/models/wedding.models';
import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { DEFAULT_WEDDING_ID, WeddingService } from '../../../core/services/wedding.service';
import { toDisplayImageUrl } from '../../../core/utils/image-url';

@Component({
  selector: 'app-groomsmen-invite-page',
  imports: [AsyncPipe],
  template: `
    @let wedding = wedding$ | async;
    @let template = templateSvg$ | async;
    @let isReadOnly = isReadOnly$ | async;

    <main class="print-invite-page special-invite-page">
      <section class="print-invite-card groomsmen-invite-card">
        <div class="screen-invite-content">
          <section class="hero" [class.hero-empty]="!wedding?.coverImageUrl">
            @if (wedding?.coverImageUrl) {
              <img [src]="imageUrl(wedding?.coverImageUrl)" [alt]="wedding?.coupleNames || 'Casamento'" />
            } @else {
              <div class="hero-placeholder"></div>
            }
          </section>

          <div class="special-invite-content">
            <div class="ornament" aria-hidden="true">♥</div>
            <h2 class="invite-couple-name">{{ wedding?.coupleNames || 'Os noivos' }}</h2>
            @if (wedding?.eventDate) {
              <p class="date">{{ wedding?.eventDate }}</p>
            }
            <p class="eyebrow">Convite especial</p>
            <h1 class="groomsmen-question">Vocês aceitam ser nossos padrinhos?</h1>
            @let member = member$ | async;
            @if (member) {
              <p class="groomsmen-names">{{ shortCoupleName(member) }}</p>
            }
            <p class="invite-message">
              Queremos ter vocês ainda mais perto nesse momento. A presença de vocês na nossa história é importante,
              e seria uma alegria contar com vocês como padrinhos.
            </p>
          </div>
        </div>

        @if (template) {
          <div class="groomsmen-template-svg print-template-only" [innerHTML]="template"></div>
        }

        @if (!isReadOnly) {
          <div class="template-acceptance-panel screen-only">
            <div class="acceptance-actions">
              <button class="acceptance-button" type="button" (click)="respond('accepted')">Sim</button>
              <button class="acceptance-button ghost" type="button" (click)="respond('declined')">Não</button>
            </div>
            @if (responseMessage()) {
              <p class="success-state">{{ responseMessage() }}</p>
            }
          </div>
        } @else {
          <div class="template-acceptance-panel screen-only">
            <p class="muted-state">Este convite está disponível apenas para visualização.</p>
          </div>
        }
      </section>

    </main>
  `,
})
export class GroomsmenInvitePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly weddingContextService = inject(WeddingContextService);
  private readonly weddingService = inject(WeddingService);

  protected readonly weddingId$ = this.weddingContextService.publicWeddingId$(this.route);
  protected readonly wedding$ = this.weddingId$.pipe(switchMap((weddingId) => this.weddingService.wedding$(weddingId)));
  protected readonly isReadOnly$ = this.weddingId$.pipe(map((weddingId) => weddingId === DEFAULT_WEDDING_ID));
  protected readonly member$ = this.route.paramMap.pipe(
    switchMap((params) => {
      const memberId = params.get('memberId');
      if (!memberId) {
        return of(undefined);
      }

      return this.weddingId$.pipe(switchMap((weddingId) => this.weddingService.weddingPartyMember$(memberId, weddingId)));
    }),
  );
  private readonly templateSource$ = from(fetch('/template_convite.svg').then((response) => response.text())).pipe(shareReplay(1));
  protected readonly templateSvg$ = combineLatest([this.templateSource$, this.wedding$, this.member$]).pipe(
    map(([template, wedding, member]) => {
      if (!wedding || !member) {
        return undefined;
      }

      return this.sanitizer.bypassSecurityTrustHtml(this.renderTemplate(template, wedding, member));
    }),
  );
  protected readonly responseMessage = signal('');

  protected imageUrl(url?: string): string {
    return toDisplayImageUrl(url);
  }

  ngOnInit(): void {
    combineLatest([this.route.queryParamMap, this.templateSvg$])
      .pipe(
        filter(([params, template]) => params.get('print') === '1' && !!template),
        take(1),
      )
      .subscribe(() => setTimeout(() => window.print()));
  }

  protected async respond(invitationStatus: 'accepted' | 'declined'): Promise<void> {
    const memberId = this.route.snapshot.paramMap.get('memberId');
    if (!memberId) {
      this.responseMessage.set('Convite individual nao encontrado.');
      return;
    }

    const weddingId = await firstValueFrom(this.weddingId$);
    await this.weddingService.updateWeddingPartyInvitation(memberId, invitationStatus, weddingId);
    this.responseMessage.set(invitationStatus === 'accepted' ? 'Resposta registrada. Obrigado pelo sim!' : 'Resposta registrada.');
  }

  protected shortCoupleName(member: { firstName: string; secondName: string }): string {
    return `${this.firstWord(member.firstName)} & ${this.firstWord(member.secondName)}`;
  }

  private renderTemplate(template: string, wedding: Wedding, member: WeddingPartyMember): string {
    const parser = new DOMParser();
    const document = parser.parseFromString(template, 'image/svg+xml');
    const parserError = document.querySelector('parsererror');
    if (parserError) {
      return template;
    }

    document.documentElement.setAttribute('width', '210mm');
    document.documentElement.setAttribute('height', '297mm');
    document.documentElement.setAttribute('preserveAspectRatio', 'xMidYMid slice');

    const imageUrl = this.imageUrl(wedding.coverImageUrl);
    this.setSvgText(document, 'nomes-noivos', wedding.coupleNames || 'Os noivos');
    this.setSvgText(document, 'data', wedding.eventDate || '');
    this.setSvgText(document, 'pergunta', 'Vocês aceitam ser nossos padrinhos?');
    this.setSvgText(document, 'nomes-padrinhos', this.shortCoupleName(member));
    this.setSvgFont(document, 'nomes-noivos', normalizeScriptFont(wedding.theme?.scriptFont));
    this.setSvgFont(document, 'data', 'Cormorant Garamond');
    this.setSvgFont(document, 'nomes-padrinhos', 'Cormorant Garamond');

    const imageElement = document.getElementById('foto-casal') ?? document.querySelector('image');
    if (imageUrl && imageElement) {
      imageElement.setAttribute('href', imageUrl);
      imageElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', imageUrl);
      imageElement.setAttribute('x', '-24.813244');
      imageElement.setAttribute('y', '1.7500004');
      imageElement.setAttribute('width', '1112.1564');
      imageElement.setAttribute('height', '848.29474');
      imageElement.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    }

    return new XMLSerializer()
      .serializeToString(document.documentElement)
      .replace(/font-family:Bacalisties/g, "font-family:'Bacalisties'")
      .replace(/font-family:Likhan/g, "font-family:'Cormorant Garamond'")
      .replace(/font-family:FreeSerif/g, "font-family:'Cormorant Garamond'");
  }

  private setSvgText(document: Document, id: string, value: string): void {
    const element = document.getElementById(id);
    const textNode = element?.querySelector('tspan') ?? element;
    if (textNode) {
      textNode.textContent = value;
    }
  }

  private setSvgFont(document: Document, id: string, fontFamily: string): void {
    const element = document.getElementById(id);
    const textNode = element?.querySelector('tspan');
    for (const target of [element, textNode]) {
      if (!target) {
        continue;
      }

      target.setAttribute('font-family', fontFamily);
      const currentStyle = target.getAttribute('style') || '';
      const nextStyle = currentStyle
        .replace(/font-family:[^;]+;?/g, '')
        .replace(/-inkscape-font-specification:[^;]+;?/g, '')
        .trim();
      target.setAttribute('style', `${nextStyle}${nextStyle ? ';' : ''}font-family:'${fontFamily}'`);
    }
  }

  private firstWord(value: string): string {
    return value.trim().split(/\s+/)[0] || value;
  }

}
