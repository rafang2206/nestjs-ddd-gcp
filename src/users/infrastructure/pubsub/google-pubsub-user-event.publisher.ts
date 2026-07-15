import { PubSub } from '@google-cloud/pubsub';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserCreatedEvent, UserEventPublisher } from '../../domain';
import { PUBSUB } from '../datasource/pubsub.provider';

@Injectable()
export class GooglePubSubUserEventPublisher implements UserEventPublisher {
  private readonly userCreatedTopicName: string;

  constructor(
    @Inject(PUBSUB)
    private readonly pubSub: PubSub,
    configService: ConfigService,
  ) {
    this.userCreatedTopicName =
      configService.get<string>('PUBSUB_USER_CREATED_TOPIC') ?? 'users.created';
  }

  async publishUserCreated(event: UserCreatedEvent): Promise<void> {
    const payload = Buffer.from(JSON.stringify(event.toPrimitives()));

    await this.pubSub.topic(this.userCreatedTopicName).publishMessage({
      data: payload,
      attributes: {
        eventName: UserCreatedEvent.eventName(),
        userId: event.userId,
      },
    });
  }
}
