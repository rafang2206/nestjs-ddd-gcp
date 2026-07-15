export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly occurredAt: Date = new Date(),
  ) {
    if (userId.trim().length === 0) {
      throw new Error('User created event requires a user id');
    }
  }

  static eventName(): string {
    return 'users.created';
  }

  toPrimitives(): {
    eventName: string;
    userId: string;
    occurredAt: string;
  } {
    return {
      eventName: UserCreatedEvent.eventName(),
      userId: this.userId,
      occurredAt: this.occurredAt.toISOString(),
    };
  }
}
