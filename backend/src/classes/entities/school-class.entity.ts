import {
  Column,CreateDateColumn, Entity, JoinColumn,ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';

@Entity('classes')
export class SchoolClass {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ type: 'int', nullable: true })
  teacherId: number | null;

  @ManyToOne(() => Teacher, (teacher) => teacher.classes, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'teacherId' })
  teacher: Teacher | null;

  @OneToMany(() => Student, (student) => student.schoolClass)
  students: Student[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}
