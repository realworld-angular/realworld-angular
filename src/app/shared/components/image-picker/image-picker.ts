import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
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
  public readonly category = input.required<string>();
  public readonly label = input.required<string>();

  public readonly value = model<string | null>(null);
  public readonly touched = model(false);

  public readonly invalid = input(false);
  public readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  public readonly disabled = input(false);
  public readonly required = input(false);

  protected readonly pickerImageKind = computed<CatalogImageKind>(() =>
    this.category() === 'pizzeria' ? 'pizzeria' : 'pizza',
  );

  protected readonly filenamesResource = httpResource<string[]>(() =>
    this.category() === 'pizzeria' ? '/api/pizzerias/images' : '/api/pizzas/images',
  );

  protected select(filename: string): void {
    if (this.disabled()) {
      return;
    }
    this.value.set(filename);
    this.touched.set(true);
  }
}
