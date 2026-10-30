import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, getErrorMessage } from '../../api/client';
import type { ClassDetail, Grade, GradeReport, SchoolClass, Teacher } from '../../api/types';
import { useAuth } from '../../auth/userAuth';
import { AverageSummary } from '../../components/AverangeSummary';
import { GradesTable, type GradeChanges } from '../../components/GradesTable';
import { useApiData } from '../../hooks/useApiData';
import { todayIso } from '../../utils/dates';

export function GradesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  
  const [searchParams, setSearchParams] = useSearchParams();
  const classId = searchParams.get('classId') ?? '';
  const studentId = searchParams.get('studentId') ?? '';

  const classes = useApiData<SchoolClass[]>('/classes');
  const classDetail = useApiData<ClassDetail>(classId ? `/classes/${classId}` : null);
  const me = useApiData<Teacher>(isAdmin ? null : '/teachers/me');

  const list = useApiData<Grade[]>(studentId ? null : classId ? `/grades?classId=${classId}` : '/grades');
  const report = useApiData<GradeReport>(studentId ? `/grades/student/${studentId}` : null);

  const [actionError, setActionError] = useState<string | null>(null);

  const grades = studentId ? report.data?.grades : list.data;
  const loading = studentId ? report.loading : list.loading;
  const error = studentId ? report.error : list.error;

  function setFilters(nextClassId: string, nextStudentId = '') {
    const params: Record<string, string> = {};
    if (nextClassId) params.classId = nextClassId;
    if (nextStudentId) params.studentId = nextStudentId;
    setSearchParams(params);
  }

  function reloadGrades() {
    list.reload();
    report.reload();
  }

  function canEdit(grade: Grade): boolean {
    return isAdmin || (me.data !== null && grade.teacher?.id === me.data.id);
  }

  async function handleUpdate(gradeId: number, changes: GradeChanges) {
    await api.patch(`/grades/${gradeId}`, changes);
    reloadGrades();
  }

  async function handleDelete(grade: Grade) {
    const label = `${grade.subject} ${grade.value} for ${grade.student.firstName} ${grade.student.lastName}`;
    if (!window.confirm(`Delete grade ${label}?`)) return;
    setActionError(null);
    try {
      await api.delete(`/grades/${grade.id}`);
      reloadGrades();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }

  return (
    <section className="stack">
      <h1>Grades</h1>

      <div className="card inline-form filters">
        <label>
          Class
          <select value={classId} onChange={(e) => setFilters(e.target.value)}>
            <option value="">{isAdmin ? 'All classes' : 'All my classes'}</option>
            {classes.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Student
          <select
            value={studentId}
            onChange={(e) => setFilters(classId, e.target.value)}
            disabled={!classId}
          >
            <option value="">{classId ? 'All students' : 'Choose a class first'}</option>
            {classDetail.data?.students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.lastName} {s.firstName}
              </option>
            ))}
          </select>
        </label>
      </div>

      {actionError && <p className="error">{actionError}</p>}

      {studentId && report.data && (
        <div>
          <h2>
            {report.data.student.firstName} {report.data.student.lastName}
          </h2>
          <AverageSummary report={report.data} />
        </div>
      )}

      <div className="page-grid">
        <div className="card">
          {loading && !grades && <p>Loading…</p>}
          {error && <p className="error">{error}</p>}
          {grades && (
            <GradesTable
              grades={grades}
              showStudent={!studentId}
              canEdit={canEdit}
              canDelete={isAdmin}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          )}
        </div>

        <AddGradeForm
          key={`${classId}-${studentId}`}
          students={classDetail.data?.students ?? []}
          initialStudentId={studentId}
          classSelected={Boolean(classId)}
          onAdded={reloadGrades}
        />
      </div>
    </section>
  );
}

interface AddGradeFormProps {
  students: { id: number; firstName: string; lastName: string }[];
  initialStudentId: string;
  classSelected: boolean;
  onAdded: () => void;
}

function AddGradeForm({ students, initialStudentId, classSelected, onAdded }: AddGradeFormProps) {
  const [studentId, setStudentId] = useState(initialStudentId);
  const [subject, setSubject] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(todayIso());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!classSelected) {
    return (
      <div className="card form">
        <h2>Add grade</h2>
        <p className="muted">Choose a class above to add grades for its students.</p>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.post('/grades', {
        studentId: Number(studentId),
        subject,
        value: Number(value),
        date,
      });
      setValue('');
      onAdded();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>Add grade</h2>
      <label>
        Student
        <select value={studentId} onChange={(e) => setStudentId(e.target.value)} required>
          <option value="">Choose a student…</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.lastName} {s.firstName}
            </option>
          ))}
        </select>
      </label>
      <label>
        Subject
        <input value={subject} onChange={(e) => setSubject(e.target.value)} required />
      </label>
      <label>
        Grade (1–10)
        <input
          type="number"
          min={1}
          max={10}
          step={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
        />
      </label>
      <label>
        Date
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={todayIso()} required />
      </label>

      {error && <p className="error">{error}</p>}

      <div className="actions">
        <button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Add grade'}
        </button>
      </div>
    </form>
  );
}