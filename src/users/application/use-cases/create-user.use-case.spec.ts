import { ConflictException } from '@nestjs/common';
import {
  PasswordHasher,
  User,
  UserEventPublisher,
  UserRepository,
} from '../../domain';
import { CreateUserUseCase } from './create-user.use-case';

describe('CreateUserUseCase', () => {
  it('hashes the provided password before creating the user', async () => {
    const createUser = jest.fn((user: User) =>
      Promise.resolve(user.withId('user-id')),
    );
    const hashPassword = jest.fn().mockResolvedValue('hashed-password');
    const userRepository: jest.Mocked<UserRepository> = {
      create: createUser,
      findById: jest.fn(),
      findByUsername: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn().mockResolvedValue(null),
      updatePassword: jest.fn(),
    };
    const userEventPublisher: jest.Mocked<UserEventPublisher> = {
      publishUserCreated: jest.fn(),
    };
    const passwordHasher: jest.Mocked<PasswordHasher> = {
      hash: hashPassword,
    };

    const useCase = new CreateUserUseCase(
      userRepository,
      userEventPublisher,
      passwordHasher,
    );

    await useCase.execute({
      username: 'rafaelarias',
      email: 'rafael.arias@example.com',
      password: 'plain-password',
    });

    expect(hashPassword).toHaveBeenCalledWith('plain-password');
    const createdUser = createUser.mock.calls[0][0];
    expect(createdUser.getPassword()).toBe('hashed-password');
    expect(createdUser.getPassword()).not.toBe('plain-password');
    expect(createdUser.getUsername()).toBe('rafaelarias');
    expect(createdUser.getEmail()).toBe('rafael.arias@example.com');
  });

  it('throws conflict when the username is already registered', async () => {
    const existingUser = User.create({
      id: 'existing-user-id',
      username: 'rafaelarias',
      email: 'other@example.com',
    });
    const createUser = jest.fn();
    const publishUserCreated = jest.fn();
    const hashPassword = jest.fn();
    const userRepository: jest.Mocked<UserRepository> = {
      create: createUser,
      findById: jest.fn(),
      findByUsername: jest.fn().mockResolvedValue(existingUser),
      findByEmail: jest.fn().mockResolvedValue(null),
      updatePassword: jest.fn(),
    };
    const userEventPublisher: jest.Mocked<UserEventPublisher> = {
      publishUserCreated,
    };
    const passwordHasher: jest.Mocked<PasswordHasher> = {
      hash: hashPassword,
    };

    const useCase = new CreateUserUseCase(
      userRepository,
      userEventPublisher,
      passwordHasher,
    );

    await expect(
      useCase.execute({
        username: ' RafaelArias ',
        email: 'rafael.arias@example.com',
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(createUser).not.toHaveBeenCalled();
    expect(publishUserCreated).not.toHaveBeenCalled();
    expect(hashPassword).not.toHaveBeenCalled();
  });

  it('throws conflict when the email is already registered', async () => {
    const existingUser = User.create({
      id: 'existing-user-id',
      username: 'other',
      email: 'rafael.arias@example.com',
    });
    const createUser = jest.fn();
    const publishUserCreated = jest.fn();
    const hashPassword = jest.fn();
    const userRepository: jest.Mocked<UserRepository> = {
      create: createUser,
      findById: jest.fn(),
      findByUsername: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn().mockResolvedValue(existingUser),
      updatePassword: jest.fn(),
    };
    const userEventPublisher: jest.Mocked<UserEventPublisher> = {
      publishUserCreated,
    };
    const passwordHasher: jest.Mocked<PasswordHasher> = {
      hash: hashPassword,
    };

    const useCase = new CreateUserUseCase(
      userRepository,
      userEventPublisher,
      passwordHasher,
    );

    await expect(
      useCase.execute({
        username: 'rafaelarias',
        email: ' Rafael.Arias@Example.com ',
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(createUser).not.toHaveBeenCalled();
    expect(publishUserCreated).not.toHaveBeenCalled();
    expect(hashPassword).not.toHaveBeenCalled();
  });
});
