import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const loginGuard: CanActivateFn = () => {
	const authService = inject(AuthService);
	const router = inject(Router);

	return authService.isSignedIn$().pipe(
		take(1),
		map((user) => (user ? router.createUrlTree(['/admin']) : true)),
	);
};