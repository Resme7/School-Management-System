import {
  Column,CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn,UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { SchoolClass } from '../../classes/entities/school-class.entity';
import { Grade } from '../../grades/entities/grade.entity';

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  firstName: string;

  @Column({ length: 50 })
  lastName: string;

  @Column()
  userId: number;

  @OneToOne(() => User, { onDelete: 'CASCADE', cascade: ['insert', 'update'] })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => SchoolClass, (schoolClass) => schoolClass.teacher)
  classes: SchoolClass[];

  @OneToMany(() => Grade, (grade) => grade.teacher)
  grades: Grade[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
