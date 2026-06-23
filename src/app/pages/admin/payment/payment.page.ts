import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable, switchMap } from 'rxjs';

import { Wedding, WeddingBillingStatus } from '../../../core/models/wedding.models';
import { BillingService } from '../../../core/services/billing.service';
import { WeddingContextService } from '../../../core/services/wedding-context.service';
import { WeddingService } from '../../../core/services/wedding.service';
import { ToastService } from '../../../shared/ui/toast.service';

@Component({
	selector: 'app-payment-page',
	imports: [AsyncPipe, CurrencyPipe, DatePipe, RouterLink],
	templateUrl: './payment.page.html',
	styleUrl: './payment.page.css',
})
export class PaymentPage {
	private readonly billingService = inject(BillingService);
	private readonly toastService = inject(ToastService);
	private readonly weddingContextService = inject(WeddingContextService);
	private readonly weddingService = inject(WeddingService);

	protected readonly planPrice = 104.99;
	protected readonly activeWedding$: Observable<Wedding | undefined> = this.weddingContextService.activeWeddingId$.pipe(
		switchMap((weddingId) => this.weddingService.wedding$(weddingId)),
	);
	protected isCheckoutLoading = false;
	protected isSyncLoading = false;

	protected isPremium(wedding?: Wedding | null): boolean {
		return this.billingService.isPremium(wedding);
	}

	protected billingStatus(wedding?: Wedding | null): string {
		const status = wedding?.billing?.status || 'inactive';
		const labels: Record<WeddingBillingStatus, string> = {
			inactive: 'Pagamento pendente',
			pending: 'Aguardando confirmação',
			active: 'Premium ativo',
			overdue: 'Pagamento em atraso',
			canceled: 'Plano cancelado',
		};
		return labels[status];
	}

	protected async startCheckout(wedding: Wedding): Promise<void> {
		if (this.isCheckoutLoading) {
			return;
		}

		this.isCheckoutLoading = true;

		try {
			const response = await this.billingService.createAsaasCheckout(wedding);
			window.location.href = response.checkoutUrl;
		} catch (error) {
			console.error(error);
			this.toastService.error('Não foi possível iniciar o pagamento. Verifique a integração com Asaas.');
		} finally {
			this.isCheckoutLoading = false;
		}
	}

	protected async syncPayment(wedding: Wedding): Promise<void> {
		if (this.isSyncLoading) {
			return;
		}

		this.isSyncLoading = true;

		try {
			await this.billingService.syncAsaasBilling(wedding.slug || wedding.id);
			this.toastService.success('Consulta enviada. Se o Asaas já confirmou, o painel será liberado.');
		} catch (error) {
			console.error(error);
			this.toastService.error('Não foi possível verificar o pagamento agora.');
		} finally {
			this.isSyncLoading = false;
		}
	}
}
