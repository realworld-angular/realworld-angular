import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'rw-hero-banner',
  templateUrl: './hero-banner.html',
  styleUrl: './hero-banner.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroBanner {
  public readonly editionVariant = 'Starter';
}
