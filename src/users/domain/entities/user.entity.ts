export type UserPrimitives = {
  id?: string;
  username: string;
  email: string;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export class User {
  private constructor(
    private readonly id: string | undefined,
    private readonly username: string,
    private readonly email: string,
    private readonly password: string | undefined,
    private readonly createdAt: Date,
    private readonly updatedAt: Date,
  ) {
    this.ensureIsValid();
  }

  static create(props: UserPrimitives): User {
    const now = new Date();

    return new User(
      props.id,
      props.username,
      props.email,
      props.password,
      props.createdAt ?? now,
      props.updatedAt ?? now,
    );
  }

  static fromPrimitives(props: UserPrimitives): User {
    return new User(
      props.id,
      props.username,
      props.email,
      props.password,
      props.createdAt ?? new Date(),
      props.updatedAt ?? new Date(),
    );
  }

  withId(id: string): User {
    return new User(
      id,
      this.username,
      this.email,
      this.password,
      this.createdAt,
      new Date(),
    );
  }

  withPassword(password: string): User {
    return new User(
      this.id,
      this.username,
      this.email,
      password,
      this.createdAt,
      new Date(),
    );
  }

  needsPassword(): boolean {
    return !this.password;
  }

  toPrimitives(): Required<Omit<UserPrimitives, 'id' | 'password'>> &
    Pick<UserPrimitives, 'id' | 'password'> {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      password: this.password,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  getId(): string | undefined {
    return this.id;
  }

  getUsername(): string {
    return this.username;
  }

  getEmail(): string {
    return this.email;
  }

  getPassword(): string | undefined {
    return this.password;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  private ensureIsValid(): void {
    if (this.id !== undefined && this.id.trim().length === 0) {
      throw new Error('User id cannot be empty');
    }

    if (this.username.trim().length === 0) {
      throw new Error('Username is required');
    }

    if (!this.isValidEmail(this.email)) {
      throw new Error('Email is invalid');
    }

    if (this.password !== undefined && this.password.trim().length === 0) {
      throw new Error('Password cannot be empty');
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
