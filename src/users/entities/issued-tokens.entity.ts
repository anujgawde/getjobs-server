import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class IssuedTokens {
  @PrimaryColumn()
  id: string;

  @Column()
  email: string;

  @Column()
  token: string;
}
