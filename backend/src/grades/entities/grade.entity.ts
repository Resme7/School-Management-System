import {
  Check,Column,CreateDateColumn,Entity,Index,JoinColumn,ManyToOne, OneToMany, OneToOne,PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';

@Entity('grades')
@Check('"value" BETWEEN 1 AND 10')
export class Grade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  subject: string;

  @Column({ type: 'smallint' })
  value: number;

  @Column({ type: 'date' })
  date: string;

  @Index()
  @Column()
  studentId: number;

  @ManyToOne(() => Student, (student) => student.grades, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ type: 'int', nullable: true })
  teacherId: number | null;

  @ManyToOne(() => Teacher, (teacher) => teacher.grades, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'teacherId' })
  teacher: Teacher | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
