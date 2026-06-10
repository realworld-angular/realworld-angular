import {
  Component,
  computed,
  effect,
  injectAsync,
  input,
  model,
  signal,
} from '@angular/core';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, from, map, of } from 'rxjs';
import { FormValueControl, ValidationError, WithOptionalFieldTree } from '@angular/forms/signals';
import { PhotonQuery } from '../../../core/models/photon-query.model';
import { switchMap } from 'rxjs/operators';

export interface LocationValue {
  city: string;
  country: string;
}

export interface PhotonLocationSuggestion {
  label: string;
  city: string;
  country: string;
}

let nextFieldId = 0;

@Component({
  selector: 'rw-photon-location-field',
  templateUrl: './photon-location-field.html',
  styleUrl: './photon-location-field.css',
})
export class PhotonLocationField implements FormValueControl<LocationValue | null> {
  private readonly fieldId = `rw-photon-location-${++nextFieldId}`;

  // --- FormValueControl ---
  public readonly value = model<LocationValue | null>(null);
  public readonly touched = model<boolean>(false);
  public readonly disabled = input<boolean>(false);
  public readonly readonly = input<boolean>(false);
  public readonly invalid = input<boolean>(false);
  public readonly errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);
  public readonly required = input<boolean>(false);
  public readonly label = input('Location (city and country)');

  protected readonly inputId = this.fieldId;
  protected readonly listboxId = `${this.fieldId}-listbox`;

  protected readonly displayText = signal('');
  protected readonly panelOpen = signal(false);
  protected readonly activeIndex = signal(-1);

  private readonly photonApiService = injectAsync(() =>
    import('../../../core/services/photon-api.service').then((m) => m.PhotonApiService),
  );
  private readonly searchInput = signal('');

  private readonly debouncedSearch = toSignal(
    toObservable(this.searchInput).pipe(
      debounceTime(280),
      map((s) => s.trim()),
      distinctUntilChanged(),
    ),
    { initialValue: '' },
  );

  protected readonly suggestionsResource = rxResource<PhotonLocationSuggestion[], PhotonQuery | undefined>({
    params: () => {
      const query = this.debouncedSearch();
      if (query.length < 2) return undefined;
      return { q: query, lang: 'en', limit: 10 };
    },
    stream: ({ params }) => {
      if (!params) {
        return of([]);
      }

      return from(this.photonApiService()).pipe(
        switchMap((service) => service.search(params)),
      );
    },
    defaultValue: [],
  })

  protected readonly isLoading = computed(() => {
    return this.searchInput().trim().length >= 2 && this.suggestionsResource.isLoading();
  });

  protected readonly suggestions = computed(() => {
    if (this.suggestionsResource.hasValue()) {
      return this.suggestionsResource.value();
    }
    return [];
  });

  protected readonly showPanel = computed(
    () => this.panelOpen() && (this.isLoading() || this.suggestions().length > 0),
  );

  /** Label of the last committed suggestion (or external value sync). */
  private readonly pickedLabel = signal<string | null>(null);

  constructor() {
    effect(() => {
      const list = this.suggestions();
      this.activeIndex.set(list.length > 0 ? 0 : -1);
    });

    effect(() => {
      const location = this.value();
      if (location?.city && location?.country) {
        const label = formatLocationLabel(location);
        this.pickedLabel.set(label);
        this.displayText.set(label);
        this.closePanel();
        return;
      }
      if (location === null && this.pickedLabel() !== null) {
        this.pickedLabel.set(null);
        this.displayText.set('');
        this.searchInput.set('');
      }
    });
  }

  protected onInput(ev: Event): void {
    const text = (ev.target as HTMLInputElement).value;
    this.displayText.set(text);
    this.panelOpen.set(true);
    this.activeIndex.set(-1);

    if (text !== this.pickedLabel()) {
      this.pickedLabel.set(null);
      this.value.set(null);
    }

    this.searchInput.set(text);
  }

  protected onFocus(): void {
    if (this.suggestions().length > 0 || this.isLoading()) {
      this.panelOpen.set(true);
    }
  }

  protected onWrapFocusOut(ev: FocusEvent): void {
    const wrap = ev.currentTarget as HTMLElement;
    if (wrap.contains(ev.relatedTarget as Node | null)) {
      return;
    }
    this.touched.set(true);
    this.closePanel();
    if (!this.value() && this.displayText().trim()) {
      this.displayText.set('');
    }
  }

  protected selectSuggestion(ev: Event, suggestion: PhotonLocationSuggestion): void {
    ev.preventDefault();
    this.commitSuggestion(suggestion);
  }

  protected onKeydown(ev: KeyboardEvent): void {
    if (!this.panelOpen() || this.suggestions().length === 0) {
      return;
    }
    const list = this.suggestions();
    const idx = this.activeIndex();
    switch (ev.key) {
      case 'ArrowDown':
        ev.preventDefault();
        this.activeIndex.set(Math.min(list.length - 1, idx < 0 ? 0 : idx + 1));
        break;
      case 'ArrowUp':
        ev.preventDefault();
        this.activeIndex.set(Math.max(0, idx - 1));
        break;
      case 'Enter': {
        const selected = list[idx];
        if (selected) {
          ev.preventDefault();
          this.commitSuggestion(selected);
        }
        break;
      }
      case 'Escape':
        ev.preventDefault();
        this.closePanel();
        break;
    }
  }

  private commitSuggestion(suggestion: PhotonLocationSuggestion): void {
    this.pickedLabel.set(suggestion.label);
    this.displayText.set(suggestion.label);
    this.value.set({ city: suggestion.city, country: suggestion.country });
    this.closePanel();
  }

  private closePanel(): void {
    this.panelOpen.set(false);
    this.activeIndex.set(-1);
  }
}

function formatLocationLabel(location: LocationValue): string {
  return `${location.city}, ${location.country}`;
}
