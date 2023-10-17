import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { PropertyModule } from './property/property.module';
import { MailerModule } from './mailer/mailer.module';
import { CronModule } from './cron/cron.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    PrismaModule,
    PropertyModule,
    MailerModule,
    CronModule,
  ],
})
export class AppModule {}
