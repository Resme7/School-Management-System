import {
 Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany,OneToOne, PrimaryGeneratedColumn,UpdateDateColumn,
} from 'typeorm';
import { SchoolClass } from '../../classes/entities/school-class.entity';
import { Grade } from '../../grades/entities/grade.entity';
import { User } from '../../users/entities/user.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  firstName: string;

  @Column({ length: 50 })
  lastName: string;

  @Column({ type: 'date' })
  dateOfBirth: string;

  @Column()
  userId: number;

  @OneToOne(() => User, { onDelete: 'CASCADE', cascade: ['insert', 'update'] })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'int', nullable: true })
  classId: number | null;

  @ManyToOne(() => SchoolClass, (schoolClass) => schoolClass.students, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'classId' })
  schoolClass: SchoolClass | null;

  @OneToMany(() => Grade, (grade) => grade.student)
  grades: Grade[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
