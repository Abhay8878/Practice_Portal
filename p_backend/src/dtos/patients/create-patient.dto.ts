import { IsString, IsEmail, IsOptional, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAddressDto } from '../users/create-user.dto'; // Reuse Address DTO

export class CreatePatientDto {
    @IsString()
    firstName: string;

    @IsString()
    @IsOptional()
    middleName?: string;

    @IsString()
    lastName: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    contact?: string;

    @IsDateString()
    dob: string;

    @IsString()
    gender: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => CreateAddressDto)
    address?: CreateAddressDto;

    @IsString()
    @IsOptional()
    tenantId?: string;
}
