# School Management System

A web application for managing students, teachers, classes and grades, with JWT authentication and role-based access control (Administrator, Teacher, Student).

- **Backend:** NestJS + TypeScript, TypeORM, PostgreSQL
- **Frontend:** React + TypeScript (Vite), React Router, Axios
- **Auth:** JWT (Bearer token), passwords hashed with bcrypt
- **API docs:** Swagger at `http://localhost:3000/api/docs`

---

## 1. Prerequisites

| Tool       | Version         |
|------------|-----------------|
| Node.js    | 22 LTS or newer |
| npm        | comes with Node |
| PostgreSQL | 14 or newer     |

## 2. Project structure

```
School_management_system/
├── backend/                 NestJS REST API
│   └── src/
│       ├── auth/            login, current user
│       ├── users/           login accounts (email, password hash, role)
│       ├── students/        student profiles
│       ├── teachers/        teacher profiles
│       ├── classes/         classes, assigning teachers and students
│       ├── grades/          grades and averages
│       ├── common/          guards, decorators, enums, exception filter
│       └── database/        TypeORM data source, migrations, seed script
└── frontend/                React application
    └── src/
        ├── api/             Axios client and API types
        ├── auth/            auth context, protected routes
        ├── components/      layout, grades table, average summary
        └── pages/           admin, shared (admin + teacher) and student pages
```

The feature modules (`students`, `teachers`, `classes`, `grades`) follow the same layers: `controllers/` (HTTP) → `services/` (business logic and authorization rules) → `repositories/` (database access) → `entities/` (tables), with `dtos/` for input validation and response shapes. `users` has no controller (accounts are managed through students and teachers), and `auth` has no repository (it uses `UserService`).

## 3. Database setup

Create the database user and the database (from `psql` as the `postgres` superuser):

```sql
CREATE USER school WITH PASSWORD 'school';
CREATE DATABASE school_management OWNER school;
```

## 4. Backend

### 4.1 Install dependencies

```bash
cd backend
npm install
```

### 4.2 Environment variables

Create `backend/.env` (you can copy `backend/.env.example`):

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=school
DB_PASSWORD=school
DB_NAME=school_management
PORT=3000

JWT_SECRET=change-me-to-a-long-random-string
JWT_EXPIRES_IN=86400
```

| Variable         | Description                          |
|------------------|--------------------------------------|
| `DB_*`           | PostgreSQL connection                |
| `PORT`           | API port (default `3000`)            |
| `JWT_SECRET`     | Secret used to sign the JWT tokens   |
| `JWT_EXPIRES_IN` | Token lifetime in seconds (24h)      |

### 4.3 Create the tables and the test data

```bash
npm run migration:run   # creates the tables
npm run seed            # creates test accounts, classes and grades
```

> The seed script **deletes all existing data** before inserting the test data.

### 4.4 Start the API

```bash
npm run start:dev
```

The API runs at `http://localhost:3000/api` and the Swagger documentation at `http://localhost:3000/api/docs`.

## 5. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

Start the application:

```bash
npm run dev
```

Open `http://localhost:5173`. The backend only accepts requests from this origin (CORS), so keep the default Vite port.

## 6. Test accounts

Created by `npm run seed`:

| Role          | Email                       | Password      | Notes                     |
|---------------|-----------------------------|---------------|---------------------------|
| Administrator | `admin@school.com`          | `Admin123!`   |                           |
| Teacher       | `maria.popescu@school.com`  | `Teacher123!` | teaches classes 9A, 10A   |
| Teacher       | `andrei.ionescu@school.com` | `Teacher123!` | teaches class 9B          |
| Student       | `ion.vasile@school.com`     | `Student123!` | class 9A, has grades      |
| Student       | `sara.munteanu@school.com`  | `Student123!` | no class, no grades       |

All other seeded students (`elena.dumitru`, `mihai.stan`, `ana.georgescu`, `radu.marin`, `ioana.constantin`, `vlad.rusu`, all `@school.com`) use the password `Student123!`.

## 7. Database schema

| Table      | Main columns                                               | Relations |
|------------|------------------------------------------------------------|-----------|
| `users`    | `id`, `email` (unique), `password` (bcrypt hash), `role`   | login account for every role |
| `teachers` | `id`, `firstName`, `lastName`, `userId`                    | 1–1 with `users` |
| `students` | `id`, `firstName`, `lastName`, `dateOfBirth`, `userId`, `classId` | 1–1 with `users`, many–1 with `classes` |
| `classes`  | `id`, `name` (unique), `teacherId`                         | many–1 with `teachers` |
| `grades`   | `id`, `subject`, `value`, `date`, `studentId`, `teacherId` | many–1 with `students` and `teachers` |

- **One login table for all roles:** `users` holds the data needed to authenticate; `students` and `teachers` hold the profile data. The administrator only has a `users` row.
- **A class has one teacher, a teacher can have several classes:** `classes.teacherId`.
- **A student belongs to one class, a class has many students:** `students.classId`.
- **Grades:** `value` is limited to 1–10 by a `CHECK` constraint in the database and by DTO validation in the API. `teacherId` stores who gave the grade, so a teacher can only edit their own grades.
- **Deletes:** deleting a student or teacher deletes their account. A student's grades are deleted with the student. Deleting a teacher or a class leaves their classes or students unassigned instead of deleting them.

