import { Address } from '../entities/address.entity';

export interface PatientResponse {
    id: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    email: string;
    contact: string;
    dob: Date;
    gender: string;
    tenantId: string | null;
    createdAt: Date;
    updatedAt: Date;
    addresses: Address[];
}
