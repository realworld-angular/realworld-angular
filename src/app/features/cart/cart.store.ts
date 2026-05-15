import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface CartPizzeria {
  id: string;
}

export interface CartItem {
  id: string;
  pizzaId: string;
  quantity: number;
  selectedSizeId: string | null;
  selectedOptionIds: string[];
}

export interface ReconstructedPizza {
  id: string;
  name: string;
  image: string;
  basePrice: number;
}

export interface ReconstructedOption {
  id: string;
  label: string;
  price: number;
}

export interface ReconstructedCartItem {
  id: string;
  pizza: ReconstructedPizza;
  quantity: number;
  size: ReconstructedOption | null;
  extraToppings: ReconstructedOption[];
  totalPrice: number;
}

export interface CartReconstructResponse {
  pizzeria: { id: string; name: string; image: string };
  items: ReconstructedCartItem[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly http = inject(HttpClient);

  public readonly pizzeria = signal<CartPizzeria | null>(null);
  public readonly items = signal<CartItem[]>([]);
  public readonly reconstructed = signal<CartReconstructResponse | null>(null);
  public readonly isReconstructing = signal(false);

  public readonly totalPrice = computed<number>(() =>
    this.reconstructed()?.total ?? 0,
  );

  public readonly itemCount = computed<number>(() =>
    this.reconstructed()?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
  );

  public readonly isEmpty = computed<boolean>(() => this.items().length === 0);

  public constructor() {
    effect((onCleanup) => {
      const currentItems = this.items();
      const currentPizzeria = this.pizzeria();

      if (currentItems.length === 0 || !currentPizzeria) {
        this.reconstructed.set(null);
        this.isReconstructing.set(false);
        return;
      }

      this.isReconstructing.set(true);
      const sub = this.http
        .post<CartReconstructResponse>('/api/orders/cart', {
          pizzeriaId: currentPizzeria.id,
          items: currentItems.map((item) => ({
            pizzaId: item.pizzaId,
            quantity: item.quantity,
            selectedSizeId: item.selectedSizeId ?? undefined,
            selectedOptionIds: item.selectedOptionIds,
          })),
        })
        .subscribe({
          next: (result) => {
            this.reconstructed.set(result);
            this.isReconstructing.set(false);
          },
          error: () => {
            this.reconstructed.set(null);
            this.isReconstructing.set(false);
          },
        });

      onCleanup(() => sub.unsubscribe());
    });
  }

  public hasItemsForOtherPizzeria(pizzeriaId: string): boolean {
    const current = this.pizzeria();
    return current !== null && current.id !== pizzeriaId;
  }

  public addItem(
    pizzaId: string,
    quantity: number,
    selectedSizeId: string | null,
    selectedOptionIds: string[],
    pizzeriaId: string,
  ): void {
    if (this.hasItemsForOtherPizzeria(pizzeriaId)) {
      this.clear();
    }

    this.pizzeria.set({ id: pizzeriaId });

    const itemId = this.generateItemId(pizzaId, selectedSizeId, selectedOptionIds);

    this.items.update((items) => {
      const existing = items.find((item) => item.id === itemId);
      if (existing) {
        return items.map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [
        ...items,
        {
          id: itemId,
          pizzaId,
          quantity,
          selectedSizeId,
          selectedOptionIds,
        },
      ];
    });
  }

  public updateQuantity(itemId: string, quantity: number): void {
    if (quantity === 0) {
      this.removeItem(itemId);
    } else {
      this.items.update((items) =>
        items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item,
        ),
      );
    }
  }

  public removeItem(itemId: string): void {
    this.items.update((items) => items.filter((item) => item.id !== itemId));
    if (this.isEmpty()) {
      this.clear();
    }
  }

  public clear(): void {
    this.items.set([]);
    this.pizzeria.set(null);
  }

  private generateItemId(
    pizzaId: string,
    selectedSizeId: string | null,
    selectedOptionIds: string[],
  ): string {
    const sizeId = selectedSizeId ?? '';
    const toppingIds = [...selectedOptionIds].sort().join(',');
    return `${pizzaId}:${sizeId}:${toppingIds}`;
  }
}
