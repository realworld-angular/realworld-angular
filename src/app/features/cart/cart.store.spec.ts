import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { CartStore } from './cart.store';
import { Auth } from '../../core/services/auth';

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
      service.addItem('pizza1', 2, null, [], 'piz1');
      expect(service.items().length).toBe(1);
      expect(service.items()[0].quantity).toBe(2);
      expect(service.isEmpty()).toBe(false);
    });

    it('should set pizzeria', () => {
      service.addItem('pizza1', 1, null, [], 'piz1');
      expect(service.pizzeria()).toEqual({ id: 'piz1' });
    });

    it('should merge same item (same pizza + same options)', () => {
      service.addItem('pizza1', 1, 'size1', [], 'piz1');
      service.addItem('pizza1', 2, 'size1', [], 'piz1');
      expect(service.items().length).toBe(1);
      expect(service.items()[0].quantity).toBe(3);
    });

    it('should add separate items for different sizes', () => {
      service.addItem('pizza1', 1, 'size1', [], 'piz1');
      service.addItem('pizza1', 1, 'size2', [], 'piz1');
      expect(service.items().length).toBe(2);
    });

    it('should add separate items for different toppings', () => {
      service.addItem('pizza1', 1, null, ['top1'], 'piz1');
      service.addItem('pizza1', 1, null, ['top2'], 'piz1');
      expect(service.items().length).toBe(2);
    });

    it('should clear cart when adding from a different pizzeria', () => {
      service.addItem('pizza1', 1, null, [], 'piz1');
      service.addItem('pizza2', 1, null, [], 'piz2');
      expect(service.items().length).toBe(1);
      expect(service.pizzeria()?.id).toBe('piz2');
      expect(service.items()[0].pizzaId).toBe('pizza2');
    });
  });

  describe('hasItemsForOtherPizzeria()', () => {
    it('should be false when cart is empty', () => {
      expect(service.hasItemsForOtherPizzeria('piz1')).toBe(false);
    });

    it('should be false when cart is for the same pizzeria', () => {
      service.addItem('pizza1', 1, null, [], 'piz1');
      expect(service.hasItemsForOtherPizzeria('piz1')).toBe(false);
    });

    it('should be true when cart has items for a different pizzeria', () => {
      service.addItem('pizza1', 1, null, [], 'piz1');
      expect(service.hasItemsForOtherPizzeria('piz2')).toBe(true);
    });
  });

  describe('updateQuantity()', () => {
    it('should update the quantity', () => {
      service.addItem('pizza1', 1, null, [], 'piz1');
      const itemId = service.items()[0].id;
      service.updateQuantity(itemId, 3);
      expect(service.items()[0].quantity).toBe(3);
    });

    it('should remove item when quantity <= 0', () => {
      service.addItem('pizza1', 1, null, [], 'piz1');
      const itemId = service.items()[0].id;
      service.updateQuantity(itemId, 0);
      expect(service.items().length).toBe(0);
    });
  });

  describe('removeItem()', () => {
    it('should remove a specific item', () => {
      service.addItem('pizza1', 1, null, [], 'piz1');
      service.addItem('pizza2', 1, null, [], 'piz1');
      const itemId = service.items()[0].id;
      service.removeItem(itemId);
      expect(service.items().length).toBe(1);
      expect(service.items()[0].pizzaId).toBe('pizza2');
    });

    it('should call clear() when last item removed', () => {
      service.addItem('pizza1', 1, null, [], 'piz1');
      const itemId = service.items()[0].id;
      service.removeItem(itemId);
      expect(service.pizzeria()).toBeNull();
    });
  });

  describe('clear()', () => {
    it('should reset all state', () => {
      service.addItem('pizza1', 2, null, [], 'piz1');
      service.clear();
      expect(service.items()).toEqual([]);
      expect(service.pizzeria()).toBeNull();
      expect(service.isEmpty()).toBe(true);
      expect(service.totalPrice()).toBe(0);
    });
  });
});
