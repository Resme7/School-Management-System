import type { GradeReport } from '../api/types';

export function AverageSummary({ report }: { report: GradeReport }) {
  return (
    <div className="card summary">
      <div className="average">
        <span className="muted">Overall average</span>
        <strong>{report.average !== null ? report.average.toFixed(2) : '—'}</strong>
        <span className="muted">{report.grades.length} grades</span>
      </div>

      {report.subjectAverages.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Average</th>
              <th>Grades</th>
            </tr>
          </thead>
          <tbody>
            {report.subjectAverages.map((s) => (
              <tr key={s.subject}>
                <td>{s.subject}</td>
                <td>{s.average.toFixed(2)}</td>
                <td>{s.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}