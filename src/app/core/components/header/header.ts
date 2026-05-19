import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../services/auth';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { PizzaLogo } from '../../../shared/components/pizza-logo/pizza-logo';
import { CartStore } from '../../../features/cart/cart.store';
import { RoleDirective } from '../../../shared/directives/role.directive';

@Component({
  selector: 'rw-header',
  imports: [RouterLink, RouterLinkActive, Avatar, PizzaLogo, RoleDirective],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  protected readonly auth = inject(Auth);
  protected readonly cartStore = inject(CartStore);
  private readonly document = inject(DOCUMENT);

  protected readonly isMobileMenuOpen = signal(false);

  @HostListener('document:keydown.escape')
  public onDocumentEscape(): void {
    if (this.isMobileMenuOpen()) {
      this.closeMobileMenu();
    }
  }

  public constructor() {
    effect(() => {
      const open = this.isMobileMenuOpen();
      this.document.body.style.overflow = open ? 'hidden' : '';
    });
  }

  protected toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((isOpen) => !isOpen);
  }

  protected closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
}
