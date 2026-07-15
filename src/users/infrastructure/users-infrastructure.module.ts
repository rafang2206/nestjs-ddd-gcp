import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  PASSWORD_HASHER,
  PASSWORD_GENERATOR,
  USER_EVENT_PUBLISHER,
  USER_REPOSITORY,
} from '../domain';
import { firebaseAdminProvider } from './datasource/firebase-admin.provider';
import { PUBSUB, pubSubProvider } from './datasource/pubsub.provider';
import { GooglePubSubUserEventPublisher } from './pubsub/google-pubsub-user-event.publisher';
import { FirestoreUserRepository } from './repository/firestore-user.repository';
import { BcryptPasswordHasherService } from './security/bcrypt-password-hasher.service';
import { CryptoPasswordGeneratorService } from './security/crypto-password-generator.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [
    firebaseAdminProvider,
    pubSubProvider,
    FirestoreUserRepository,
    BcryptPasswordHasherService,
    CryptoPasswordGeneratorService,
    GooglePubSubUserEventPublisher,
    {
      provide: USER_REPOSITORY,
      useExisting: FirestoreUserRepository,
    },
    {
      provide: PASSWORD_GENERATOR,
      useExisting: CryptoPasswordGeneratorService,
    },
    {
      provide: PASSWORD_HASHER,
      useExisting: BcryptPasswordHasherService,
    },
    {
      provide: USER_EVENT_PUBLISHER,
      useExisting: GooglePubSubUserEventPublisher,
    },
  ],
  exports: [
    USER_REPOSITORY,
    PASSWORD_GENERATOR,
    PASSWORD_HASHER,
    USER_EVENT_PUBLISHER,
    PUBSUB,
  ],
})
export class UsersInfrastructureModule {}
