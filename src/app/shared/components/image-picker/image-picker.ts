import { Component, computed, inject, input, model } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { CatalogImageKind, CatalogImageUrlPipe } from '../../pipes/catalog-image-url.pipe';
import { PizzeriaApi } from '../../../features/pizzerias/services/pizzeria-api';
import { Spinner } from '../spinner/spinner';

@Component({
  selector: 'rw-image-picker',
  imports: [NgOptimizedImage, Spinner, CatalogImageUrlPipe],
  templateUrl: './image-picker.html',
  styleUrl: './image-picker.css',
})
export class ImagePicker implements FormValueControl<string | null> {
  private readonly pizzeriaApi = inject(PizzeriaApi);
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

  protected readonly filenamesResource = this.pizzeriaApi.getImagesResource();

  protected select(filename: string): void {
    if (this.disabled()) {
      return;
    }
    this.value.set(filename);
    this.touched.set(true);
  }
}
