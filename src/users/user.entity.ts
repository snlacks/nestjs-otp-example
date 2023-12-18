import { IsEmail, IsNotEmpty, IsPhoneNumber } from 'class-validator';
import { Entity, Column, Index, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn()
  @Index({ unique: true })
  @IsEmail()
  @IsNotEmpty()
  username: string;

  @Column()
  @IsPhoneNumber()
  @IsNotEmpty()
  phoneNumber: string;
}
