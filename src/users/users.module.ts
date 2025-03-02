import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { databaseProviders } from 'src/database/database.provider';
import {
  issuedTokenRepository,
  userSearchAttemptsRepository,
  usersRepository,
} from './users.provider';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    ...databaseProviders,
    ...usersRepository,
    ...issuedTokenRepository,
    ...userSearchAttemptsRepository,
  ],
})
export class UsersModule {}
