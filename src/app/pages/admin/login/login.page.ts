import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule],
  template: `
    <main class="admin-login">
      <form class="form-card" (ngSubmit)="login()">
        <h1>Entrar no SIM</h1>
        <button class="google-action" type="button" (click)="loginWithGoogle()">
          Entrar com Google
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
        <button class="primary-action" type="submit">Entrar</button>
        <button class="secondary-action" type="button" (click)="register()">Criar acesso</button>
        @if (error) {
          <p class="error-state">{{ error }}</p>
        }
      </form>
    </main>
  `,
})
export class LoginPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected email = '';
  protected password = '';
  protected displayName = '';
  protected error = '';

  constructor() {
    void this.completeRedirectLogin();
  }

  async loginWithGoogle(): Promise<void> {
    try {
      await this.authService.loginWithGoogle();
      await this.router.navigateByUrl('/admin/configuracoes');
    } catch {
      this.error = 'Nao foi possivel entrar com Google.';
    }
  }

  async login(): Promise<void> {
    try {
      await this.authService.login(this.email, this.password);
      await this.router.navigateByUrl('/admin');
    } catch {
      this.error = 'Nao foi possivel entrar. Verifique email e senha.';
    }
  }

  async register(): Promise<void> {
    try {
      await this.authService.register(this.displayName, this.email, this.password);
      await this.router.navigateByUrl('/admin/configuracoes');
    } catch {
      this.error = 'Nao foi possivel criar o acesso. Verifique email e senha.';
    }
  }

  private async completeRedirectLogin(): Promise<void> {
    try {
      const result = await this.authService.completeRedirectLogin();
      if (result) {
        await this.router.navigateByUrl('/admin/configuracoes');
      }
    } catch {
      this.error = 'Nao foi possivel concluir o login com Google.';
    }
  }
}
