import { useState, type FormEvent } from 'react';
import { api, getErrorMessage } from '../../api/client';
import type { Teacher } from '../../api/types';
import { useApiData } from '../../hooks/useApiData';

const emptyForm = { firstName: '', lastName: '', email: '', password: '' };
type TeacherForm = typeof emptyForm;

export function TeachersPage() {
  const teachers = useApiData<Teacher[]>('/teachers');

  const [form, setForm] = useState<TeacherForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function updateField(field: keyof TeacherForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function startEdit(teacher: Teacher) {
    setEditingId(teacher.id);
    setForm({
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      password: '',
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
    };
    if (form.password) payload.password = form.password;

    try {
      if (editingId) await api.patch(`/teachers/${editingId}`, payload);
      else await api.post('/teachers', payload);
      resetForm();
      teachers.reload();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(teacher: Teacher) {
    const name = `${teacher.firstName} ${teacher.lastName}`;
    if (!window.confirm(`Delete ${name}? Their classes will remain without a teacher.`)) return;

    setActionError(null);
    try {
      await api.delete(`/teachers/${teacher.id}`);
      if (editingId === teacher.id) resetForm();
      teachers.reload();
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  }

  return (
    <section>
      <h1>Teachers</h1>
      {actionError && <p className="error">{actionError}</p>}

      <div className="page-grid">
        <div className="card">
          {teachers.loading && !teachers.data && <p>Loading…</p>}
          {teachers.error && <p className="error">{teachers.error}</p>}
          {teachers.data && teachers.data.length === 0 && <p>No teachers yet.</p>}
          {teachers.data && teachers.data.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Classes</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {teachers.data.map((teacher) => (
                  <tr key={teacher.id}>
                    <td>
                      {teacher.lastName} {teacher.firstName}
                    </td>
                    <td>{teacher.email}</td>
                    <td>
                      {teacher.classes.length > 0
                        ? teacher.classes.map((c) => c.name).join(', ')
                        : '—'}
                    </td>
                    <td className="actions">
                      <button className="secondary" onClick={() => startEdit(teacher)}>
                        Edit
                      </button>
                      <button className="danger" onClick={() => handleDelete(teacher)}>
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
          <h2>{editingId ? 'Edit teacher' : 'Add teacher'}</h2>
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

          {formError && <p className="error">{formError}</p>}

          <div className="actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add teacher'}
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