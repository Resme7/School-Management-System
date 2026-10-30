import { Injectable, NotFoundException } from '@nestjs/common';
import { ClassesService } from '../../classes/services/classes.service';
import { Role } from '../../common/enums/role.enum';
import { UserService } from '../../users/services/user.service';
import { CreateStudentDto } from '../dtos/create-student.dto';
import { StudentProfileResponseDto,StudentResponseDto,} from '../dtos/student-response.dto';
import { UpdateStudentDto } from '../dtos/update-student.dto';
import { Student } from '../entities/student.entity';
import { StudentRepository } from '../repositories/student.repository';

@Injectable()
export class StudentService {
  constructor(
    private readonly studentRepository: StudentRepository,
    private readonly userService: UserService,
    private readonly classService: ClassesService,
  ) {}

  async create(dto: CreateStudentDto): Promise<StudentResponseDto> {
    if (dto.classId) await this.classService.ensureExists(dto.classId);

    const user = await this.userService.buildUser(
      dto.email,
      dto.password,
      Role.STUDENT,
    );
    const student = this.studentRepository.build({
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      dateOfBirth: dto.dateOfBirth,
      classId: dto.classId ?? null,
      user,
    });
    const saved = await this.studentRepository.save(student);
    return StudentResponseDto.fromEntity(await this.getOrThrow(saved.id));
  }

  async findAll(): Promise<StudentResponseDto[]> {
    const students = await this.studentRepository.findAll();
    return students.map(StudentResponseDto.fromEntity);
  }

  async findOne(id: number): Promise<StudentResponseDto> {
    return StudentResponseDto.fromEntity(await this.getOrThrow(id));
  }

  async update(id: number, dto: UpdateStudentDto): Promise<StudentResponseDto> {
    const student = await this.getOrThrow(id);

    if (dto.firstName) student.firstName = dto.firstName.trim();
    if (dto.lastName) student.lastName = dto.lastName.trim();
    if (dto.dateOfBirth) student.dateOfBirth = dto.dateOfBirth;
    if (dto.email) {
      student.user.email = await this.userService.normalizeAvailableEmail(
        dto.email,
        student.userId,
      );
    }
    if (dto.password) {
      student.user.password = await this.userService.hashPassword(dto.password);
    }
    await this.studentRepository.save(student);

    if (dto.classId !== undefined) return this.assignClass(id, dto.classId);
    return StudentResponseDto.fromEntity(await this.getOrThrow(id));
  }

  async assignClass(
    id: number,
    classId: number | null,
  ): Promise<StudentResponseDto> {
    await this.getOrThrow(id);
    if (classId !== null) await this.classService.ensureExists(classId);
    await this.studentRepository.updateClass(id, classId);
    return StudentResponseDto.fromEntity(await this.getOrThrow(id));
  }

  /** Deleting the account cascades to the student profile and their grades. */
  async remove(id: number): Promise<void> {
    const student = await this.getOrThrow(id);
    await this.userService.remove(student.userId);
  }

  async findMe(userId: number): Promise<StudentProfileResponseDto> {
    return StudentProfileResponseDto.fromEntity(
      await this.findEntityByUserId(userId),
    );
  }

  /** For other modules (grades): the student entity, with their class loaded. */
  async findEntityById(id: number): Promise<Student> {
    return this.getOrThrow(id);
  }

  async findEntityByUserId(userId: number): Promise<Student> {
    const student = await this.studentRepository.findByUserId(userId);
    if (!student) throw new NotFoundException('Student profile not found');
    return student;
  }

  private async getOrThrow(id: number): Promise<Student> {
    const student = await this.studentRepository.findById(id);
    if (!student)
      throw new NotFoundException(`Student with id ${id} not found`);
    return student;
  }
}
