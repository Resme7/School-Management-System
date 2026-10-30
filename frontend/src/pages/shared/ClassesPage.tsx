import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, getErrorMessage } from '../../api/client';
import type { SchoolClass, Teacher } from '../../api/types';
import { useAuth } from '../../auth/userAuth';
import { useApiData } from '../../hooks/useApiData';

export function ClassesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const classes = useApiData<SchoolClass[]>('/classes');
  const teachers = useApiData<Teacher[]>(isAdmin ? '/teachers' : null);

  const [name, setName] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await api.post('/classes', { name, teacherId: teacherId ? Number(teacherId) : null });
      setName('');
      setTeacherId('');
      classes.reload();
      teachers.reload();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(schoolClass: SchoolClass) {
    const message = `Delete class ${schoolClass.name}? Its students will remain without a class.`;
    if (!window.confirm(message)) return;

    setActionError(null);
    try {
      await api.delete(`/classes/${schoolClass.id}`);
      classes.reload();
      teachers.reload();
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  }

  const list = (
    <div className="card">
      {classes.loading && !classes.data && <p>Loading…</p>}
      {classes.error && <p className="error">{classes.error}</p>}
      {classes.data && classes.data.length === 0 && (
        <p>{isAdmin ? 'No classes yet.' : 'You are not assigned to any class yet.'}</p>
      )}
      {classes.data && classes.data.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Class</th>
              <th>Teacher</th>
              <th>Students</th>
              {isAdmin && <th />}
            </tr>
          </thead>
          <tbody>
            {classes.data.map((c) => (
              <tr key={c.id}>
                <td>
                  <Link to={`/classes/${c.id}`}>{c.name}</Link>
                </td>
                <td>{c.teacher ? `${c.teacher.firstName} ${c.teacher.lastName}` : '—'}</td>
                <td>{c.studentCount}</td>
                {isAdmin && (
                  <td className="actions">
                    <button className="danger" onClick={() => handleDelete(c)}>
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  if (!isAdmin) {
    return (
      <section>
        <h1>My classes</h1>
        {list}
      </section>
    );
  }

  return (
    <section>
      <h1>Classes</h1>
      {actionError && <p className="error">{actionError}</p>}

      <div className="page-grid">
        {list}

        <form className="card form" onSubmit={handleCreate}>
          <h2>Add class</h2>
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Teacher
            <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
              <option value="">No teacher yet</option>
              {teachers.data?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.firstName} {t.lastName}
                </option>
              ))}
            </select>
          </label>

          {formError && <p className="error">{formError}</p>}

          <div className="actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Add class'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}