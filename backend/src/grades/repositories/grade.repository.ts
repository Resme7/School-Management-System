import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Grade } from '../entities/grade.entity';

export interface GradeFilters {
  studentId?: number;
  classId?: number;
  subject?: string;
  classTeacherId?: number;
}

const gradeRelations = { student: { schoolClass: true }, teacher: true };

@Injectable()
export class GradeRepository {
  constructor(
    @InjectRepository(Grade)
    private readonly repository: Repository<Grade>,
  ) {}

  findAll(filters: GradeFilters): Promise<Grade[]> {
    const where: FindOptionsWhere<Grade> = {};
    if (filters.studentId) where.studentId = filters.studentId;
    if (filters.subject) where.subject = ILike(filters.subject.trim());

    const studentWhere: FindOptionsWhere<Grade['student']> = {};
    if (filters.classId) studentWhere.classId = filters.classId;
    if (filters.classTeacherId)
      studentWhere.schoolClass = { teacherId: filters.classTeacherId };
    if (Object.keys(studentWhere).length > 0) where.student = studentWhere;

    return this.repository.find({
      where,
      relations: gradeRelations,
      order: { date: 'DESC', id: 'DESC' },
    });
  }

  findByStudentId(studentId: number): Promise<Grade[]> {
    return this.repository.find({
      where: { studentId },
      relations: gradeRelations,
      order: { date: 'DESC', id: 'DESC' },
    });
  }

  findById(id: number): Promise<Grade | null> {
    return this.repository.findOne({
      where: { id },
      relations: gradeRelations,
    });
  }

  build(data: DeepPartial<Grade>): Grade {
    return this.repository.create(data);
  }

  save(grade: Grade): Promise<Grade> {
    return this.repository.save(grade);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
