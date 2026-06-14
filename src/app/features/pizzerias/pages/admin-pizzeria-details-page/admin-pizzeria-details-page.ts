import { Component, effect, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { PizzeriaApi } from '../../services/pizzeria-api';
import { RoleDirective } from '../../../../shared/directives/role.directive';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { Callout } from '../../../../shared/components/callout/callout';

@Component({
  selector: 'rw-admin-pizzeria-page',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    NgOptimizedImage,
    RoleDirective,
    Spinner,
    Callout,
  ],
  templateUrl: './admin-pizzeria-details-page.html',
  styleUrl: './admin-pizzeria-details-page.css',
})
export class AdminPizzeriaDetailsPage {
  private readonly title = inject(Title);
  private readonly pizzeriaApi = inject(PizzeriaApi);

  protected readonly pizzeriaResource = this.pizzeriaApi.getMyPizzeriaResource();

  public constructor() {
    effect(() => {
      if (this.pizzeriaResource.status() === 'resolved') {
        const pizzeria = this.pizzeriaResource.value();
        if (pizzeria) {
          this.title.setTitle(`${pizzeria.name} - Admin`);
        }
      }
    });
  }
}
