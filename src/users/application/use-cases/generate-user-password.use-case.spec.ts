import {
  PasswordGenerator,
  PasswordHasher,
  User,
  UserRepository,
} from '../../domain';
import { GenerateUserPasswordUseCase } from './generate-user-password.use-case';

describe('GenerateUserPasswordUseCase', () => {
  it('generates and stores a hashed password when the user has no password', async () => {
    const user = User.create({
      id: 'user-id',
      username: 'rafaelarias',
      email: 'rafael.arias@example.com',
    });
    const hashedUser = user.withPassword('hashed-password');
    const updatePassword = jest.fn().mockResolvedValue(hashedUser);
    const generatePassword = jest
      .fn()
      .mockReturnValue('plain-generated-password');
    const hashPassword = jest.fn().mockResolvedValue('hashed-password');

    const userRepository: jest.Mocked<UserRepository> = {
      create: jest.fn(),
      findById: jest.fn().mockResolvedValue(user),
      findByUsername: jest.fn(),
      findByEmail: jest.fn(),
      updatePassword,
    };
    const passwordGenerator: jest.Mocked<PasswordGenerator> = {
      generate: generatePassword,
    };
    const passwordHasher: jest.Mocked<PasswordHasher> = {
      hash: hashPassword,
    };

    const useCase = new GenerateUserPasswordUseCase(
      userRepository,
      passwordGenerator,
      passwordHasher,
    );

    const result = await useCase.execute({ userId: 'user-id' });

    expect(generatePassword).toHaveBeenCalledTimes(1);
    expect(hashPassword).toHaveBeenCalledWith('plain-generated-password');
    expect(updatePassword).toHaveBeenCalledWith('user-id', 'hashed-password');
    expect(updatePassword).not.toHaveBeenCalledWith(
      'user-id',
      'plain-generated-password',
    );
    expect(result).toEqual({
      id: 'user-id',
      passwordGenerated: true,
    });
  });

  it('does not generate a new password when the user already has one', async () => {
    const user = User.create({
      id: 'user-id',
      username: 'rafaelarias',
      email: 'rafael.arias@example.com',
      password: 'existing-hash',
    });
    const updatePassword = jest.fn();
    const generatePassword = jest.fn();
    const hashPassword = jest.fn();

    const userRepository: jest.Mocked<UserRepository> = {
      create: jest.fn(),
      findById: jest.fn().mockResolvedValue(user),
      findByUsername: jest.fn(),
      findByEmail: jest.fn(),
      updatePassword,
    };
    const passwordGenerator: jest.Mocked<PasswordGenerator> = {
      generate: generatePassword,
    };
    const passwordHasher: jest.Mocked<PasswordHasher> = {
      hash: hashPassword,
    };

    const useCase = new GenerateUserPasswordUseCase(
      userRepository,
      passwordGenerator,
      passwordHasher,
    );

    const result = await useCase.execute({ userId: 'user-id' });

    expect(generatePassword).not.toHaveBeenCalled();
    expect(hashPassword).not.toHaveBeenCalled();
    expect(updatePassword).not.toHaveBeenCalled();
    expect(result).toEqual({
      id: 'user-id',
      passwordGenerated: false,
    });
  });
});
