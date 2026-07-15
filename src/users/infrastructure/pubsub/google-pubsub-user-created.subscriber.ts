import { PubSub, Message } from '@google-cloud/pubsub';
import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserCreatedSubscriber } from '../../application/subscribers/user-created.subscriber';
import { UserCreatedEvent } from '../../domain';
import { PUBSUB } from '../datasource/pubsub.provider';

type UserCreatedMessage = {
  userId: string;
  occurredAt?: string;
};

@Injectable()
export class GooglePubSubUserCreatedSubscriber
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(GooglePubSubUserCreatedSubscriber.name);
  private readonly subscriptionName: string;
  private unsubscribe?: () => void;

  constructor(
    @Inject(PUBSUB)
    private readonly pubSub: PubSub,
    private readonly configService: ConfigService,
    private readonly userCreatedSubscriber: UserCreatedSubscriber,
  ) {
    this.subscriptionName =
      this.configService.get<string>('PUBSUB_USER_CREATED_SUBSCRIPTION') ??
      'users.created.password-generator';
  }

  onModuleInit(): void {
    const subscription = this.pubSub.subscription(this.subscriptionName);

    const messageHandler = (message: Message): void => {
      void this.handleMessage(message);
    };

    subscription.on('message', messageHandler);
    subscription.on('error', (error) => {
      this.logger.error('Pub/Sub user created subscription error', error.stack);
    });

    this.unsubscribe = () =>
      subscription.removeListener('message', messageHandler);
  }

  onModuleDestroy(): void {
    this.unsubscribe?.();
  }

  private async handleMessage(message: Message): Promise<void> {
    try {
      const payload = this.parseMessage(message);

      await this.userCreatedSubscriber.handle(
        new UserCreatedEvent(
          payload.userId,
          payload.occurredAt ? new Date(payload.occurredAt) : new Date(),
        ),
      );

      message.ack();
    } catch (error) {
      this.logger.error(
        'Failed to process user created Pub/Sub message',
        error instanceof Error ? error.stack : String(error),
      );
      message.nack();
    }
  }

  private parseMessage(message: Message): UserCreatedMessage {
    const payload = JSON.parse(message.data.toString()) as UserCreatedMessage;

    if (!payload.userId) {
      throw new Error('User created Pub/Sub message requires userId');
    }

    return payload;
  }
}
