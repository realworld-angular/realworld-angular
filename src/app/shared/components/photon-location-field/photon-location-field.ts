import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { PhotonApi, PhotonLocationSuggestion } from '../../../core/services/photon-api';
import { FormValueControl, ValidationError, WithOptionalFieldTree } from '@angular/forms/signals';

export interface LocationValue {
  city: string;
  country: string;
}

@Component({
  selector: 'rw-photon-location-field',
  templateUrl: './photon-location-field.html',
  styleUrl: './photon-location-field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotonLocationField implements FormValueControl<LocationValue | null> {
  private static nextId = 0;

  private readonly photon = inject(PhotonApi);
  private readonly destroyRef = inject(DestroyRef);

  // --- FormValueControl required ---
  readonly value = model<LocationValue | null>(null);

  // --- FormValueControl optional state ---
  readonly touched = model<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  readonly errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);
  readonly required = input<boolean>(false);

  // --- UI-only input ---
  readonly label = input('Location (city and country)');

  protected readonly query = signal('');
  protected readonly suggestions = signal<PhotonLocationSuggestion[]>([]);
  protected readonly isOpen = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly activeIndex = signal(-1);

  /** Non-null only when the input text matches a Photon option the user chose (or initial sync). */
  private readonly committedPick = signal<{
    label: string;
    city: string;
    country: string;
  } | null>(null);

  private readonly search$ = new Subject<string>();

  readonly inputId = `rw-photon-loc-${++PhotonLocationField.nextId}`;
  readonly listboxId = `${this.inputId}-listbox`;
  readonly errorId = `${this.inputId}-error`;

  constructor() {
    this.search$
      .pipe(
        debounceTime(280),
        distinctUntilChanged(),
        switchMap((query) => {
          this.isLoading.set(query.trim().length >= 2);
          return this.photon.searchPlaces(query);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((list) => {
        this.isLoading.set(false);
        this.suggestions.set(list);
        this.activeIndex.set(list.length > 0 ? 0 : -1);
      });

    // Sync value signal → display query (e.g. when form resets or patches externally)
    effect(() => {
      const locationValue = this.value();
      if (locationValue && locationValue.city && locationValue.country) {
        const label = `${locationValue.city}, ${locationValue.country}`;
        const current = this.committedPick();
        if (!current || current.city !== locationValue.city || current.country !== locationValue.country) {
          this.committedPick.set({ label, city: locationValue.city, country: locationValue.country });
          this.query.set(label);
        }
      } else if (!locationValue) {
        this.committedPick.set(null);
        this.query.set('');
        this.suggestions.set([]);
      }
    });
  }

  protected optionId(i: number): string {
    return `${this.inputId}-opt-${i}`;
  }

  protected activeId(): string | null {
    const activeIdx = this.activeIndex();
    if (activeIdx < 0) {
      return null;
    }
    return this.optionId(activeIdx);
  }

  protected onQueryInput(ev: Event): void {
    const el = ev.target as HTMLInputElement;
    const inputValue = el.value;
    this.query.set(inputValue);
    this.isOpen.set(true);
    this.activeIndex.set(-1);

    const commit = this.committedPick();
    if (!commit || inputValue !== commit.label) {
      this.committedPick.set(null);
      this.value.set(null);
    }

    if (inputValue.trim().length >= 2) {
      this.search$.next(inputValue);
    } else {
      this.isLoading.set(false);
      this.suggestions.set([]);
    }
  }

  protected onFocus(): void {
    if (this.suggestions().length > 0 || this.isLoading()) {
      this.isOpen.set(true);
    }
  }

  protected onBlur(): void {
    this.touched.set(true);
    setTimeout(() => {
      this.isOpen.set(false);
      this.activeIndex.set(-1);
      if (!this.committedPick() && this.query().trim().length > 0) {
        this.query.set('');
        this.suggestions.set([]);
        this.isLoading.set(false);
        this.value.set(null);
      }
    }, 150);
  }

  protected pick(ev: Event, s: PhotonLocationSuggestion): void {
    ev.preventDefault();
    this.committedPick.set({ label: s.label, city: s.city, country: s.country });
    this.query.set(s.label);
    this.suggestions.set([]);
    this.isOpen.set(false);
    this.value.set({ city: s.city, country: s.country });
  }

  protected onContainerKeydown(ev: KeyboardEvent): void {
    if (!this.isOpen() || this.suggestions().length === 0) {
      return;
    }
    const list = this.suggestions();
    let activeIdx = this.activeIndex();
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      activeIdx = Math.min(list.length - 1, activeIdx + 1);
      this.activeIndex.set(activeIdx < 0 ? 0 : activeIdx);
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      activeIdx = Math.max(0, activeIdx - 1);
      this.activeIndex.set(activeIdx);
    } else if (ev.key === 'Enter') {
      const sel = list[activeIdx];
      if (sel) {
        ev.preventDefault();
        this.committedPick.set({ label: sel.label, city: sel.city, country: sel.country });
        this.query.set(sel.label);
        this.suggestions.set([]);
        this.isOpen.set(false);
        this.value.set({ city: sel.city, country: sel.country });
      }
    } else if (ev.key === 'Escape') {
      ev.preventDefault();
      this.isOpen.set(false);
    }
  }
}
