import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { UsersController } from './controllers/users.controller';
import { OrdersController } from './controllers/orders.controller';
import { PatientsController } from './controllers/patients.controller';
import { AuthController } from './controllers/auth.controller';
import { TrackingController } from './controllers/tracking.controller';
import { RegistrationController } from './controllers/registration.controller';

import { UsersService } from './services/users.service';
import { OrdersService } from './services/orders.service';
import { PatientsService } from './services/patients.service';
import { AuthService } from './services/auth.service';
import { S3UploadService } from './services/s3-upload.service';
import { RegistrationService } from './services/registration.service';

import { User } from './entities/user.entity';
import { OrderRequest } from './entities/order-request.entity';
import { Order } from './entities/order.entity';
import { Patient } from './entities/patient.entity';
import { Address } from './entities/address.entity';
import { ProductList } from './entities/product-list.entity';
import { ProductType } from './entities/product-type.entity';
import { PendingRegistration } from './entities/pending-registration.entity';
import { TrackingService } from './services/tracking.service';

import { UserRepository } from './repositories/user.repository';
import { AddressRepository } from './repositories/address.repository';
import { OrderRequestRepository } from './repositories/order-request.repository';
import { OrderRepository } from './repositories/order.repository';
import { PatientRepository } from './repositories/patient.repository';
import { ProductListRepository } from './repositories/product-list.repository';
import { ProductTypeRepository } from './repositories/product-type.repository';
import { PendingRegistrationRepository } from './repositories/pending-registration.repository';

@Module({
  imports: [
    HttpModule,
    // Load .env FIRST
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // TypeORM must be async to read env correctly
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('DB_HOST');
        const isRds = host?.includes('rds.amazonaws.com');

        return {
          type: 'postgres',

          host,
          port: Number(config.get<number>('DB_PORT')),
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),

          entities: [__dirname + '/**/*.entity{.ts,.js}'],

          // NEVER auto-sync in practice backend
          synchronize: true,

          logging: config.get('NODE_ENV') === 'development',

          // Migrations only
          migrations: [__dirname + '/migrations/*{.ts,.js}'],
          migrationsRun: true,

          // SSL only for AWS RDS
          ssl: isRds ? { rejectUnauthorized: false } : false,

          extra: {
            max: 10,
          },
        };
      },
    }),

    // Register Repositories
    TypeOrmModule.forFeature([
      User,
      OrderRequest,
      Order,
      Patient,
      Address,
      ProductList,
      ProductType,
      PendingRegistration,
    ]),
  ],
  controllers: [
    UsersController,
    OrdersController,
    PatientsController,
    AuthController,
    TrackingController,
    RegistrationController,
  ],
  providers: [
    // Repositories
    UserRepository,
    AddressRepository,
    OrderRequestRepository,
    OrderRepository,
    PatientRepository,
    ProductListRepository,
    ProductTypeRepository,
    PendingRegistrationRepository,

    // Services
    UsersService,
    OrdersService,
    PatientsService,
    AuthService,
    S3UploadService,
    TrackingService,
    RegistrationService,
  ],
})
export class AppModule { }
