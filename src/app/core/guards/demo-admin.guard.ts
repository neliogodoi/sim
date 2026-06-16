import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

import { WeddingContextService } from '../services/wedding-context.service';
import { DEFAULT_WEDDING_ID } from '../services/wedding.service';

export const demoAdminGuard: CanActivateFn = () => {
  inject(WeddingContextService).setActiveWeddingId(DEFAULT_WEDDING_ID);
  return true;
};
