import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormField, form, required, FormRoot } from '@angular/forms/signals';
import { PizzeriaApi } from '../../services/pizzeria-api';
import { Callout } from '../../../../shared/components/callout/callout';
import { Button } from '../../../../shared/components/button/button';
import { ImagePicker } from '../../../../shared/components/image-picker/image-picker';
import { PhotonLocationField } from '../../../../shared/components/photon-location-field/photon-location-field';
import type { LocationValue } from '../../../../shared/components/photon-location-field/photon-location-field';
import { firstValueFrom } from 'rxjs';

interface PizzeriaForm {
  location: LocationValue | null;
  image: string | null;
}

@Component({
  selector: 'rw-admin-pizzeria-form-page',
  imports: [Button, FormField, ImagePicker, Callout, PhotonLocationField, FormRoot],
  templateUrl: './admin-pizzeria-form-page.html',
  styleUrl: './admin-pizzeria-form-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPizzeriaFormPage {
  private readonly api = inject(PizzeriaApi);
  private readonly router = inject(Router);

  protected readonly model = signal<PizzeriaForm>({
    location: null,
    image: null,
  });

  protected readonly pizzeriaForm = form(
    this.model,
    (schema) => {
      required(schema.location, { message: 'Choose a location from the list' });
      required(schema.image, { message: 'Please select an image' });
    },
    {
      submission: {
        action: async (form) => {
          const value = form().value();
          try {
            await firstValueFrom(
              this.api.createPizzeria({
                city: value.location!.city,
                country: value.location!.country,
                imageFilename: value.image!,
              }),
            );
          } catch {
            return { kind: 'serverError', message: 'Failed to create pizzeria' };
          }
          void this.router.navigate(['/pizzerias/admin/pizzas']);
          return null;
        },
      },
    },
  );
}
