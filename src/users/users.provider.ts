import { DataSource } from 'typeorm';

import { Users } from './entities/users.entity';
import { IssuedTokens } from './entities/issued-tokens.entity';
import { UserSearchAttempts } from './entities/user-search-attempts.entity';

export const usersRepository = [
  {
    provide: 'USERS_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Users),
    inject: ['DATA_SOURCE'],
  },
];

export const issuedTokenRepository = [
  {
    provide: 'ISSUED_TOKENS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(IssuedTokens),
    inject: ['DATA_SOURCE'],
  },
];

export const userSearchAttemptsRepository = [
  {
    provide: 'USER_SEARCH_ATTEMPTS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(UserSearchAttempts),
    inject: ['DATA_SOURCE'],
  },
];
