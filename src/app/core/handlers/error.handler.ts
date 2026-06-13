import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
	handleError(error: Error | any): void {
		const chunkFailedMessage = /Loading chunk (\d)+ failed/g;

		if (chunkFailedMessage.test(error.message)) {
			console.warn('Chunk loading failed, reloading page...');
			window.location.reload();
			return;
		}

		console.error('Global Error:', error);
	}
}
