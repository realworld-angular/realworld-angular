import { ChangeDetectionStrategy, Component, inject, signal, effect, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormField, form, required, FormRoot } from '@angular/forms/signals';
import { httpResource } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { filter, firstValueFrom, switchMap, finalize } from 'rxjs';
import { Router } from '@angular/router';
import { PizzeriaApi } from '../../services/pizzeria-api';
import { Callout } from '../../../../shared/components/callout/callout';
import { PizzeriaDetail } from '../../models/pizzeria.models';
import { Button } from '../../../../shared/components/button/button';
import { ImagePicker } from '../../../../shared/components/image-picker/image-picker';
import { PhotonLocationField } from '../../../../shared/components/photon-location-field/photon-location-field';
import type { LocationValue } from '../../../../shared/components/photon-location-field/photon-location-field';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { Dialog } from '@angular/cdk/dialog';
import { ConfirmDialog, ConfirmDialogData, ConfirmDialogResult } from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'rw-admin-pizzeria-configuration-page',
  imports: [Button, FormField, FormRoot, ImagePicker, Callout, PhotonLocationField, Spinner],
  templateUrl: './admin-pizzeria-configuration-page.html',
  styleUrl: './admin-pizzeria-configuration-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPizzeriaConfigurationPage {
  private readonly pizzeriaApi = inject(PizzeriaApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly dialog = inject(Dialog);
  private readonly title = inject(Title);

  protected readonly pizzeriaResource = httpResource<PizzeriaDetail | null>(
    () => '/api/pizzerias/admin/pizzeria',
  );

  protected readonly isDeleting = signal(false);
  protected readonly submitSuccess = signal(false);
  private lastHydratedPizzeriaId = '';

  protected readonly model = signal({
    location: null as LocationValue | null,
    image: null as string | null,
  });

  protected readonly pizzeriaForm = form(this.model, (schema) => {
    required(schema.location, { message: 'Choose a location from the list' });
    required(schema.image, { message: 'Please select an image' });
  }, {
    submission: {
      action: async (formRef) => {
        this.submitSuccess.set(false);
        const loc = formRef().value().location!;
        try {
          await firstValueFrom(
            this.pizzeriaApi.updateMyPizzeria({
              city: loc.city,
              country: loc.country,
              imageFilename: formRef().value().image!,
            }).pipe(takeUntilDestroyed(this.destroyRef)),
          );
        } catch {
          return { kind: 'serverError', message: 'Save failed' };
        }
        this.submitSuccess.set(true);
        return null;
      },
    },
  });

  public constructor() {
    effect(() => {
      if(this.pizzeriaResource.value()) {
        this.title.setTitle(`Configure your pizzeria - ${this.pizzeriaResource.value()!.name}`);
      }
    });

    effect(() => {
      const pizzeria = this.pizzeriaResource.value();
      if (!pizzeria) {
        return;
      }
      if (pizzeria.id === this.lastHydratedPizzeriaId) {
        return;
      }
      this.lastHydratedPizzeriaId = pizzeria.id;
      this.model.update((modelState) => ({
        ...modelState,
        location: { city: pizzeria.city, country: pizzeria.country },
        image: pizzeria.image,
      }));
    });
  }

  protected openDeleteConfirm(): void {
    const pizzeria = this.pizzeriaResource.value()!;

    const message = `Are you sure you want to delete "${pizzeria.name}"? This action cannot be undone.`;
    const ref = this.dialog.open<ConfirmDialogResult, ConfirmDialogData>(ConfirmDialog, {
      data: { title: 'Delete pizzeria', message, cancelLabel: 'Cancel', confirmLabel: 'Delete pizzeria' },
    });

    ref.closed.pipe(
      filter((result) => result === 'confirmed' && !this.isDeleting()),
      switchMap(() => {
        this.isDeleting.set(true);
        return this.pizzeriaApi.deleteMyPizzeria().pipe(takeUntilDestroyed(this.destroyRef));
      }),
      finalize(() => this.isDeleting.set(false)),
    ).subscribe({
        next: () => {
        void this.router.navigateByUrl('/pizzerias/admin/new');
      },
      error: () => {
        this.isDeleting.set(false);
        ref.close();
      },
    });
  }
}
