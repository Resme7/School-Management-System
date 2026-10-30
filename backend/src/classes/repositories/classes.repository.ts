import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Not, Repository } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { SchoolClass } from '../entities/school-class.entity';

@Injectable()
export class ClassesRepository {
  constructor(
    @InjectRepository(SchoolClass)
    private readonly classes: Repository<SchoolClass>,
    @InjectRepository(Student)
    private readonly students: Repository<Student>,
  ) {}

  findAll(teacherId?: number): Promise<SchoolClass[]> {
    return this.classes.find({
      where: teacherId ? { teacherId } : {},
      relations: { teacher: true, students: true },
      order: { name: 'ASC' },
    });
  }

  findById(id: number): Promise<SchoolClass | null> {
    return this.classes.findOne({
      where: { id },
      relations: { teacher: true, students: { user: true } },
      order: { students: { lastName: 'ASC', firstName: 'ASC' } },
    });
  }

  isNameTaken(name: string, excludeId?: number): Promise<boolean> {
    return this.classes.exists({
      where: excludeId ? { name, id: Not(excludeId) } : { name },
    });
  }

  build(data: DeepPartial<SchoolClass>): SchoolClass {
    return this.classes.create(data);
  }

  save(schoolClass: SchoolClass): Promise<SchoolClass> {
    return this.classes.save(schoolClass);
  }

  async update(
    id: number,
    data: { name?: string; teacherId?: number | null },
  ): Promise<void> {
    await this.classes.update(id, data);
  }

  async delete(id: number): Promise<void> {
    await this.classes.delete(id);
  }

  findStudentsByIds(ids: number[]): Promise<Student[]> {
    return this.students.find({ where: { id: In(ids) } });
  }

  findStudentById(id: number): Promise<Student | null> {
    return this.students.findOne({ where: { id } });
  }

  async setStudentsClass(
    studentIds: number[],
    classId: number | null,
  ): Promise<void> {
    await this.students.update({ id: In(studentIds) }, { classId });
  }
}
