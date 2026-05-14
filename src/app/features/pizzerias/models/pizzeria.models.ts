import type { StaffMember } from './staff.models';

export interface PizzeriaOwner {
  id: string;
  name: string;
}

export interface PizzeriaSummary {
  id: string;
  name: string;
  city: string;
  country: string;
  image: string;
  owner: PizzeriaOwner;
  _count: { pizzas: number };
  createdAt: string;
}

export interface PizzeriaDetail extends PizzeriaSummary {
  staff: StaffMember[];
}
