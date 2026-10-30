import { useState } from 'react';
import { getErrorMessage } from '../api/client';
import type { Grade } from '../api/types';
import { todayIso } from '../utils/dates';

export interface GradeChanges {
  subject: string;
  value: number;
  date: string;
}

interface GradesTableProps {
  grades: Grade[];
  showStudent?: boolean;
  canEdit?: (grade: Grade) => boolean;
  canDelete?: boolean;
  onUpdate?: (gradeId: number, changes: GradeChanges) => Promise<void>;
  onDelete?: (grade: Grade) => void;
}

interface EditingState {
  id: number;
  subject: string;
  value: string;
  date: string;
}

export function GradesTable({
  grades,
  showStudent = true,
  canEdit,
  canDelete = false,
  onUpdate,
  onDelete,
}: GradesTableProps) {
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasActions = Boolean(onUpdate || (canDelete && onDelete));

  if (grades.length === 0) return <p>No grades yet.</p>;

  async function save() {
    if (!editing || !onUpdate) return;
    setError(null);
    try {
      await onUpdate(editing.id, {
        subject: editing.subject,
        value: Number(editing.value),
        date: editing.date,
      });
      setEditing(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <>
      {error && <p className="error">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Date</th>
            {showStudent && <th>Student</th>}
            <th>Subject</th>
            <th>Grade</th>
            <th>Given by</th>
            {hasActions && <th />}
          </tr>
        </thead>
        <tbody>
          {grades.map((grade) => {
            const isEditing = editing?.id === grade.id;
            const studentName = `${grade.student.lastName} ${grade.student.firstName}`;
            const teacherName = grade.teacher
              ? `${grade.teacher.firstName} ${grade.teacher.lastName}`
              : 'Administrator';

            if (isEditing && editing) {
              return (
                <tr key={grade.id}>
                  <td>
                    <input
                      type="date"
                      value={editing.date}
                      onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                      max={todayIso()}
                    />
                  </td>
                  {showStudent && <td>{studentName}</td>}
                  <td>
                    <input
                      value={editing.subject}
                      onChange={(e) => setEditing({ ...editing, subject: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={editing.value}
                      onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                    />
                  </td>
                  <td>{teacherName}</td>
                  <td className="actions">
                    <button onClick={save}>Save</button>
                    <button className="secondary" onClick={() => setEditing(null)}>
                      Cancel
                    </button>
                  </td>
                </tr>
              );
            }

            return (
              <tr key={grade.id}>
                <td>{grade.date}</td>
                {showStudent && (
                  <td>
                    {studentName}
                    {grade.student.class && <span className="muted"> · {grade.student.class.name}</span>}
                  </td>
                )}
                <td>{grade.subject}</td>
                <td>
                  <span className={grade.value < 5 ? 'grade failing' : 'grade'}>{grade.value}</span>
                </td>
                <td>{teacherName}</td>
                {hasActions && (
                  <td className="actions">
                    {onUpdate && canEdit?.(grade) && (
                      <button
                        className="secondary"
                        onClick={() =>
                          setEditing({
                            id: grade.id,
                            subject: grade.subject,
                            value: String(grade.value),
                            date: grade.date,
                          })
                        }
                      >
                        Edit
                      </button>
                    )}
                    {canDelete && onDelete && (
                      <button className="danger" onClick={() => onDelete(grade)}>
                        Delete
                      </button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}