import type { Address } from '../../shared/models/address.model';
import type { Pizza } from '../pizzerias/models/pizza.models';

export interface PizzaOrderFormDialogData {
  pizza: Pizza;
  pizzeriaId: string;
  displayPizzeriaName: string;
}

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';

/** Snapshot saved on each order line item at checkout time. */
export type OrderItemSelectedOption =
  | { id: string; type: 'SIZE'; label: string; price: number }
  | { id: string; type: 'TOPPING'; label: string; price: number };

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  selectedOptions: OrderItemSelectedOption[];
  pizza: { id: string; name: string };
}

export interface Order {
  id: string;
  deliveryAddress: Address;
  billingAddress: Address | null;
  notes: string | null;
  tipAmount: number;
  scheduledAt: string | null;
  status: OrderStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
  pizzeria: { id: string; name: string; city: string; country: string };
  client: { id: string; name: string };
  items: OrderItem[];
}

export type AdminOrderListItem = Omit<Order, 'deliveryAddress' | 'billingAddress' | 'notes'>;
