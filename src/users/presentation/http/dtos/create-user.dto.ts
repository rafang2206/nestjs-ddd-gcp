import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nombre de usuario.',
    example: 'rafaelarias',
  })
  @IsString()
  @MinLength(1)
  username: string;

  @ApiProperty({
    description: 'Correo electronico del usuario.',
    example: 'rafael.arias@example.com',
  })
  @IsEmail(
    {},
    {
      message: 'Email must be a valid email address.',
    },
  )
  email: string;

  @ApiPropertyOptional({
    description:
      'Password inicial. Se almacena hasheado con bcrypt. Si no se envia, sera generado de forma asincrona por Cloud Pub/Sub.',
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character.',
    },
  )
  password?: string;
}
