import { PubSub } from '@google-cloud/pubsub';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const PUBSUB = Symbol('PUBSUB');

export const pubSubProvider: Provider<PubSub> = {
  provide: PUBSUB,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): PubSub => {
    return new PubSub({
      projectId:
        configService.get<string>('GOOGLE_CLOUD_PROJECT_ID') ??
        configService.get<string>('FIREBASE_PROJECT_ID'),
    });
  },
};
