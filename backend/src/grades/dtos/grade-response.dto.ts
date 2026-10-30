import { Grade } from '../entities/grade.entity';

export class GradeResponseDto {
  id: number;
  subject: string;
  value: number;
  date: string;
  student: {
    id: number;
    firstName: string;
    lastName: string;
    class: { id: number; name: string } | null;
  };
  teacher: { id: number; firstName: string; lastName: string } | null;

  static fromEntity(grade: Grade): GradeResponseDto {
    const s = grade.student;
    const t = grade.teacher;
    return {
      id: grade.id,
      subject: grade.subject,
      value: grade.value,
      date: grade.date,
      student: {
        id: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        class: s.schoolClass
          ? { id: s.schoolClass.id, name: s.schoolClass.name }
          : null,
      },
      teacher: t
        ? { id: t.id, firstName: t.firstName, lastName: t.lastName }
        : null,
    };
  }
}

export class GradeReportDto {
  student: {
    id: number;
    firstName: string;
    lastName: string;
    class: { id: number; name: string } | null;
  };
  average: number | null;
  subjectAverages: { subject: string; average: number; count: number }[];
  grades: GradeResponseDto[];
}
