import { DataSource } from 'typeorm';

import { JobSearches } from './entities/job-searches.entity';

export const jobSearchesRepository = [
  {
    provide: 'JOB_SEARCHES_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(JobSearches),
    inject: ['DATA_SOURCE'],
  },
];
