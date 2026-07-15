import { Injectable } from '@nestjs/common';
import { randomInt } from 'node:crypto';
import { PasswordGenerator } from '../../domain';

@Injectable()
export class CryptoPasswordGeneratorService implements PasswordGenerator {
  private readonly defaultLength = 16;
  private readonly lowercase = 'abcdefghijklmnopqrstuvwxyz';
  private readonly uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private readonly numbers = '0123456789';
  private readonly symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  generate(): string {
    const requiredCharacters = [
      this.pick(this.lowercase),
      this.pick(this.uppercase),
      this.pick(this.numbers),
      this.pick(this.symbols),
    ];

    const allCharacters = [
      this.lowercase,
      this.uppercase,
      this.numbers,
      this.symbols,
    ].join('');

    const remainingCharacters = Array.from(
      { length: this.defaultLength - requiredCharacters.length },
      () => this.pick(allCharacters),
    );

    return this.shuffle([...requiredCharacters, ...remainingCharacters]).join(
      '',
    );
  }

  private pick(characters: string): string {
    return characters[randomInt(0, characters.length)];
  }

  private shuffle(characters: string[]): string[] {
    return characters
      .map((character) => ({ character, weight: randomInt(0, 1_000_000) }))
      .sort((left, right) => left.weight - right.weight)
      .map(({ character }) => character);
  }
}
