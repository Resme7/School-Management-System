import { SchoolClass } from '../entities/school-class.entity';

type TeacherSummary = {
  id: number;
  firstName: string;
  lastName: string;
} | null;

function teacherSummary(schoolClass: SchoolClass): TeacherSummary {
  const t = schoolClass.teacher;
  return t ? { id: t.id, firstName: t.firstName, lastName: t.lastName } : null;
}

export class ClassResponseDto {
  id: number;
  name: string;
  teacher: TeacherSummary;
  studentCount: number;

  static fromEntity(schoolClass: SchoolClass): ClassResponseDto {
    return {
      id: schoolClass.id,
      name: schoolClass.name,
      teacher: teacherSummary(schoolClass),
      studentCount: schoolClass.students?.length ?? 0,
    };
  }
}

export class ClassDetailResponseDto {
  id: number;
  name: string;
  teacher: TeacherSummary;
  students: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
  }[];

  static fromEntity(schoolClass: SchoolClass): ClassDetailResponseDto {
    return {
      id: schoolClass.id,
      name: schoolClass.name,
      teacher: teacherSummary(schoolClass),
      students: (schoolClass.students ?? []).map((s) => ({
        id: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.user.email,
        dateOfBirth: s.dateOfBirth,
      })),
    };
  }
}
