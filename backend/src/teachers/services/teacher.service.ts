import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '../../common/enums/role.enum';
import { UserService } from '../../users/services/user.service';
import { CreateTeacherDto } from '../dtos/create-teacher.dto';
import { TeacherResponseDto } from '../dtos/teacher-response.dto';
import { UpdateTeacherDto } from '../dtos/update-teacher.dto';
import { Teacher } from '../entities/teacher.entity';
import { TeacherRepository } from '../repositories/teacher.repository';

@Injectable()
export class TeacherService {
  constructor(
    private readonly teacherRepository: TeacherRepository,
    private readonly userService: UserService,
  ) {}

  private async getOrThrow(id: number): Promise<Teacher> {
    const teacher = await this.teacherRepository.findById(id);
    if (!teacher)
      throw new NotFoundException(`Teacher with id ${id} not found`);
    return teacher;
  }

  async create(dto: CreateTeacherDto): Promise<TeacherResponseDto> {
    const user = await this.userService.buildUser(
      dto.email,
      dto.password,
      Role.TEACHER,
    );
    const teacher = this.teacherRepository.build({
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      user,
    });
    return TeacherResponseDto.fromEntity(
      await this.teacherRepository.save(teacher),
    );
  }

  async findAll(): Promise<TeacherResponseDto[]> {
    const teachers = await this.teacherRepository.findAll();
    return teachers.map(TeacherResponseDto.fromEntity);
  }

  async findOne(id: number): Promise<TeacherResponseDto> {
    return TeacherResponseDto.fromEntity(await this.getOrThrow(id));
  }

  async update(id: number, dto: UpdateTeacherDto): Promise<TeacherResponseDto> {
    const teacher = await this.getOrThrow(id);

    if (dto.firstName) teacher.firstName = dto.firstName.trim();
    if (dto.lastName) teacher.lastName = dto.lastName.trim();
    if (dto.email) {
      teacher.user.email = await this.userService.normalizeAvailableEmail(
        dto.email,
        teacher.userId,
      );
    }
    if (dto.password) {
      teacher.user.password = await this.userService.hashPassword(dto.password);
    }

    return TeacherResponseDto.fromEntity(
      await this.teacherRepository.save(teacher),
    );
  }

  async remove(id: number): Promise<void> {
    const teacher = await this.getOrThrow(id);
    await this.userService.remove(teacher.userId);
  }
  async findMe(userId: number): Promise<TeacherResponseDto> {
    return TeacherResponseDto.fromEntity(await this.findEntityByUserId(userId));
  }

  async findEntityByUserId(userId: number): Promise<Teacher> {
    const teacher = await this.teacherRepository.findById(userId);
    if (!teacher) throw new NotFoundException('Teacher profile not found');
    return teacher;
  }

  async ensureExists(id: number): Promise<void> {
    await this.getOrThrow(id);
  }
}
