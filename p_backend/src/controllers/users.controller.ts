import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dtos/users/create-user.dto';
import { UpdateUserDto } from '../dtos/users/update-user.dto';
import { User } from '../entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  /* ---------- CREATE USER ---------- */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateUserDto): Promise<User> {
    return this.usersService.create(dto);
  }

  /* ---------- GET ALL USERS ---------- */
  @Get()
  async findAll(
    @Query('practitionerType') practitionerType?: string,
    @Query('tenantId') tenantId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    if (page && limit) {
      return this.usersService.findAllPaginated(
        parseInt(page),
        parseInt(limit),
        practitionerType,
        tenantId,
      );
    }
    return this.usersService.findAll(practitionerType, tenantId);
  }

  /* ---------- GET SINGLE USER ---------- */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  /* ---------- UPDATE USER ---------- */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, dto);
  }

  /* ---------- DELETE USER ---------- */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<null> {
    await this.usersService.remove(id);
    return null;
  }
}
