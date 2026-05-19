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

export interface CartPizza {
  id: string;
  name: string;
  image: string;
  basePrice: number;
}

export interface CartOption {
  id: string;
  label: string;
  price: number;
}

export interface CartItemDetail {
  id: string;
  pizza: CartPizza;
  quantity: number;
  size: CartOption | null;
  extraToppings: CartOption[];
  totalPrice: number;
}

export interface CartData {
  pizzeria: { id: string; name: string; image: string };
  items: CartItemDetail[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly http = inject(HttpClient);

  public readonly pizzeria = signal<CartPizzeria | null>(null);
  public readonly items = signal<CartItem[]>([]);
  public readonly cart = signal<CartData | null>(null);
  public readonly isLoading = signal(false);

  public readonly totalPrice = computed<number>(() =>
    this.cart()?.total ?? 0,
  );

  public readonly itemCount = computed<number>(() =>
    this.cart()?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
  );

  public readonly isEmpty = computed<boolean>(() => this.items().length === 0);

  public constructor() {
    effect((onCleanup) => {
      const currentItems = this.items();
      const currentPizzeria = this.pizzeria();

      if (currentItems.length === 0 || !currentPizzeria) {
        this.cart.set(null);
        this.isLoading.set(false);
        return;
      }

      this.isLoading.set(true);
      const sub = this.http
        .post<CartData>('/api/orders/cart', {
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
            this.cart.set(result);
            this.isLoading.set(false);
          },
          error: () => {
            this.cart.set(null);
            this.isLoading.set(false);
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
