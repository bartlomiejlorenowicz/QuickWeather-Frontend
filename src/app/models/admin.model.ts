
export interface AdminStatsResponse {
  activeUsers: number;
  totalUsers: number;
  revenue: number;

}

export interface User {
  id: number;
  name: string;
  email: string;
  enabled: boolean;

}
