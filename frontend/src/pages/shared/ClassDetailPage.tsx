import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, getErrorMessage } from '../../api/client';
import type { ClassDetail, Student, Teacher } from '../../api/types';
import { useAuth } from '../../auth/userAuth';
import { useApiData } from '../../hooks/useApiData';

export function ClassDetailPage() {
  const { id } = useParams();
  const classId = Number(id);
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const detail = useApiData<ClassDetail>(`/classes/${classId}`);
  const teachers = useApiData<Teacher[]>(isAdmin ? '/teachers' : null);
  const allStudents = useApiData<Student[]>(isAdmin ? '/students' : null);

  const [studentToAdd, setStudentToAdd] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  function reloadAll() {
    detail.reload();
    allStudents.reload();
  }

  async function handleAddStudent(event: FormEvent) {
    event.preventDefault();
    if (!studentToAdd) return;
    setActionError(null);
    try {
      await api.post(`/classes/${classId}/students`, { studentIds: [Number(studentToAdd)] });
      setStudentToAdd('');
      reloadAll();
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  }

  async function handleRemoveStudent(studentId: number, studentName: string) {
    if (!window.confirm(`Remove ${studentName} from this class?`)) return;
    setActionError(null);
    try {
      await api.delete(`/classes/${classId}/students/${studentId}`);
      reloadAll();
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  }

  if (detail.loading && !detail.data) return <p>Loading…</p>;
  if (detail.error) {
    return (
      <section>
        <p className="error">{detail.error}</p>
        <Link to="/classes">← Back to classes</Link>
      </section>
    );
  }
  if (!detail.data) return null;

  const schoolClass = detail.data;
  const candidates = (allStudents.data ?? []).filter((s) => s.class?.id !== classId);

  return (
    <section className="stack">
      <div>
        <Link to="/classes">← Back to classes</Link>
        <h1>Class {schoolClass.name}</h1>
        <p className="muted">
          Teacher:{' '}
          {schoolClass.teacher
            ? `${schoolClass.teacher.firstName} ${schoolClass.teacher.lastName}`
            : 'not assigned'}
        </p>
      </div>

      {actionError && <p className="error">{actionError}</p>}

      {isAdmin && (
        <ClassSettingsForm
          key={`${schoolClass.name}-${schoolClass.teacher?.id ?? 'none'}`}
          schoolClass={schoolClass}
          teachers={teachers.data ?? []}
          onSaved={detail.reload}
        />
      )}

      <div className="card">
        <h2>Students ({schoolClass.students.length})</h2>
        {schoolClass.students.length === 0 ? (
          <p>No students in this class yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Date of birth</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {schoolClass.students.map((s) => {
                const name = `${s.firstName} ${s.lastName}`;
                return (
                  <tr key={s.id}>
                    <td>
                      {s.lastName} {s.firstName}
                    </td>
                    <td>{s.email}</td>
                    <td>{s.dateOfBirth}</td>
                    <td className="actions">
                      <Link className="button-link" to={`/grades?classId=${classId}&studentId=${s.id}`}>
                        Grades
                      </Link>
                      {isAdmin && (
                        <button className="danger" onClick={() => handleRemoveStudent(s.id, name)}>
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {isAdmin && (
          <form className="inline-form" onSubmit={handleAddStudent}>
            <label>
              Add student
              <select value={studentToAdd} onChange={(e) => setStudentToAdd(e.target.value)}>
                <option value="">Choose a student…</option>
                {candidates.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.lastName} {s.firstName}
                    {s.class ? ` (currently in ${s.class.name})` : ''}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" disabled={!studentToAdd}>
              Add
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

interface ClassSettingsFormProps {
  schoolClass: ClassDetail;
  teachers: Teacher[];
  onSaved: () => void;
}

function ClassSettingsForm({ schoolClass, teachers, onSaved }: ClassSettingsFormProps) {
  const [name, setName] = useState(schoolClass.name);
  const [teacherId, setTeacherId] = useState(schoolClass.teacher ? String(schoolClass.teacher.id) : '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.patch(`/classes/${schoolClass.id}`, {
        name,
        teacherId: teacherId ? Number(teacherId) : null,
      });
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card inline-form" onSubmit={handleSubmit}>
      <label>
        Class name
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label>
        Teacher
        <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
          <option value="">No teacher</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.firstName} {t.lastName}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" disabled={saving}>
        {saving ? 'Saving…' : 'Save'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}