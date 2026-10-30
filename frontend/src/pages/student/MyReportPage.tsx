import type { GradeReport, StudentProfile } from '../../api/types';
import { AverageSummary } from '../../components/AverangeSummary';
import { GradesTable } from '../../components/GradesTable';
import { useApiData } from '../../hooks/useApiData';

export function MyReportPage() {
  const profile = useApiData<StudentProfile>('/students/me');
  const report = useApiData<GradeReport>('/grades/me');

  if (profile.error) return <p className="error">{profile.error}</p>;
  if (!profile.data) return <p>Loading…</p>;

  const student = profile.data;
  const teacher = student.class?.teacher;

  return (
    <section className="stack">
      <h1>
        {student.firstName} {student.lastName}
      </h1>

      <div className="card">
        <h2>Profile</h2>
        <dl className="details">
          <dt>Email</dt>
          <dd>{student.email}</dd>
          <dt>Date of birth</dt>
          <dd>{student.dateOfBirth}</dd>
          <dt>Class</dt>
          <dd>{student.class?.name ?? 'Not assigned to a class'}</dd>
          <dt>Class teacher</dt>
          <dd>{teacher ? `${teacher.firstName} ${teacher.lastName} (${teacher.email})` : '—'}</dd>
        </dl>
      </div>

      {report.error && <p className="error">{report.error}</p>}
      {report.data && (
        <>
          <AverageSummary report={report.data} />
          <div className="card">
            <h2>All grades</h2>
            <GradesTable grades={report.data.grades} showStudent={false} />
          </div>
        </>
      )}
    </section>
  );
}