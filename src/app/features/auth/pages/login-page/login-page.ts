import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { form, FormField, required, email, minLength, FormRoot } from '@angular/forms/signals';
import { Auth } from '../../../../core/services/auth';
import { Callout } from '../../../../shared/components/callout/callout';
import { Input } from '../../../../shared/components/input/input';
import { Button } from '../../../../shared/components/button/button';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'rw-login-page',
  imports: [RouterLink, FormField, Input, Button, Callout, FormRoot],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected readonly model = signal({ email: '', password: '' });

  protected readonly loginForm = form(this.model, (schema) => {
    required(schema.email, { message: 'Email is required' });
    email(schema.email, { message: 'Enter a valid email' });
    required(schema.password, { message: 'Password is required' });
  }, {
    submission: {
      action: async (formRef) => {
        const { email, password } = formRef().value();
        try {
          await firstValueFrom(this.auth.login(email, password));
          await this.router.navigate(['/']);
        } catch {
          return { kind: 'serverError', message: 'Invalid credentials' };
        }
        return null;
      },
    },
  });
}
