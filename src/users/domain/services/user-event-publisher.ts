import { UserCreatedEvent } from '../events/user-created.event';

export interface UserEventPublisher {
  publishUserCreated(event: UserCreatedEvent): Promise<void>;
}
