import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'rw-avatar',
  templateUrl: './avatar.html',
  styleUrl: './avatar.css',
})
export class Avatar {
  public readonly name = input.required<string>();
  public readonly size = input<'sm' | 'md'>('md');

  protected readonly initials = computed<string>(() => {
    const parts = this.name().split(/(?=[A-Z])/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return this.name().slice(0, 2).toUpperCase();
  });
}
