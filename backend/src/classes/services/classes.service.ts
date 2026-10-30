import {
  ConflictException, ForbiddenException,Injectable,NotFoundException,
} from '@nestjs/common';
import { Role } from '../../common/enums/role.enum';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { TeacherService } from '../../teachers/services/teacher.service';
import {ClassDetailResponseDto,ClassResponseDto,} from '../dtos/class-response.dto';
import { CreateClassDto } from '../dtos/create-class.dto';
import { UpdateClassDto } from '../dtos/update-class.dto';
import { SchoolClass } from '../entities/school-class.entity';
import { ClassesRepository } from '../repositories/classes.repository';

@Injectable()
export class ClassesService {
  constructor(
    private readonly classesRepository: ClassesRepository,
    private readonly teacherService: TeacherService,
  ) {}
  async create(dto: CreateClassDto): Promise<ClassResponseDto> {
    const name = await this.ensureNameAvailable(dto.name);
    //const name = dto.name.trim();
    if (dto.teacherId) await this.teacherService.ensureExists(dto.teacherId);

    const saved = await this.classesRepository.save(
      this.classesRepository.build({ name, teacherId: dto.teacherId ?? null }),
    );
    return ClassResponseDto.fromEntity(await this.getOrThrow(saved.id));
  }

  /** Admins see all classes; teachers only the classes they lead. */
  async findAll(user: JwtPayload): Promise<ClassResponseDto[]> {
    let teacherId: number | undefined;
    if (user.role === Role.TEACHER) {
      teacherId = (await this.teacherService.findEntityByUserId(user.sub)).id;
    }
    const classes = await this.classesRepository.findAll(teacherId);
    return classes.map(ClassResponseDto.fromEntity);
  }

  async findOne(id: number, user: JwtPayload): Promise<ClassDetailResponseDto> {
    const schoolClass = await this.getOrThrow(id);
    await this.assertCanAccess(schoolClass, user);
    return ClassDetailResponseDto.fromEntity(schoolClass);
  }

  async findStudents(id: number, user: JwtPayload) {
    return (await this.findOne(id, user)).students;
  }

  async update(id: number, dto: UpdateClassDto): Promise<ClassResponseDto> {
    await this.getOrThrow(id);

    const changes: { name?: string; teacherId?: number | null } = {};
    if (dto.name !== undefined)
      changes.name = await this.ensureNameAvailable(dto.name, id);
    if (dto.teacherId !== undefined) {
      if (dto.teacherId !== null)
        await this.teacherService.ensureExists(dto.teacherId);
      changes.teacherId = dto.teacherId;
    }

    if (Object.keys(changes).length > 0)
      await this.classesRepository.update(id, changes);
    return ClassResponseDto.fromEntity(await this.getOrThrow(id));
  }

  assignTeacher(
    id: number,
    teacherId: number | null,
  ): Promise<ClassResponseDto> {
    return this.update(id, { teacherId });
  }

  /** Students of a deleted class stay in the system without a class. */
  async remove(id: number): Promise<void> {
    await this.getOrThrow(id);
    await this.classesRepository.delete(id);
  }

  async addStudents(
    id: number,
    studentIds: number[],
    user: JwtPayload,
  ): Promise<ClassDetailResponseDto> {
    await this.getOrThrow(id);
    const uniqueIds = [...new Set(studentIds)];

    const found = await this.classesRepository.findStudentsByIds(uniqueIds);
    const missing = uniqueIds.filter((sid) => !found.some((s) => s.id === sid));
    if (missing.length > 0) {
      throw new NotFoundException(`Students not found: ${missing.join(', ')}`);
    }

    await this.classesRepository.setStudentsClass(uniqueIds, id);
    return this.findOne(id, user);
  }

  async removeStudent(id: number, studentId: number): Promise<void> {
    await this.getOrThrow(id);
    const student = await this.classesRepository.findStudentById(studentId);
    if (!student || student.classId !== id) {
      throw new NotFoundException(
        `Student ${studentId} is not enrolled in this class`,
      );
    }
    await this.classesRepository.setStudentsClass([studentId], null);
  }

  /** Used by the students module to validate a class id. */
  async ensureExists(id: number): Promise<void> {
    await this.getOrThrow(id);
  }

  private async assertCanAccess(
    schoolClass: SchoolClass,
    user: JwtPayload,
  ): Promise<void> {
    if (user.role === Role.ADMIN) return;
    const teacher = await this.teacherService.findEntityByUserId(user.sub);
    if (schoolClass.teacherId !== teacher.id) {
      throw new ForbiddenException('You are not assigned to this class');
    }
  }

  private async ensureNameAvailable(
    name: string,
    excludeId?: number,
  ): Promise<string> {
    const trimmed = name.trim();
    if (await this.classesRepository.isNameTaken(trimmed, excludeId)) {
      throw new ConflictException(`A class named ${trimmed} already exists`);
    }
    return trimmed;
  }

  private async getOrThrow(id: number): Promise<SchoolClass> {
    const schoolClass = await this.classesRepository.findById(id);
    if (!schoolClass)
      throw new NotFoundException(`Class with id ${id} not found`);
    return schoolClass;
  }
}
