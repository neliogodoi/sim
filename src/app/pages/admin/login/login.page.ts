import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseError } from 'firebase/app';

import { AdminWeddingBootstrapService } from '../../../core/services/admin-wedding-bootstrap.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
	selector: 'app-login-page',
	imports: [FormsModule],
	template: `
    <main class="admin-login">
      <form class="form-card login-card" (ngSubmit)="login()">
        <header class="login-heading">
          <p>Administração</p>
          <h1>Entrar no SIM</h1>
        </header>
        <button class="google-action" type="button" [disabled]="isGoogleLoginLoading" (click)="loginWithGoogle()">
          {{ isGoogleLoginLoading ? 'Entrando com Google...' : 'Entrar com Google' }}
        </button>
        <div class="divider">ou</div>
        <label>
          Nome dos noivos
          <input name="displayName" [(ngModel)]="displayName" />
        </label>
        <label>
          Email
          <input type="email" name="email" [(ngModel)]="email" required />
        </label>
        <label>
          Senha
          <input type="password" name="password" [(ngModel)]="password" required />
        </label>
        <button class="primary-action login-primary-action" type="submit">Entrar</button>
        <button class="secondary-action" type="button" (click)="register()">Criar acesso</button>
        @if (error) {
          <p class="error-state">{{ error }}</p>
        }
      </form>
    </main>
  `,
})
export class LoginPage {
	private readonly adminWeddingBootstrapService = inject(AdminWeddingBootstrapService);
	private readonly authService = inject(AuthService);
	private readonly router = inject(Router);

	protected email = '';
	protected password = '';
	protected displayName = '';
	protected error = '';
	protected isGoogleLoginLoading = false;

	constructor() {
		void this.completeRedirectLogin();
	}

	async loginWithGoogle(): Promise<void> {
		if (this.isGoogleLoginLoading) {
			return;
		}

		this.isGoogleLoginLoading = true;
		this.error = '';

		try {
			const user = await this.authService.loginWithGoogle();
			if (user) {
				await this.enterAdmin(user);
			}
		} catch (error) {
			console.error(error);
			this.error = this.googleLoginErrorMessage(error);
		} finally {
			this.isGoogleLoginLoading = false;
		}
	}

	async login(): Promise<void> {
		try {
			const user = await this.authService.login(this.email, this.password);
			await this.enterAdmin(user);
		} catch {
			this.error = 'Nao foi possivel entrar. Verifique email e senha.';
		}
	}

	async register(): Promise<void> {
		try {
			const user = await this.authService.register(this.displayName, this.email, this.password);
			await this.enterAdmin(user);
		} catch {
			this.error = 'Nao foi possivel criar o acesso. Verifique email e senha.';
		}
	}

	private async completeRedirectLogin(): Promise<void> {
		try {
			const result = await this.authService.completeRedirectLogin();
			if (result) {
				await this.enterAdmin(result.user);
			}
		} catch {
			this.error = 'Nao foi possivel concluir o login com Google.';
		}
	}

	private async enterAdmin(user = this.authService.currentUser()): Promise<void> {
		await this.adminWeddingBootstrapService.ensureWedding(user);
		await this.router.navigateByUrl('/admin');
	}

	private googleLoginErrorMessage(error: unknown): string {
		if (!(error instanceof FirebaseError)) {
			return 'Nao foi possivel entrar com Google.';
		}

		if (error.code === 'auth/internal-error' || error.code === 'auth/network-request-failed') {
			return 'Falha ao carregar o login do Google. Verifique conexao, bloqueadores ou DNS e tente novamente.';
		}

		if (error.code === 'auth/unauthorized-domain') {
			return 'Dominio nao autorizado no Firebase Auth.';
		}

		return 'Nao foi possivel entrar com Google.';
	}
}
