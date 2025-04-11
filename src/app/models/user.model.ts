export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  enabled: boolean;
  roles: string[];
}