The schema is created by the migrations in `backend/src/database/migrations`.

## 8. Authentication and authorization

1. `POST /api/auth/login` checks the email and password and returns a JWT containing the user id and role.
2. The frontend sends the token on every request in the `Authorization: Bearer <token>` header.
3. `JwtAuthGuard` (global) rejects requests without a valid token with **401**. Only routes marked `@Public()` (the login) skip it.
4. `RolesGuard` (global) reads the `@Roles(...)` decorator and rejects other roles with **403**.
5. Rules that depend on the data are checked in the services. For example, a teacher may only see classes they teach and only edit grades they gave. A student only receives their own data through the `/me` endpoints and never sends an id.

All permissions are enforced by the backend. The frontend only hides pages that the role cannot use.

## 9. API endpoints

All routes are prefixed with `/api`. Full request/response schemas are in Swagger (`/api/docs`).

### Auth
| Method | Route         | Access        | Description                 |
|--------|---------------|---------------|-----------------------------|
| POST   | `/auth/login` | Public        | Log in, returns a JWT       |
| GET    | `/auth/me`    | Authenticated | Current user (id, email, role) |

### Students
| Method | Route                 | Access  | Description                       |
|--------|-----------------------|---------|-----------------------------------|
| GET    | `/students/me`        | Student | Own profile, class and class teacher |
| GET    | `/students`           | Admin   | List students                     |
| GET    | `/students/:id`       | Admin   | Student details                   |
| POST   | `/students`           | Admin   | Create student (and login account) |
| PATCH  | `/students/:id`       | Admin   | Update student                    |
| PATCH  | `/students/:id/class` | Admin   | Assign to a class (`classId: null` removes) |
| DELETE | `/students/:id`       | Admin   | Delete student                    |

### Teachers
| Method | Route           | Access  | Description                       |
|--------|-----------------|---------|-----------------------------------|
| GET    | `/teachers/me`  | Teacher | Own profile and classes           |
| GET    | `/teachers`     | Admin   | List teachers                     |
| GET    | `/teachers/:id` | Admin   | Teacher details                   |
| POST   | `/teachers`     | Admin   | Create teacher (and login account) |
| PATCH  | `/teachers/:id` | Admin   | Update teacher                    |
| DELETE | `/teachers/:id` | Admin   | Delete teacher                    |

### Classes
| Method | Route                              | Access                 | Description                    |
|--------|------------------------------------|------------------------|--------------------------------|
| GET    | `/classes`                         | Admin, Teacher         | All classes (teacher: own only) |
| GET    | `/classes/:id`                     | Admin, Teacher (own)   | Class details with students    |
| GET    | `/classes/:id/students`            | Admin, Teacher (own)   | Students of the class          |
| POST   | `/classes`                         | Admin                  | Create class                   |
| PATCH  | `/classes/:id`                     | Admin                  | Update name / teacher          |
| PATCH  | `/classes/:id/teacher`             | Admin                  | Assign teacher (`teacherId: null` removes) |
| POST   | `/classes/:id/students`            | Admin                  | Add students (`studentIds: [..]`) |
| DELETE | `/classes/:id/students/:studentId` | Admin                  | Remove a student from the class |
| DELETE | `/classes/:id`                     | Admin                  | Delete class                   |

### Grades
| Method | Route                         | Access                        | Description                         |
|--------|-------------------------------|-------------------------------|-------------------------------------|
| GET    | `/grades/me`                  | Student                       | Own grades, overall and per-subject averages |
| GET    | `/grades`                     | Admin, Teacher (own classes)  | List grades, filters: `studentId`, `classId`, `subject` |
| GET    | `/grades/student/:studentId`  | Admin, Teacher (own classes)  | Grades and averages of one student  |
| POST   | `/grades`                     | Admin, Teacher (own classes)  | Add grade (`studentId`, `subject`, `value` 1–10, optional `date`) |
| PATCH  | `/grades/:id`                 | Admin, Teacher (own grades)   | Update grade                        |
| DELETE | `/grades/:id`                 | Admin                         | Delete grade                        |

### Status codes

| Code | When |
|------|------|
| 200 / 201 / 204 | Success (read / created / deleted) |
| 400 | Invalid input (e.g. grade outside 1–10, unknown field, future date) |
| 401 | Missing, invalid or expired token; wrong email or password |
| 403 | The role or the user is not allowed to access the resource |
| 404 | Resource not found (e.g. class or student id does not exist) |
| 409 | Duplicate value (email or class name already used) |

## 10. Tests

```bash
cd backend
npm test
```

## 11. Useful scripts (backend)

| Command                        | Description                          |
|--------------------------------|--------------------------------------|
| `npm run start:dev`            | Start the API with auto-reload       |
| `npm run migration:run`        | Apply the migrations                 |
| `npm run migration:revert`     | Undo the last migration              |
| `npm run migration:generate -- src/database/migrations/<Name>` | Generate a migration from entity changes |
| `npm run seed`                 | Reset the database with test data    |
| `npm test`                     | Run the unit tests                   |
