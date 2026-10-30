import { useState, type FormEvent } from 'react';
import { api, getErrorMessage } from '../../api/client';
import type { SchoolClass, Student } from '../../api/types';
import { useApiData } from '../../hooks/useApiData';
import { Link } from 'react-router-dom';
import { todayIso } from '../../utils/dates';

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  dateOfBirth: '',
  classId: '',
};
type StudentForm = typeof emptyForm;

export function StudentsPage() {
  const students = useApiData<Student[]>('/students');
  const classes = useApiData<SchoolClass[]>('/classes');

  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function updateField(field: keyof StudentForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function startEdit(student: Student) {
    setEditingId(student.id);
    setForm({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      password: '',
      dateOfBirth: student.dateOfBirth,
      classId: student.class ? String(student.class.id) : '',
    });
    setFormError(null);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);

    const payload: Record<string, unknown> = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      dateOfBirth: form.dateOfBirth,
      classId: form.classId ? Number(form.classId) : null,
    };
    // On edit, an empty password means "keep the current one".
    if (form.password) payload.password = form.password;

    try {
      if (editingId) await api.patch(`/students/${editingId}`, payload);
      else await api.post('/students', payload);
      resetForm();
      students.reload();
      classes.reload();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(student: Student) {
    const name = `${student.firstName} ${student.lastName}`;
    if (!window.confirm(`Delete ${name}? Their grades will be deleted too.`)) return;

    setActionError(null);
    try {
      await api.delete(`/students/${student.id}`);
      if (editingId === student.id) resetForm();
      students.reload();
      classes.reload();
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  }

  return (
    <section>
      <h1>Students</h1>
      {actionError && <p className="error">{actionError}</p>}

      <div className="page-grid">
        <div className="card">
          {students.loading && !students.data && <p>Loading…</p>}
          {students.error && <p className="error">{students.error}</p>}
          {students.data && students.data.length === 0 && <p>No students yet.</p>}
          {students.data && students.data.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Date of birth</th>
                  <th>Class</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {students.data.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <Link to={`/students/${student.id}`}>
                        {student.lastName} {student.firstName}
                      </Link>
                    </td>
                    <td>{student.email}</td>
                    <td>{student.dateOfBirth}</td>
                    <td>{student.class?.name ?? '—'}</td>
                    <td className="actions">
                      <button className="secondary" onClick={() => startEdit(student)}>
                        Edit
                      </button>
                      <button className="danger" onClick={() => handleDelete(student)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <form className="card form" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Edit student' : 'Add student'}</h2>
          <label>
            First name
            <input
              value={form.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
              required
            />
          </label>
          <label>
            Last name
            <input
              value={form.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              required
            />
          </label>
          <label>
            {editingId ? 'New password (leave empty to keep)' : 'Password'}
            <input
              type="password"
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              required={!editingId}
              minLength={6}
            />
          </label>
          <label>
            Date of birth
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => updateField('dateOfBirth', e.target.value)}
              max={todayIso()}
              required
            />
          </label>
          <label>
            Class
            <select value={form.classId} onChange={(e) => updateField('classId', e.target.value)}>
              <option value="">No class</option>
              {classes.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          {formError && <p className="error">{formError}</p>}

          <div className="actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add student'}
            </button>
            {editingId && (
              <button type="button" className="secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}