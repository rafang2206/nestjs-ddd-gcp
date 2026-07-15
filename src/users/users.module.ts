import { Module } from '@nestjs/common';
import { UsersApplicationModule } from './application';
import { UsersController } from './presentation/http/users.controller';

@Module({
  imports: [UsersApplicationModule],
  controllers: [UsersController],
})
export class UsersModule {}
