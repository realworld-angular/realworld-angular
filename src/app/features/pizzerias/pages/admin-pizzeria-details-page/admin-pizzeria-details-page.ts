import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { httpResource } from '@angular/common/http';
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
  protected readonly pizzeriaResource = httpResource<PizzeriaDetail | null>(
    () => '/api/pizzerias/admin/pizzeria',
  );
}
