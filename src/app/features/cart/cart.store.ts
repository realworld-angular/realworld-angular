import { Injectable, signal, computed } from '@angular/core';
import { Pizza, SelectedPizzaOption } from '../pizzerias/models/pizza.models';

export interface CartPizzeria {
  id: string;
  name: string;
}

export interface CartItem {
  id: string;
  pizza: Pizza;
  quantity: number;
  size: SelectedPizzaOption | null;
  extraToppings: SelectedPizzaOption[];
  totalPrice: number;
}

@Injectable({ providedIn: 'root' })
export class CartStore {
  public readonly pizzeria = signal<CartPizzeria | null>(null);
  public readonly items = signal<CartItem[]>([]);

  public readonly totalPrice = computed<number>(() =>
    this.items().reduce((sum, item) => sum + item.totalPrice, 0),
  );

  public readonly itemCount = computed<number>(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0),
  );

  public readonly isEmpty = computed<boolean>(() => this.items().length === 0);

  public hasItemsForOtherPizzeria(pizzeriaId: string): boolean {
    const current = this.pizzeria();
    return current !== null && current.id !== pizzeriaId;
  }

  public addItem(
    pizza: Pizza,
    quantity: number,
    size: SelectedPizzaOption | null,
    extraToppings: SelectedPizzaOption[],
  ): void {
    if (this.hasItemsForOtherPizzeria(pizza.id)) {
      this.clear();
    }

    this.pizzeria.set({ id: pizza.id, name: pizza.name });

    const itemId = this.generateItemId(pizza.id, size, extraToppings);
    const basePrice = pizza.basePrice;
    const sizePrice = size?.price ?? 0;
    const toppingsPrice = extraToppings.reduce((sum, option) => sum + option.price, 0);
    const optionTotalPrice = sizePrice + toppingsPrice;

    this.items.update((items) => {
      const existing = items.find((item) => item.id === itemId);
      if (existing) {
        const newQty = existing.quantity + quantity;
        return items.map((item) =>
          item.id === itemId
            ? {
              ...item,
              quantity: newQty,
              totalPrice: (basePrice + optionTotalPrice) * newQty } : item,
        );
      }

      return [
        ...items,
        {
          id: itemId,
          pizza,
          quantity,
          size,
          extraToppings,
          totalPrice: (basePrice + optionTotalPrice) * quantity,
        },
      ];
    });
  }

  public updateQuantity(itemId: string, quantity: number): void {
    if (quantity === 0) {
      this.removeItem(itemId);
    } else {
    this.items.update((items) =>
      items.map((item) => {
        if (item.id !== itemId) {
          return item;
        }
        const sizePrice = item.size?.price ?? 0;
        const toppingsPrice = item.extraToppings.reduce((sum, option) => sum + option.price, 0);
        const optionTotalPrice = sizePrice + toppingsPrice;
        return {
          ...item,
          quantity,
          totalPrice: (item.pizza.basePrice + optionTotalPrice) * quantity
        };
      }),
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

  private generateItemId(pizzaId: string, size: SelectedPizzaOption | null, extraToppings: SelectedPizzaOption[]): string {
    const sizeId = size?.id ?? '';
    const toppingIds = extraToppings.map((t) => t.id).sort().join(',');
    return `${pizzaId}:${sizeId}:${toppingIds}`;
  }
}
