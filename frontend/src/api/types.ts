export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface AuthUser {
  id: number;
  email: string;
  role: Role;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface ClassRef {
  id: number;
  name: string;
}

export interface PersonRef {
  id: number;
  firstName: string;
  lastName: string;
}

export interface Student extends PersonRef {
  email: string;
  dateOfBirth: string;
  class: ClassRef | null;
}

export interface Teacher extends PersonRef {
  email: string;
  classes: ClassRef[];
}

export interface SchoolClass extends ClassRef {
  teacher: PersonRef | null;
  studentCount: number;
}

export interface ClassDetail extends ClassRef {
  teacher: PersonRef | null;
  students: (PersonRef & { email: string; dateOfBirth: string })[];
}

export interface Grade {
  id: number;
  subject: string;
  value: number;
  date: string;
  student: PersonRef & { class: ClassRef | null };
  teacher: PersonRef | null;
}

export interface GradeReport {
  student: PersonRef & { class: ClassRef | null };
  average: number | null;
  subjectAverages: { subject: string; average: number; count: number }[];
  grades: Grade[];
}

export interface StudentProfile extends PersonRef {
  email: string;
  dateOfBirth: string;
  class: (ClassRef & { teacher: { firstName: string; lastName: string; email: string } | null }) | null;
}