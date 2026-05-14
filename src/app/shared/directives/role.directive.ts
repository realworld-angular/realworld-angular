import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  inject,
  effect,
  input,
  signal,
} from '@angular/core';
import { Auth } from '../../core/services/auth';
import { Role } from '../../features/auth/role.model';

/**
 * Structural directive that conditionally renders content based on the
 * current user's role(s).
 *
 * Accepts a single role or an array of roles. The template is rendered when
 * the authenticated user's role matches any of the provided roles.
 *
 * A special sentinel value of `'GUEST'` can be used to render content only
 * for unauthenticated users.
 *
 * Usage:
 *   <nav *rwRole="'PIZZERIA_ADMIN'">Admin links</nav>
 *   <nav *rwRole="['CUSTOMER', 'PIZZERIA_ADMIN']">Authenticated links</nav>
 *   <a *rwRole="'GUEST'" routerLink="/auth/login">Sign in</a>
 *
 * With else template:
 *   <button *rwRole="'CUSTOMER'; else signInTpl">Add to cart</button>
 *   <ng-template #signInTpl>
 *     <a routerLink="/auth/login">Sign in to order</a>
 *   </ng-template>
 */

type RoleInput = Role | 'GUEST' | (Role | 'GUEST')[];

@Directive({
  selector: '[rwRole]',
})
export class RoleDirective {
  private readonly auth = inject(Auth);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);

  public readonly rwRole = input.required<RoleInput>();
  public readonly rwRoleElse = input<TemplateRef<unknown>>();

  private hasView = signal(false);
  private hasElseView = signal(false);

  constructor() {
    effect(
      () => {
        const user = this.auth.user();
        const value = this.rwRole();
        const roles = Array.isArray(value) ? value : [value];
        const elseTemplateRef = this.rwRoleElse();
        const matches = roles.some((role) => {
          if (role === 'GUEST') {
            return user === null;
          }
          return user?.role === role;
        });

        if (matches && !this.hasView()) {
          this.viewContainer.clear();
          this.viewContainer.createEmbeddedView(this.templateRef);
          this.hasView.set(true);
          this.hasElseView.set(false);
        } else if (!matches && !this.hasElseView()) {
          this.viewContainer.clear();
          if (elseTemplateRef) {
            this.viewContainer.createEmbeddedView(elseTemplateRef);
            this.hasElseView.set(true);
          }
          this.hasView.set(false);
        }
      },
      { injector: this.viewContainer.injector },
    );
  }
}
