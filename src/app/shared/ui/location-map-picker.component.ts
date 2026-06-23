import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	EventEmitter,
	Input,
	OnChanges,
	OnDestroy,
	Output,
	SimpleChanges,
	ViewChild,
} from '@angular/core';
import * as L from 'leaflet';

export interface MapPoint {
	lat: number;
	lng: number;
}

@Component({
	selector: 'app-location-map-picker',
	template: `
		<div class="map-picker-shell">
			<div #mapContainer class="map-picker" aria-label="Mapa para selecionar local"></div>
			<p class="map-picker-help">
				Toque no mapa para posicionar o local.
			</p>
		</div>
	`,
	styles: [
		`
			:host {
				display: block;
			}

			.map-picker-shell {
				display: grid;
				gap: 8px;
			}

			.map-picker {
				width: 100%;
				height: 240px;
				overflow: hidden;
				border: 1px solid var(--color-border);
				border-radius: 14px;
				background: var(--color-soft);
			}

			.map-picker-help {
				margin: 0;
				color: var(--color-muted);
				font-size: 0.78rem;
				font-weight: 700;
			}

			.map-marker {
				display: grid;
				place-items: center;
				width: 30px;
				height: 30px;
				border: 2px solid #fff;
				border-radius: 999px 999px 999px 0;
				background: var(--color-text);
				box-shadow: 0 8px 20px rgba(var(--color-shadow), 0.28);
				transform: rotate(-45deg);
			}

			.map-marker::after {
				content: '';
				width: 8px;
				height: 8px;
				border-radius: 50%;
				background: #fff;
			}
		`,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationMapPickerComponent implements AfterViewInit, OnChanges, OnDestroy {
	@Input() lat?: number | null;
	@Input() lng?: number | null;
	@Input() zoom = 14;
	@Output() pointSelected = new EventEmitter<MapPoint>();

	@ViewChild('mapContainer', { static: true }) private readonly mapContainer?: ElementRef<HTMLElement>;

	private map?: L.Map;
	private marker?: L.Marker;
	private readonly fallbackPoint: MapPoint = { lat: -23.55052, lng: -46.633308 };

	ngAfterViewInit(): void {
		const container = this.mapContainer?.nativeElement;
		if (!container) {
			return;
		}

		const point = this.currentPoint();
		this.map = L.map(container, {
			center: [point.lat, point.lng],
			zoom: this.hasPoint() ? this.zoom : 11,
			scrollWheelZoom: false,
		});

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; OpenStreetMap',
		}).addTo(this.map);

		this.map.on('click', (event: L.LeafletMouseEvent) => {
			this.setPoint({ lat: event.latlng.lat, lng: event.latlng.lng }, true);
		});

		if (this.hasPoint()) {
			this.setPoint(point, false);
		}

		setTimeout(() => this.map?.invalidateSize(), 0);
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (!this.map || (!changes['lat'] && !changes['lng'])) {
			return;
		}

		if (this.hasPoint()) {
			this.setPoint(this.currentPoint(), false);
		}
	}

	ngOnDestroy(): void {
		this.map?.remove();
	}

	private setPoint(point: MapPoint, emit: boolean): void {
		if (!this.map) {
			return;
		}

		if (!this.marker) {
			this.marker = L.marker([point.lat, point.lng], {
				icon: L.divIcon({
					className: '',
					html: '<span class="map-marker"></span>',
					iconSize: [30, 30],
					iconAnchor: [15, 30],
				}),
			}).addTo(this.map);
		}

		this.marker.setLatLng([point.lat, point.lng]);
		this.map.setView([point.lat, point.lng], this.zoom);

		if (emit) {
			this.pointSelected.emit(point);
		}
	}

	private currentPoint(): MapPoint {
		return this.hasPoint() ? { lat: Number(this.lat), lng: Number(this.lng) } : this.fallbackPoint;
	}

	private hasPoint(): boolean {
		return Number.isFinite(Number(this.lat)) && Number.isFinite(Number(this.lng));
	}
}
