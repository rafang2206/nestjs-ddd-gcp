import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  PasswordGenerator,
  PasswordHasher,
  UserRepository,
  PASSWORD_GENERATOR,
  PASSWORD_HASHER,
  USER_REPOSITORY,
} from '../../domain';

export type GenerateUserPasswordCommand = {
  userId: string;
};

export type GenerateUserPasswordResult = {
  id: string;
  passwordGenerated: boolean;
};

@Injectable()
export class GenerateUserPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(PASSWORD_GENERATOR)
    private readonly passwordGenerator: PasswordGenerator,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(
    command: GenerateUserPasswordCommand,
  ): Promise<GenerateUserPasswordResult> {
    const user = await this.userRepository.findById(command.userId);

    if (!user) {
      throw new NotFoundException(`User ${command.userId} was not found`);
    }

    if (!user.needsPassword()) {
      return {
        id: command.userId,
        passwordGenerated: false,
      };
    }

    const password = this.passwordGenerator.generate();
    const hashedPassword = await this.passwordHasher.hash(password);
    const updatedUser = await this.userRepository.updatePassword(
      command.userId,
      hashedPassword,
    );

    const updatedUserId = updatedUser.getId();

    if (!updatedUserId) {
      throw new Error('Updated user does not have an id');
    }

    return {
      id: updatedUserId,
      passwordGenerated: true,
    };
  }
}
