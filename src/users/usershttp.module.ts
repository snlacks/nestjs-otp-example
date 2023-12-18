import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersModule } from './users.module';
import { UsersController } from './users.controller';
@Module({
  imports: [UsersModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersHTTPModule {}
