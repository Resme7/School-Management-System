import * as bcrypt from 'bcryptjs';
import { SchoolClass } from '../../classes/entities/school-class.entity';
import { Role } from '../../common/enums/role.enum';
import { Grade } from '../../grades/entities/grade.entity';
import { Student } from '../../students/entities/student.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { User } from '../../users/entities/user.entity';
import dataSource from '../data-source';

const PASSWORDS = {
  admin: 'Admin123!',
  teacher: 'Teacher123!',
  student: 'Student123!',
};

const SUBJECTS = ['Mathematics', 'Romanian', 'English', 'Physics', 'History'];

/** Returns a YYYY-MM-DD date, `daysAfter` days after 1 September 2026. */
function schoolDate(daysAfter: number): string {
  return new Date(Date.UTC(2026, 8, 1 + daysAfter)).toISOString().slice(0, 10);
}

async function seed() {
  await dataSource.initialize();
  console.log('Clearing existing data...');
  await dataSource.query(
    'TRUNCATE TABLE grades, students, classes, teachers, users RESTART IDENTITY CASCADE',
  );

  const users = dataSource.getRepository(User);
  const teachers = dataSource.getRepository(Teacher);
  const classes = dataSource.getRepository(SchoolClass);
  const students = dataSource.getRepository(Student);
  const grades = dataSource.getRepository(Grade);

  const [adminHash, teacherHash, studentHash] = await Promise.all([
    bcrypt.hash(PASSWORDS.admin, 10),
    bcrypt.hash(PASSWORDS.teacher, 10),
    bcrypt.hash(PASSWORDS.student, 10),
  ]);

  // Administrator: only a login account, no profile.
  await users.save(
    users.create({
      email: 'admin@school.com',
      password: adminHash,
      role: Role.ADMIN,
    }),
  );

  // Teachers: profile + account saved together (cascade).
  const maria = await teachers.save(
    teachers.create({
      firstName: 'Maria',
      lastName: 'Popescu',
      user: {
        email: 'maria.popescu@school.com',
        password: teacherHash,
        role: Role.TEACHER,
      },
    }),
  );
  const andrei = await teachers.save(
    teachers.create({
      firstName: 'Andrei',
      lastName: 'Ionescu',
      user: {
        email: 'andrei.ionescu@school.com',
        password: teacherHash,
        role: Role.TEACHER,
      },
    }),
  );

  const class9A = await classes.save(
    classes.create({ name: '9A', teacherId: maria.id }),
  );
  const class9B = await classes.save(
    classes.create({ name: '9B', teacherId: andrei.id }),
  );
  const class10A = await classes.save(
    classes.create({ name: '10A', teacherId: maria.id }),
  );

  const studentData: [string, string, string, string, SchoolClass | null][] = [
    ['Ion', 'Vasile', 'ion.vasile@school.com', '2010-03-14', class9A],
    ['Elena', 'Dumitru', 'elena.dumitru@school.com', '2010-07-02', class9A],
    ['Mihai', 'Stan', 'mihai.stan@school.com', '2010-11-21', class9A],
    ['Ana', 'Georgescu', 'ana.georgescu@school.com', '2010-01-30', class9B],
    ['Radu', 'Marin', 'radu.marin@school.com', '2010-05-17', class9B],
    [
      'Ioana',
      'Constantin',
      'ioana.constantin@school.com',
      '2009-09-08',
      class10A,
    ],
    ['Vlad', 'Rusu', 'vlad.rusu@school.com', '2009-12-12', class10A],
    ['Sara', 'Munteanu', 'sara.munteanu@school.com', '2010-04-25', null],
  ];

  for (const [
    index,
    [firstName, lastName, email, dateOfBirth, schoolClass],
  ] of studentData.entries()) {
    const student = await students.save(
      students.create({
        firstName,
        lastName,
        dateOfBirth,
        classId: schoolClass?.id ?? null,
        user: { email, password: studentHash, role: Role.STUDENT },
      }),
    );

    if (!schoolClass) continue;

    const studentGrades = SUBJECTS.flatMap((subject, s) =>
      [0, 1].map((n) =>
        grades.create({
          studentId: student.id,
          teacherId: schoolClass.teacherId,
          subject,
          value: 5 + ((index * 3 + s * 2 + n) % 6),
          date: schoolDate(s * 7 + n * 20),
        }),
      ),
    );
    await grades.save(studentGrades);
  }

  console.log('Seed complete. Test accounts:');
  console.table([
    {
      role: 'Administrator',
      email: 'admin@school.com',
      password: PASSWORDS.admin,
    },
    {
      role: 'Teacher (9A, 10A)',
      email: 'maria.popescu@school.com',
      password: PASSWORDS.teacher,
    },
    {
      role: 'Teacher (9B)',
      email: 'andrei.ionescu@school.com',
      password: PASSWORDS.teacher,
    },
    {
      role: 'Student (9A)',
      email: 'ion.vasile@school.com',
      password: PASSWORDS.student,
    },
    {
      role: 'Student (no class)',
      email: 'sara.munteanu@school.com',
      password: PASSWORDS.student,
    },
  ]);

  await dataSource.destroy();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
