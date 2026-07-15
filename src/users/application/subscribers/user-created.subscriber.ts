import { Injectable } from '@nestjs/common';
import { UserCreatedEvent } from '../../domain';
import { GenerateUserPasswordUseCase } from '../use-cases/generate-user-password.use-case';

@Injectable()
export class UserCreatedSubscriber {
  constructor(
    private readonly generateUserPasswordUseCase: GenerateUserPasswordUseCase,
  ) {}

  async handle(event: UserCreatedEvent): Promise<void> {
    await this.generateUserPasswordUseCase.execute({
      userId: event.userId,
    });
  }
}
