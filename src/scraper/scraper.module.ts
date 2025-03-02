import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ScraperController } from './scraper.controller';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';
import { databaseProviders } from 'src/database/database.provider';
import {
  issuedTokenRepository,
  userSearchAttemptsRepository,
  usersRepository,
} from 'src/users/users.provider';
import { jobSearchesRepository } from './scraper.provider';

@Module({
  controllers: [ScraperController],
  providers: [
    ScraperService,
    UsersService,
    ...databaseProviders,
    ...usersRepository,
    ...issuedTokenRepository,
    ...userSearchAttemptsRepository,
    ...jobSearchesRepository,
  ],
})
export class ScraperModule {}
