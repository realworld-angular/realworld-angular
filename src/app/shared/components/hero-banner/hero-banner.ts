import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'rw-hero-banner',
  imports: [NgOptimizedImage],
  templateUrl: './hero-banner.html',
  styleUrl: './hero-banner.css',
})
export class HeroBanner {
  public readonly editionVariant = 'Starter';
}
