import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';

import { BillingService } from '../services/billing.service';
import { WeddingContextService } from '../services/wedding-context.service';
import { WeddingService } from '../services/wedding.service';

export const premiumGuard: CanActivateFn = () => {
	const billingService = inject(BillingService);
	const router = inject(Router);
	const weddingContextService = inject(WeddingContextService);
	const weddingService = inject(WeddingService);
	const weddingId = weddingContextService.currentAdminWeddingId();

	return weddingService.wedding$(weddingId).pipe(
		take(1),
		map((wedding) => {
			if (billingService.isPremium(wedding)) {
				return true;
			}

			return router.createUrlTree(['/admin/pagamento']);
		}),
	);
};
