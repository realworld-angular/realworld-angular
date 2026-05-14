import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { CartStore } from './cart.store';
import { Auth } from '../../core/services/auth';
import { Pizza, SelectedPizzaOption } from '../pizzerias/models/pizza.models';

const mockSizeOption: SelectedPizzaOption = { id: 'opt1', label: 'Large', price: 3 };
const mockToppingOption: SelectedPizzaOption = { id: 'opt2', label: 'Cheese', price: 1 };

const mockPizza: Pizza = {
  id: 'pizza1',
  name: 'Margherita',
  basePrice: 10,
  image: 'pizza.jpg',
  createdAt: '2024-01-01',
  toppings: [],
};

const mockPizza2: Pizza = {
  id: 'pizza2',
  name: 'Pepperoni',
  basePrice: 12,
  image: 'pepperoni.jpg',
  createdAt: '2024-01-01',
  toppings: [],
};

describe('CartStore', () => {
  let service: CartStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CartStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Auth, useValue: { user: signal(null) } },
      ],
    });
    service = TestBed.inject(CartStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have empty items', () => {
      expect(service.items()).toEqual([]);
    });

    it('should have null pizzeria', () => {
      expect(service.pizzeria()).toBeNull();
    });

    it('should be empty', () => {
      expect(service.isEmpty()).toBe(true);
    });

    it('should have zero total', () => {
      expect(service.totalPrice()).toBe(0);
    });

    it('should have zero itemCount', () => {
      expect(service.itemCount()).toBe(0);
    });
  });

  describe('addItem()', () => {
    it('should add a new item', () => {
      service.addItem(mockPizza, 2, null, [], 'piz1', 'Pizza Place');
      expect(service.items().length).toBe(1);
      expect(service.items()[0].quantity).toBe(2);
      expect(service.isEmpty()).toBe(false);
    });

    it('should set pizzeria', () => {
      service.addItem(mockPizza, 1, null, [], 'piz1', 'Pizza Place');
      expect(service.pizzeria()).toEqual({ id: 'piz1', name: 'Pizza Place' });
    });

    it('should calculate lineTotal with no options', () => {
      service.addItem(mockPizza, 2, null, [], 'piz1', 'Pizza Place');
      expect(service.items()[0].totalPrice).toBe(20); // 10 * 2
    });

    it('should calculate lineTotal with size and toppings', () => {
      service.addItem(mockPizza, 2, mockSizeOption, [mockToppingOption], 'piz1', 'Pizza Place');
      // (10 + 3 + 1) * 2 = 28
      expect(service.items()[0].totalPrice).toBe(28);
    });

    it('should merge same item (same pizza + same options)', () => {
      service.addItem(mockPizza, 1, mockSizeOption, [], 'piz1', 'Pizza Place');
      service.addItem(mockPizza, 2, mockSizeOption, [], 'piz1', 'Pizza Place');
      expect(service.items().length).toBe(1);
      expect(service.items()[0].quantity).toBe(3);
    });

    it('should add separate items for different sizes', () => {
      const mockSizeOption2 = { id: 'opt3', label: 'Small', price: 1 };
      service.addItem(mockPizza, 1, mockSizeOption, [], 'piz1', 'Pizza Place');
      service.addItem(mockPizza, 1, mockSizeOption2, [], 'piz1', 'Pizza Place');
      expect(service.items().length).toBe(2);
    });

    it('should add separate items for different toppings', () => {
      service.addItem(mockPizza, 1, null, [mockToppingOption], 'piz1', 'Pizza Place');
      service.addItem(mockPizza, 1, null, [mockSizeOption], 'piz1', 'Pizza Place');
      expect(service.items().length).toBe(2);
    });

    it('should clear cart when adding from a different pizzeria', () => {
      service.addItem(mockPizza, 1, null, [], 'piz1', 'Pizza Place 1');
      service.addItem(mockPizza2, 1, null, [], 'piz2', 'Pizza Place 2');
      expect(service.items().length).toBe(1);
      expect(service.pizzeria()?.id).toBe('piz2');
      expect(service.items()[0].pizza.id).toBe('pizza2');
    });

    it('should compute correct total', () => {
      service.addItem(mockPizza, 2, null, [], 'piz1', 'Pizza Place');
      service.addItem(mockPizza2, 1, null, [], 'piz1', 'Pizza Place');
      expect(service.totalPrice()).toBe(32); // 10*2 + 12*1
    });

    it('should compute correct itemCount', () => {
      service.addItem(mockPizza, 2, null, [], 'piz1', 'Pizza Place');
      service.addItem(mockPizza2, 3, null, [], 'piz1', 'Pizza Place');
      expect(service.itemCount()).toBe(5);
    });
  });

  describe('hasItemsForOtherPizzeria()', () => {
    it('should be false when cart is empty', () => {
      expect(service.hasItemsForOtherPizzeria('piz1')).toBe(false);
    });

    it('should be false when cart is for the same pizzeria', () => {
      service.addItem(mockPizza, 1, null, [], 'piz1', 'Pizza Place');
      expect(service.hasItemsForOtherPizzeria('piz1')).toBe(false);
    });

    it('should be true when cart has items for a different pizzeria', () => {
      service.addItem(mockPizza, 1, null, [], 'piz1', 'Pizza Place');
      expect(service.hasItemsForOtherPizzeria('piz2')).toBe(true);
    });
  });

  describe('updateQuantity()', () => {
    it('should update the quantity and recalculate lineTotal', () => {
      service.addItem(mockPizza, 1, mockSizeOption, [], 'piz1', 'Pizza Place');
      const itemId = service.items()[0].id;
      service.updateQuantity(itemId, 3);
      expect(service.items()[0].quantity).toBe(3);
      expect(service.items()[0].totalPrice).toBe(39); // (10+3)*3
    });

    it('should remove item when quantity <= 0', () => {
      service.addItem(mockPizza, 1, null, [], 'piz1', 'Pizza Place');
      const itemId = service.items()[0].id;
      service.updateQuantity(itemId, 0);
      expect(service.items().length).toBe(0);
    });
  });

  describe('removeItem()', () => {
    it('should remove a specific item', () => {
      service.addItem(mockPizza, 1, null, [], 'piz1', 'Pizza Place');
      service.addItem(mockPizza2, 1, null, [], 'piz1', 'Pizza Place');
      const itemId = service.items()[0].id;
      service.removeItem(itemId);
      expect(service.items().length).toBe(1);
      expect(service.items()[0].pizza.id).toBe('pizza2');
    });

    it('should call clear() when last item removed', () => {
      service.addItem(mockPizza, 1, null, [], 'piz1', 'Pizza Place');
      const itemId = service.items()[0].id;
      service.removeItem(itemId);
      expect(service.pizzeria()).toBeNull();
    });
  });

  describe('clear()', () => {
    it('should reset all state', () => {
      service.addItem(mockPizza, 2, null, [], 'piz1', 'Pizza Place');
      service.clear();
      expect(service.items()).toEqual([]);
      expect(service.pizzeria()).toBeNull();
      expect(service.isEmpty()).toBe(true);
      expect(service.totalPrice()).toBe(0);
    });
  });
});
