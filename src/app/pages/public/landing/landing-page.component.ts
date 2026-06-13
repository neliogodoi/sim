import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
	selector: 'app-landing-page',
	standalone: true,
	imports: [RouterLink],
	templateUrl: './landing-page.component.html',
	styleUrls: ['./landing-page.component.css'],
})
export class LandingPageComponent implements OnInit, OnDestroy {
	protected menuOpen = false;

	private revealObserver?: IntersectionObserver;
	private revealFrameId = 0;

	ngOnInit(): void {
		this.revealFrameId = window.requestAnimationFrame(() => {
			this.initScrollReveal();
		});
	}

	ngOnDestroy(): void {
		if (this.revealFrameId) {
			window.cancelAnimationFrame(this.revealFrameId);
		}
		this.revealObserver?.disconnect();
	}

	protected toggleMenu(): void {
		this.menuOpen = !this.menuOpen;
	}

	protected closeMenu(): void {
		this.menuOpen = false;
	}

	private initScrollReveal(): void {
		this.revealObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('visible');
						this.revealObserver?.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.14 }
		);

		document.querySelectorAll('.reveal').forEach((el) => this.revealObserver?.observe(el));
	}
}
