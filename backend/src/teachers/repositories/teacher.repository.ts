import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Teacher } from '../entities/teacher.entity';

@Injectable()
export class TeacherRepository {
  constructor(
    @InjectRepository(Teacher)
    private readonly repository: Repository<Teacher>,
  ) {}

  findAll(): Promise<Teacher[]> {
    return this.repository.find({
      relations: { user: true, classes: true },
      order: { lastName: 'ASC', firstName: 'ASC' },
    });
  }

  findById(id: number): Promise<Teacher | null> {
    return this.repository.findOne({
      where: { id },
      relations: { user: true, classes: true },
    });
  }

  build(data: DeepPartial<Teacher>): Teacher {
    return this.repository.create(data);
  }

  save(teacher: Teacher): Promise<Teacher> {
    return this.repository.save(teacher);
  }
}
