import { ApiProperty } from '@nestjs/swagger';
import { CreateUserResult } from '../../../application';

export class UserResponse {
  @ApiProperty({
    description: 'Identificador generado por Firestore.',
    example: '3OV6a9vY1LWlHhHN9yOa',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre de usuario.',
    example: 'rafaelarias',
  })
  username: string;

  @ApiProperty({
    description: 'Correo electronico del usuario.',
    example: 'rafael.arias@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Fecha de creacion en formato ISO 8601.',
    example: '2026-07-14T22:02:50.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Fecha de ultima actualizacion en formato ISO 8601.',
    example: '2026-07-14T22:02:50.000Z',
  })
  updatedAt: string;

  static fromCreateResult(result: CreateUserResult): UserResponse {
    return {
      id: result.id,
      username: result.username,
      email: result.email,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  }
}
