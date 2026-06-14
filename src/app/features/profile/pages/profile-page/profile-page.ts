import { Component, DestroyRef, inject, signal } from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Auth } from '../../../../core/services/auth';
import { Button } from '../../../../shared/components/button/button';
import { Avatar } from '../../../../shared/components/avatar/avatar';
@Component({
  selector: 'rw-profile-page',
  imports: [Button, Avatar],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage {
  private readonly auth = inject(Auth);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isLoggingOut = signal(false);
  protected readonly user = this.auth.user;

  protected logout(): void {
    this.isLoggingOut.set(true);
    this.auth
      .logout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          window.location.href = '/';
        },
      });
  }
}
