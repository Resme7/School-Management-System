import { Link, useParams } from 'react-router-dom';
import type { GradeReport, Student } from '../../api/types';
import { AverageSummary } from '../../components/AverangeSummary';
import { GradesTable } from '../../components/GradesTable';
import { useApiData } from '../../hooks/useApiData';

export function StudentDetailPage() {
  const { id } = useParams();
  const student = useApiData<Student>(`/students/${id}`);
  const report = useApiData<GradeReport>(`/grades/student/${id}`);

  if (student.error) {
    return (
      <section>
        <p className="error">{student.error}</p>
        <Link to="/students">← Back to students</Link>
      </section>
    );
  }
  if (!student.data) return <p>Loading…</p>;

  const s = student.data;

  return (
    <section className="stack">
      <div>
        <Link to="/students">← Back to students</Link>
        <h1>
          {s.firstName} {s.lastName}
        </h1>
      </div>

      <div className="card">
        <h2>Details</h2>
        <dl className="details">
          <dt>Email</dt>
          <dd>{s.email}</dd>
          <dt>Date of birth</dt>
          <dd>{s.dateOfBirth}</dd>
          <dt>Class</dt>
          <dd>
            {s.class ? <Link to={`/classes/${s.class.id}`}>{s.class.name}</Link> : 'Not assigned'}
          </dd>
        </dl>
      </div>

      {report.error && <p className="error">{report.error}</p>}
      {report.data && (
        <>
          <AverageSummary report={report.data} />
          <div className="card">
            <h2>Grades</h2>
            <GradesTable grades={report.data.grades} showStudent={false} />
            {s.class && (
              <p>
                <Link to={`/grades?classId=${s.class.id}&studentId=${s.id}`}>
                  Add or edit grades →
                </Link>
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}