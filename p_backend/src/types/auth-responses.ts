export interface LoginResponse {
  accessToken: string;
  practitionerType: string;
  userId: string;
  tenantId: string;
  addressId: number | null;
}
