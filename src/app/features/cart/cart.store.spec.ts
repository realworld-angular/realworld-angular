import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CartStore, CartData } from './cart.store';

const mockCartData: CartData = {
  pizzeria: { id: 'p1', name: 'Roma', image: 'roma.jpg' },
  items: [
    {
      id: 'item1',
      pizza: { id: 'pizza1', name: 'Margherita', image: 'marg.jpg', basePrice: 9.5 },
      quantity: 2,
      size: { id: 's1', label: 'Large', price: 2 },
      extraToppings: [],
      totalPrice: 23,
    },
  ],
  total: 23,
};

describe('CartStore', () => {
  let store: CartStore;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    store = TestBed.inject(CartStore);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('initial state', () => {
    it('should have empty items', () => {
      expect(store.items()).toEqual([]);
    });

    it('should have null pizzeria', () => {
      expect(store.pizzeria()).toBeNull();
    });

    it('should be empty', () => {
      expect(store.isEmpty()).toBe(true);
    });

    it('should not make an HTTP request when cart is empty', () => {
      TestBed.flushEffects();
      httpTesting.expectNone(() => true);
    });
  });

  describe('addItem()', () => {
    it('should add an item and set the pizzeria', () => {
      store.addItem('pizza1', 1, 's1', [], 'p1');
      expect(store.items().length).toBe(1);
      expect(store.pizzeria()).toEqual({ id: 'p1' });
      expect(store.isEmpty()).toBe(false);
    });

    it('should increment quantity when adding same item again', () => {
      store.addItem('pizza1', 1, 's1', [], 'p1');
      store.addItem('pizza1', 2, 's1', [], 'p1');
      expect(store.items().length).toBe(1);
      expect(store.items()[0].quantity).toBe(3);
      httpTesting.match((r) => r.url.includes('/api/orders/cart')).forEach((r) => r.flush(mockCartData));
    });

    it('should clear and reset when adding item from different pizzeria', () => {
      store.addItem('pizza1', 1, null, [], 'p1');
      store.addItem('pizza2', 1, null, [], 'p2');
      expect(store.pizzeria()).toEqual({ id: 'p2' });
      expect(store.items().length).toBe(1);
      httpTesting.match((r) => r.url.includes('/api/orders/cart')).forEach((r) => r.flush(mockCartData));
    });

    it('should trigger a POST to /api/orders/cart after adding item', () => {
      store.addItem('pizza1', 1, 's1', [], 'p1');
      TestBed.flushEffects();
      const req = httpTesting.expectOne((r) => r.url.includes('/api/orders/cart'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body.pizzeriaId).toBe('p1');
      req.flush(mockCartData);
    });
  });

  describe('updateQuantity()', () => {
    beforeEach(() => {
      store.addItem('pizza1', 2, null, [], 'p1');
      httpTesting.match((r) => r.url.includes('/api/orders/cart')).forEach((r) => r.flush(mockCartData));
    });

    it('should update the quantity of an existing item', () => {
      const itemId = store.items()[0].id;
      store.updateQuantity(itemId, 5);
      expect(store.items()[0].quantity).toBe(5);
      httpTesting.match((r) => r.url.includes('/api/orders/cart')).forEach((r) => r.flush(mockCartData));
    });

    it('should remove item when quantity set to 0', () => {
      const itemId = store.items()[0].id;
      store.updateQuantity(itemId, 0);
      expect(store.items().length).toBe(0);
      expect(store.isEmpty()).toBe(true);
    });
  });

  describe('removeItem()', () => {
    it('should remove the item from the cart', () => {
      store.addItem('pizza1', 1, null, [], 'p1');
      httpTesting.match((r) => r.url.includes('/api/orders/cart')).forEach((r) => r.flush(mockCartData));
      const itemId = store.items()[0].id;
      store.removeItem(itemId);
      expect(store.items().length).toBe(0);
    });

    it('should clear pizzeria when last item is removed', () => {
      store.addItem('pizza1', 1, null, [], 'p1');
      httpTesting.match((r) => r.url.includes('/api/orders/cart')).forEach((r) => r.flush(mockCartData));
      const itemId = store.items()[0].id;
      store.removeItem(itemId);
      expect(store.pizzeria()).toBeNull();
    });
  });

  describe('clear()', () => {
    it('should reset items and pizzeria', () => {
      store.addItem('pizza1', 1, null, [], 'p1');
      httpTesting.match((r) => r.url.includes('/api/orders/cart')).forEach((r) => r.flush(mockCartData));
      store.clear();
      expect(store.items()).toEqual([]);
      expect(store.pizzeria()).toBeNull();
      expect(store.isEmpty()).toBe(true);
    });
  });

  describe('hasItemsForOtherPizzeria()', () => {
    it('should return false when cart is empty', () => {
      expect(store.hasItemsForOtherPizzeria('p1')).toBe(false);
    });

    it('should return false when pizzeria matches', () => {
      store.addItem('pizza1', 1, null, [], 'p1');
      httpTesting.match((r) => r.url.includes('/api/orders/cart')).forEach((r) => r.flush(mockCartData));
      expect(store.hasItemsForOtherPizzeria('p1')).toBe(false);
    });

    it('should return true when pizzeria differs', () => {
      store.addItem('pizza1', 1, null, [], 'p1');
      httpTesting.match((r) => r.url.includes('/api/orders/cart')).forEach((r) => r.flush(mockCartData));
      expect(store.hasItemsForOtherPizzeria('p2')).toBe(true);
    });
  });

  describe('cart value from httpResource', () => {
    it('should post cart body with correct pizzeriaId and items', () => {
      store.addItem('pizza1', 2, 's1', ['t1'], 'p1');
      TestBed.flushEffects();
      const req = httpTesting.expectOne((r) => r.url.includes('/api/orders/cart'));
      expect(req.request.body.pizzeriaId).toBe('p1');
      expect(req.request.body.items[0].pizzaId).toBe('pizza1');
      expect(req.request.body.items[0].quantity).toBe(2);
      req.flush(mockCartData);
    });

    it('should not make a request when cart returns undefined (empty)', () => {
      TestBed.flushEffects();
      httpTesting.expectNone((r) => r.url.includes('/api/orders/cart'));
    });
  });
});
