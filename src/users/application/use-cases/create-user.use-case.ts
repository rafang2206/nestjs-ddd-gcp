import { ConflictException, Inject, Injectable } from '@nestjs/common';
import {
  PasswordHasher,
  User,
  UserCreatedEvent,
  UserEventPublisher,
  UserRepository,
  PASSWORD_HASHER,
  USER_EVENT_PUBLISHER,
  USER_REPOSITORY,
} from '../../domain';

export type CreateUserCommand = {
  username: string;
  email: string;
  password?: string;
};

export type CreateUserResult = {
  id: string;
  username: string;
  email: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(USER_EVENT_PUBLISHER)
    private readonly userEventPublisher: UserEventPublisher,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(command: CreateUserCommand): Promise<CreateUserResult> {
    const username = this.normalizeUsername(command.username);
    const email = this.normalizeEmail(command.email);

    await this.ensureUserIsUnique(username, email);

    const password = command.password
      ? await this.passwordHasher.hash(command.password)
      : undefined;

    const user = User.create({
      username,
      email,
      password,
    });

    const createdUser = await this.userRepository.create(user);
    const userId = createdUser.getId();

    if (!userId) {
      throw new Error('Created user does not have an id');
    }

    await this.userEventPublisher.publishUserCreated(
      new UserCreatedEvent(userId),
    );

    return this.toResult(createdUser);
  }

  private async ensureUserIsUnique(
    username: string,
    email: string,
  ): Promise<void> {
    const [userWithUsername, userWithEmail] = await Promise.all([
      this.userRepository.findByUsername(username),
      this.userRepository.findByEmail(email),
    ]);

    if (userWithUsername) {
      throw new ConflictException('Username is already registered');
    }

    if (userWithEmail) {
      throw new ConflictException('Email is already registered');
    }
  }

  private normalizeUsername(username: string): string {
    return username.trim().toLowerCase();
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private toResult(user: User): CreateUserResult {
    const userId = user.getId();

    if (!userId) {
      throw new Error('User result requires an id');
    }

    return {
      id: userId,
      username: user.getUsername(),
      email: user.getEmail(),
      password: user.getPassword(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    };
  }
}
