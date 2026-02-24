import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsObject,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PractitionerType } from '../../entities/user.entity';

export class CreateAddressDto {
  @IsString()
  @IsOptional()
  house_no?: string;

  @IsString()
  @IsOptional()
  street?: string;

  @IsNotEmpty({ message: 'At least one address is required' })
  @IsString()
  city: string;

  @IsNotEmpty({ message: 'At least one address is required' })
  @IsString()
  state: string;

  @IsNotEmpty({ message: 'At least one address is required' })
  @IsString()
  country: string;

  @IsString()
  @IsOptional()
  countryCode?: string;

  @IsString()
  @IsOptional()
  zipCode?: string;

  @IsString()
  @IsOptional()
  address_type?: string;
}

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  @IsOptional()
  middleName?: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  gender: string;

  @IsEnum(PractitionerType)
  practitionerType: PractitionerType;

  @IsString()
  @IsOptional()
  specialization?: string;

  @IsString()
  @IsOptional()
  password?: string; // Optional because we generate it if missing, but typically required? Service logic says it generates.

  @IsObject({ message: 'At least one address is required' })
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;

  @IsString()
  @IsOptional()
  tenantId?: string;
}
