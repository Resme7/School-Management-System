import { Teacher } from '../entities/teacher.entity';

export class TeacherResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  classes: { id: number; name: string }[];

  static fromEntity(teacher: Teacher): TeacherResponseDto {
    return {
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.user.email,
      classes: (teacher.classes ?? []).map((c) => ({ id: c.id, name: c.name })),
    };
  }
}
