import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  BaseEntity,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { User } from "./user";

/**
 * Student transaction information
 */

@Entity("installments")
export class Transactions extends BaseEntity {
  Transactions() {}
  @PrimaryColumn("string")
  id: string;
  @Column({ type: "text" })
  user_id: string;
  @Column({ type: "text" })
  first_name: string;
  @Column({ type: "text" })
  last_name: string;
  @Column({ type: "text" })
  email: string;
  @Column({ type: "number" })
  type: number;
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
  @OneToOne((type) => User, (user) => user.id)
  @JoinColumn({ name: "user_id" })
  user: User;
}
