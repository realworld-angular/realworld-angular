import { Role } from '../../features/auth/role.model';

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
}
