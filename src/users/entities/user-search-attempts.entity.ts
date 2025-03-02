import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Users } from './users.entity';

@Entity()
export class UserSearchAttempts {
  @PrimaryGeneratedColumn()
  id: number; // Auto-increment primary key

  @ManyToOne(() => Users, (user) => user.searches)
  @JoinColumn({ name: 'user_id' }) // Custom column name for the foreign key
  user: Users; // TypeORM will automatically create the `user_id` foreign key column

  @Column({ default: 0, name: 'search_count' })
  searchCount: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'first_search_timestamp',
  })
  firstSearchTimestamp: Date;
}
