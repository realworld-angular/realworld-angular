import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { CatalogImageKind, CatalogImageUrlPipe } from '../../pipes/catalog-image-url.pipe';
import { Spinner } from '../spinner/spinner';

@Component({
  selector: 'rw-image-picker',
  imports: [NgOptimizedImage, Spinner, CatalogImageUrlPipe],
  templateUrl: './image-picker.html',
  styleUrl: './image-picker.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImagePicker implements FormValueControl<string | null> {
  private static counter = 0;

  readonly pickerLegendId = `rw-image-picker-legend-${++ImagePicker.counter}`;

  /** `pizza` | `pizzeria` — drives `GET /api/pizzas/images` vs `GET /api/pizzerias/images`. */
  readonly category = input.required<string>();
  readonly label = input<string>('Image');

  /** Selected image basename, or null — bound by `[formField]` (Signal Forms). */
  readonly value = model<string | null>(null);
  readonly touched = model(false);

  readonly invalid = input(false);
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  readonly disabled = input(false);
  readonly required = input(false);

  readonly pickerImageKind = computed<CatalogImageKind>(() =>
    this.category() === 'pizzeria' ? 'pizzeria' : 'pizza',
  );

  readonly filenamesResource = httpResource<string[]>(() =>
    this.category() === 'pizzeria'
      ? '/api/pizzerias/images'
      : '/api/pizzas/images',
  );

  select(filename: string): void {
    if (this.disabled()) {
      return;
    }
    this.value.set(filename);
    this.touched.set(true);
  }
}
