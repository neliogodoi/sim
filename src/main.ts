import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
	.catch((err) => {
		console.error('Bootstrap error:', err);
		// Tenta renderizar mesmo com erro
		document.body.innerHTML = '<app-root></app-root>';
	});
