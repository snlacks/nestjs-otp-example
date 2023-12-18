import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersHTTPModule } from '../users/usershttp.module';
import { OneTimePassword } from './one-time-password.entity';
import { OneTimePasswordModule } from './one-time-password.module';

@Module({
  imports: [UsersHTTPModule, OneTimePasswordModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
