import { Student } from '../entities/student.entity';

export class StudentResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  class: { id: number; name: string } | null;

  static fromEntity(student: Student): StudentResponseDto {
    return {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.user.email,
      dateOfBirth: student.dateOfBirth,
      class: student.schoolClass
        ? { id: student.schoolClass.id, name: student.schoolClass.name }
        : null,
    };
  }
}

/** What a logged-in student sees about themselves, including the class teacher. */
export class StudentProfileResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  class: {
    id: number;
    name: string;
    teacher: { firstName: string; lastName: string; email: string } | null;
  } | null;

  static fromEntity(student: Student): StudentProfileResponseDto {
    const cls = student.schoolClass;
    const teacher = cls?.teacher;
    return {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.user.email,
      dateOfBirth: student.dateOfBirth,
      class: cls
        ? {
            id: cls.id,
            name: cls.name,
            teacher: teacher
              ? {
                  firstName: teacher.firstName,
                  lastName: teacher.lastName,
                  email: teacher.user.email,
                }
              : null,
          }
        : null,
    };
  }
}
