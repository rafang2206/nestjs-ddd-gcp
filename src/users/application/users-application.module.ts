import { Module } from '@nestjs/common';
import { UsersInfrastructureModule } from '../infrastructure';
import { GooglePubSubUserCreatedSubscriber } from '../infrastructure/pubsub/google-pubsub-user-created.subscriber';
import { UserCreatedSubscriber } from './subscribers/user-created.subscriber';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { GenerateUserPasswordUseCase } from './use-cases/generate-user-password.use-case';

@Module({
  imports: [UsersInfrastructureModule],
  providers: [
    CreateUserUseCase,
    GenerateUserPasswordUseCase,
    UserCreatedSubscriber,
    GooglePubSubUserCreatedSubscriber,
  ],
  exports: [CreateUserUseCase, GenerateUserPasswordUseCase],
})
export class UsersApplicationModule {}
