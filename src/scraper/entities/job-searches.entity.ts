import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Users } from '../../users/entities/users.entity'; // Import the User entity

@Entity('job_searches')
export class JobSearches {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  keyword: string;

  @Column()
  location: string;

  @Column({ name: 'date_posted' })
  datePosted: string;

  @Column({ name: 'experience_level' })
  experienceLevel: string;

  @Column({ name: 'job_type' })
  jobType: string;

  @Column()
  salary: number;

  @Column({ name: 'work_mode' })
  workMode: string;

  @ManyToOne(() => Users, (user) => user.jobSearches, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' }) // Custom column name for the foreign key
  user: Users;
}
