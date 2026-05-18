import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { httpResource } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { PizzeriaDetail } from '../../models/pizzeria.models';
import { RoleDirective } from '../../../../shared/directives/role.directive';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { Callout } from '../../../../shared/components/callout/callout';

@Component({
  selector: 'rw-admin-pizzeria-page',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, RoleDirective, Spinner, Callout],
  templateUrl: './admin-pizzeria-details-page.html',
  styleUrl: './admin-pizzeria-details-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPizzeriaDetailsPage {
  private readonly title = inject(Title);

  protected readonly pizzeriaResource = httpResource<PizzeriaDetail | null>(
    () => '/api/pizzerias/admin/pizzeria',
  );

  public constructor() {
    effect(() => {
      if(this.pizzeriaResource.value()) {
        this.title.setTitle(`${this.pizzeriaResource.value()!.name} - Admin`);
      }
    });
  }
}
