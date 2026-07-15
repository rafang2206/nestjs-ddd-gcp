import { Inject, Injectable } from '@nestjs/common';
import {
  DocumentSnapshot,
  Firestore,
  Timestamp,
} from 'firebase-admin/firestore';
import { User, UserRepository } from '../../domain';
import { FIRESTORE } from '../datasource/firebase-admin.provider';

type FirestoreUserDocument = {
  username: string;
  email: string;
  password?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
};

@Injectable()
export class FirestoreUserRepository implements UserRepository {
  private readonly collectionName = 'users';

  constructor(
    @Inject(FIRESTORE)
    private readonly firestore: Firestore,
  ) {}

  async create(user: User): Promise<User> {
    const primitives = user.toPrimitives();
    const now = Timestamp.now();

    const document = await this.firestore.collection(this.collectionName).add({
      username: primitives.username,
      email: primitives.email,
      ...(primitives.password ? { password: primitives.password } : {}),
      createdAt: primitives.createdAt ?? now,
      updatedAt: primitives.updatedAt ?? now,
    });

    return user.withId(document.id);
  }

  async findById(id: string): Promise<User | null> {
    const snapshot = await this.firestore
      .collection(this.collectionName)
      .doc(id)
      .get();

    if (!snapshot.exists) {
      return null;
    }

    return this.mapSnapshotToUser(snapshot);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.findOneByField('username', username);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOneByField('email', email);
  }

  async updatePassword(id: string, password: string): Promise<User> {
    const documentReference = this.firestore
      .collection(this.collectionName)
      .doc(id);

    await documentReference.update({
      password,
      updatedAt: Timestamp.now(),
    });

    const updatedSnapshot = await documentReference.get();

    return this.mapSnapshotToUser(updatedSnapshot);
  }

  private async findOneByField(
    field: 'username' | 'email',
    value: string,
  ): Promise<User | null> {
    const snapshot = await this.firestore
      .collection(this.collectionName)
      .where(field, '==', value)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    return this.mapSnapshotToUser(snapshot.docs[0]);
  }

  private mapSnapshotToUser(snapshot: DocumentSnapshot): User {
    const data = snapshot.data() as FirestoreUserDocument | undefined;

    if (!data) {
      throw new Error(`User with id ${snapshot.id} was not found`);
    }

    return User.fromPrimitives({
      id: snapshot.id,
      username: data.username,
      email: data.email,
      password: data.password,
      createdAt: this.toDate(data.createdAt),
      updatedAt: this.toDate(data.updatedAt),
    });
  }

  private toDate(value: Timestamp | Date): Date {
    return value instanceof Date ? value : value.toDate();
  }
}
