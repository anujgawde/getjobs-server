import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { UserSearchAttempts } from './user-search-attempts.entity';
import { JobSearches } from 'src/scraper/entities/job-searches.entity';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number; // Auto-increment primary key

  @Column()
  email: string;

  @Column()
  verified: boolean;

  @OneToMany(() => UserSearchAttempts, (userSearch) => userSearch.user)
  searches: UserSearchAttempts[];

  @OneToMany(() => JobSearches, (jobSearch) => jobSearch.user)
  jobSearches: JobSearches[];
}
