import {
  ForbiddenException, Injectable, NotFoundException,
} from '@nestjs/common';
import { Role } from '../../common/enums/role.enum';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { Student } from '../../students/entities/student.entity';
import { StudentService } from '../../students/services/student.service';
import { TeacherService } from '../../teachers/services/teacher.service';
import { CreateGradeDto } from '../dtos/create-grade.dto';
import { GradeReportDto, GradeResponseDto } from '../dtos/grade-response.dto';
import { QueryGradesDto } from '../dtos/query-grades.dto';
import { UpdateGradeDto } from '../dtos/update-grade.dto';
import { Grade } from '../entities/grade.entity';
import {GradeFilters, GradeRepository,} from '../repositories/grade.repository';
import { summarizeGrades } from '../utils/grade-fct';

@Injectable()
export class GradeService {
  constructor(
    private readonly gradeRepository: GradeRepository,
    private readonly studentService: StudentService,
    private readonly teacherService: TeacherService,
  ) {}

  async create(
    dto: CreateGradeDto,
    user: JwtPayload,
  ): Promise<GradeResponseDto> {
    const student = await this.studentService.findEntityById(dto.studentId);

    let teacherId: number | null = null;
    if (user.role === Role.TEACHER) {
      const teacher = await this.teacherService.findEntityByUserId(user.sub);
      if (student.schoolClass?.teacherId !== teacher.id) {
        throw new ForbiddenException(
          'You can only grade students in your assigned classes',
        );
      }
      teacherId = teacher.id;
    }

    const saved = await this.gradeRepository.save(
      this.gradeRepository.build({
        studentId: student.id,
        teacherId,
        subject: dto.subject.trim(),
        value: dto.value,
        date: dto.date ?? new Date().toISOString().slice(0, 10),
      }),
    );
    return GradeResponseDto.fromEntity(await this.getOrThrow(saved.id));
  }

  async findAll(
    query: QueryGradesDto,
    user: JwtPayload,
  ): Promise<GradeResponseDto[]> {
    const filters: GradeFilters = { ...query };
    if (user.role === Role.TEACHER) {
      filters.classTeacherId = (
        await this.teacherService.findEntityByUserId(user.sub)
      ).id;
    }
    const grades = await this.gradeRepository.findAll(filters);
    return grades.map(GradeResponseDto.fromEntity);
  }

  async findForStudent(
    studentId: number,
    user: JwtPayload,
  ): Promise<GradeReportDto> {
    const student = await this.studentService.findEntityById(studentId);
    if (user.role === Role.TEACHER) {
      const teacher = await this.teacherService.findEntityByUserId(user.sub);
      if (student.schoolClass?.teacherId !== teacher.id) {
        throw new ForbiddenException(
          'You can only view grades of students in your classes',
        );
      }
    }
    return this.buildReport(student);
  }

  async findMine(user: JwtPayload): Promise<GradeReportDto> {
    return this.buildReport(
      await this.studentService.findEntityByUserId(user.sub),
    );
  }

  async update(
    id: number,
    dto: UpdateGradeDto,
    user: JwtPayload,
  ): Promise<GradeResponseDto> {
    const grade = await this.getOrThrow(id);
    if (user.role === Role.TEACHER) {
      const teacher = await this.teacherService.findEntityByUserId(user.sub);
      if (grade.teacherId !== teacher.id) {
        throw new ForbiddenException(
          'You can only update grades you have assigned',
        );
      }
    }

    if (dto.subject) grade.subject = dto.subject.trim();
    if (dto.value !== undefined) grade.value = dto.value;
    if (dto.date) grade.date = dto.date;

    await this.gradeRepository.save(grade);
    return GradeResponseDto.fromEntity(await this.getOrThrow(id));
  }

  async remove(id: number): Promise<void> {
    await this.getOrThrow(id);
    await this.gradeRepository.delete(id);
  }

  private async buildReport(student: Student): Promise<GradeReportDto> {
    const grades = await this.gradeRepository.findByStudentId(student.id);
    return {
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        class: student.schoolClass
          ? { id: student.schoolClass.id, name: student.schoolClass.name }
          : null,
      },
      ...summarizeGrades(grades),
      grades: grades.map(GradeResponseDto.fromEntity),
    };
  }

  private async getOrThrow(id: number): Promise<Grade> {
    const grade = await this.gradeRepository.findById(id);
    if (!grade) throw new NotFoundException(`Grade with id ${id} not found`);
    return grade;
  }
}
