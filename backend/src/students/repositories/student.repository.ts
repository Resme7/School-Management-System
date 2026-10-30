import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Student } from '../entities/student.entity';

@Injectable()
export class StudentRepository {
  constructor(
    @InjectRepository(Student)
    private readonly repository: Repository<Student>,
  ) {}

  findAll(): Promise<Student[]> {
    return this.repository.find({
      relations: { user: true, schoolClass: true },
      order: { lastName: 'ASC', firstName: 'ASC' },
    });
  }

  findById(id: number): Promise<Student | null> {
    return this.repository.findOne({
      where: { id },
      relations: { user: true, schoolClass: true },
    });
  }

  findByUserId(userId: number): Promise<Student | null> {
    return this.repository.findOne({
      where: { userId },
      relations: { user: true, schoolClass: { teacher: { user: true } } },
    });
  }

  build(data: DeepPartial<Student>): Student {
    return this.repository.create(data);
  }

  save(student: Student): Promise<Student> {
    return this.repository.save(student);
  }

  async updateClass(id: number, classId: number | null): Promise<void> {
    await this.repository.update(id, { classId });
  }
}
