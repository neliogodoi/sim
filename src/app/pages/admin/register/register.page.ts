import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FirebaseError } from 'firebase/app';

import { AdminWeddingBootstrapService } from '../../../core/services/admin-wedding-bootstrap.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
	selector: 'app-register-page',
	imports: [FormsModule, RouterLink],
	styleUrls: ['./register.page.css', '../auth/auth.page.css'],
	templateUrl: './register.page.html',
})
export class RegisterPage implements OnInit {
	private readonly adminWeddingBootstrapService = inject(AdminWeddingBootstrapService);
	private readonly authService = inject(AuthService);
	private readonly router = inject(Router);

	protected email = '';
	protected password = '';
	protected displayName = '';
	protected error = '';
	protected isGoogleLoginLoading = false;
	protected isSubmitting = false;
	protected isCheckingRedirect = false;

	ngOnInit(): void {
		void this.completeRedirectLogin();
	}

	async registerWithGoogle(): Promise<void> {
		if (this.isGoogleLoginLoading || this.isSubmitting) {
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

	async register(): Promise<void> {
		if (this.isSubmitting || this.isGoogleLoginLoading) {
			return;
		}

		this.isSubmitting = true;
		this.error = '';

		try {
			const user = await this.authService.register(this.displayName, this.email, this.password);
			await this.enterAdmin(user);
		} catch {
			this.error = 'Nao foi possivel criar o acesso. Verifique email, senha e nome.';
		} finally {
			this.isSubmitting = false;
		}
	}

	private async completeRedirectLogin(): Promise<void> {
		this.isCheckingRedirect = true;

		try {
			const result = await this.authService.completeRedirectLogin();
			if (result) {
				await this.enterAdmin(result.user);
			}
		} catch {
			this.error = 'Nao foi possivel concluir o login com Google.';
		} finally {
			this.isCheckingRedirect = false;
		}
	}

	private async enterAdmin(user = this.authService.currentUser()): Promise<void> {
		await this.adminWeddingBootstrapService.ensureWedding(user);
		await this.router.navigateByUrl('/admin');
	}

	private googleLoginErrorMessage(error: unknown): string {
		if (!(error instanceof FirebaseError)) {
			return 'Nao foi possivel cadastrar com Google.';
		}

		if (error.code === 'auth/internal-error' || error.code === 'auth/network-request-failed') {
			return 'Falha ao carregar o cadastro com Google. Verifique conexao, bloqueadores ou DNS e tente novamente.';
		}

		if (error.code === 'auth/unauthorized-domain') {
			return 'Dominio nao autorizado no servico de autenticacao.';
		}

		return 'Nao foi possivel cadastrar com Google.';
	}
}
