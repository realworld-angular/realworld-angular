export interface SelectedPizzaOption {
  id: string;
  label: string;
  price: number;
}

export interface PizzaOption {
  id: string;
  label: string;
  price: number;
  sortOrder: number;
}

export interface Pizza {
  id: string;
  name: string;
  basePrice: number;
  image: string;
  createdAt: string;
  toppings: PizzaOption[];
}
