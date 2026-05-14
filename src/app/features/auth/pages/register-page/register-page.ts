import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { form, FormField, required, email, minLength, validateTree, FormRoot } from '@angular/forms/signals';
import { Auth } from '../../../../core/services/auth';
import { Callout } from '../../../../shared/components/callout/callout';
import { Input } from '../../../../shared/components/input/input';
import { Button } from '../../../../shared/components/button/button';

@Component({
  selector: 'rw-register-page',
  imports: [RouterLink, FormField, Input, Button, Callout, FormRoot],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  public readonly registerAsPizzeriaOwner = input<boolean>(false);
  public readonly postRegisterRedirect = input<string | undefined>('/pizzerias/admin/pizzeria/new');

  protected readonly model = signal({ email: '', password: '', confirmPassword: '' });

  protected readonly registerForm = form(this.model, (schema) => {
    required(schema.email, { message: 'Email is required' });
    email(schema.email, { message: 'Enter a valid email' });
    required(schema.password, { message: 'Password is required' });
    minLength(schema.password, 8, { message: 'Minimum 8 characters' });
    required(schema.confirmPassword, { message: 'Please confirm your password' });
    validateTree(schema, (ctx) => {
      const { password, confirmPassword } = ctx.value();
      if (password && confirmPassword && password !== confirmPassword) {
        return { kind: 'passwordMismatch', message: 'Passwords do not match', fieldTree: ctx.fieldTreeOf(schema.confirmPassword) };
      }
      return null;
    });
  }, {
    submission: {
      action: async (formRef) => {
        const { email, password } = formRef().value();
        try {
          const register$ = this.registerAsPizzeriaOwner()
            ? this.auth.registerPizzeriaOwner(email, password)
            : this.auth.register(email, password);
          await firstValueFrom(register$);
          if (this.registerAsPizzeriaOwner()) {
            await this.router.navigateByUrl(this.postRegisterRedirect()!);
          } else {
            await this.router.navigate(['/']);
          }
        } catch {
          return { kind: 'serverError', message: 'Registration failed' };
        }
        return null;
      },
    },
  });
}
