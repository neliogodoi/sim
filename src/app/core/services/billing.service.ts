import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Wedding, WeddingBilling } from '../models/wedding.models';

export interface AsaasCheckoutResponse {
	checkoutUrl: string;
	billing?: WeddingBilling;
}

export interface AsaasBillingSyncResponse {
	billing?: WeddingBilling;
}

@Injectable({
	providedIn: 'root',
})
export class BillingService {
	private readonly http = inject(HttpClient);

	isPremium(wedding?: Wedding | null): boolean {
		const billing = wedding?.billing;
		if (!billing || billing.status !== 'active') {
			return false;
		}

		if (!billing.premiumUntil) {
			return true;
		}

		const expiresAt = new Date(billing.premiumUntil).getTime();
		return Number.isFinite(expiresAt) && expiresAt > Date.now();
	}

	createAsaasCheckout(wedding: Wedding): Promise<AsaasCheckoutResponse> {
		const apiUrl = this.asaasApiUrl();
		const origin = window.location.origin;

		return firstValueFrom(
			this.http.post<AsaasCheckoutResponse>(`${apiUrl}/checkout`, {
				weddingId: wedding.slug || wedding.id,
				coupleNames: wedding.coupleNames,
				successUrl: `${origin}/admin/pagamento?status=success`,
				cancelUrl: `${origin}/admin/pagamento?status=cancel`,
			}),
		);
	}

	syncAsaasBilling(weddingId: string): Promise<AsaasBillingSyncResponse> {
		const apiUrl = this.asaasApiUrl();
		return firstValueFrom(this.http.post<AsaasBillingSyncResponse>(`${apiUrl}/sync`, { weddingId }));
	}

	private asaasApiUrl(): string {
		const apiUrl = environment.asaas?.apiUrl?.trim();
		if (!apiUrl) {
			throw new Error('Configure ASAAS_API_URL apontando para o backend de pagamentos.');
		}

		return apiUrl.replace(/\/+$/, '');
	}
}
