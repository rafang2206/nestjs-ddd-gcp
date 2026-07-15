import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { Firestore, getFirestore } from 'firebase-admin/firestore';

export const FIRESTORE = Symbol('FIRESTORE');

export const firebaseAdminProvider: Provider<Firestore> = {
  provide: FIRESTORE,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): Firestore => {
    const projectId = configService.get<string>('FIREBASE_PROJECT_ID');
    const isEmulator = Boolean(
      configService.get<string>('FIRESTORE_EMULATOR_HOST'),
    );

    if (getApps().length === 0) {
      initializeApp({
        projectId,
        ...(isEmulator ? {} : { credential: applicationDefault() }),
      });
    }

    return getFirestore();
  },
};
