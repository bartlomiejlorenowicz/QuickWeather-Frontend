export interface AdminUserDTO {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  enabled: boolean;
  lockUntil?: string | null;
}
