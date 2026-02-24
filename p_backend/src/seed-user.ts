import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, PractitionerType } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const userRepository = app.get<Repository<User>>(
      getRepositoryToken(User),
    );

    const existingUser = await userRepository.findOne({
      where: { email: 'admin@example.com' },
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);

      const user = userRepository.create({
        firstName: 'Admin',
        middleName: null,
        lastName: 'User',
        email: 'admin@example.com',
        phoneNumber: '1234567890',
        gender: 'other',
        practitionerType: PractitionerType.ADMIN,
        specialization: null,
        password: hashedPassword,
      });

      await userRepository.save(user);
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
  } catch (err) {
    console.error('❌ Seeding error:', err);
  } finally {
    await app.close();
  }
}

seed();
