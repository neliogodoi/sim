import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FirebaseError } from 'firebase/app';

import { AdminWeddingBootstrapService } from '../../../core/services/admin-wedding-bootstrap.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
	selector: 'app-register-page',
	imports: [FormsModule, RouterLink],
	styleUrls: ['../auth/auth.page.css'],
	template: `
    <main class="auth-shell">
      <section class="auth-hero">
        <span class="eyebrow">Novo acesso</span>
        <h1>Criar conta no SIM</h1>
        <p>
          Cadastre a conta principal do casamento e comece com uma base já preparada para convite, convidados e painel administrativo.
        </p>
        <div class="auth-points">
          <div class="auth-point">
            <strong>Conta separada</strong>
            <span>Cadastro dedicado, sem misturar com o login de usuários já existentes.</span>
          </div>
          <div class="auth-point">
            <strong>Preparado para casar</strong>
            <span>Ao concluir, o painel é liberado e o casamento é configurado automaticamente.</span>
          </div>
          <div class="auth-point">
            <strong>Tempo de espera</strong>
            <span>Indicamos o carregamento sem deixar a tela em silêncio.</span>
          </div>
        </div>
      </section>

      <form class="auth-card" (ngSubmit)="register()">
        <span class="eyebrow">Primeiro acesso</span>
        <h2>Crie sua conta</h2>
        <button class="auth-google" type="button" [disabled]="isGoogleLoginLoading || isSubmitting || isCheckingRedirect" (click)="registerWithGoogle()">
          {{ isGoogleLoginLoading ? 'Cadastrando com Google...' : 'Criar conta com Google' }}
        </button>
        <div class="auth-divider">ou preencha os dados</div>
        <label>
          Nome dos noivos
          <input name="displayName" [(ngModel)]="displayName" autocomplete="name" />
        </label>
        <label>
          Email
          <input type="email" name="email" [(ngModel)]="email" required autocomplete="email" />
        </label>
        <label>
          Senha
          <input type="password" name="password" [(ngModel)]="password" required autocomplete="new-password" />
        </label>
        <button class="auth-button" type="submit" [disabled]="isSubmitting || isGoogleLoginLoading || isCheckingRedirect">
          {{ isSubmitting ? 'Criando conta...' : 'Criar conta' }}
        </button>
        <div class="auth-link-row">
          <span class="auth-note">Já tem acesso?</span>
          <a routerLink="/admin/login">Voltar para login</a>
        </div>
        @if (error) {
          <p class="auth-error">{{ error }}</p>
        }
      </form>
    </main>
  `,
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
