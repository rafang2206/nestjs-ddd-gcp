import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserUseCase } from '../../application';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserResponse } from './responses/user.response';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  @ApiOperation({
    summary: 'Crear usuario',
    description:
      'Crea un usuario en Firestore y publica un evento en Cloud Pub/Sub. El password se persiste hasheado con bcrypt. Si no se envia password, el subscriber lo genera y actualiza el registro.',
  })
  @ApiCreatedResponse({
    description: 'Usuario creado correctamente.',
    type: UserResponse,
  })
  @ApiBadRequestResponse({
    description: 'Payload invalido.',
  })
  async create(@Body() request: CreateUserDto): Promise<UserResponse> {
    const result = await this.createUserUseCase.execute({
      username: request.username,
      email: request.email,
      password: request.password,
    });

    return UserResponse.fromCreateResult(result);
  }
}
