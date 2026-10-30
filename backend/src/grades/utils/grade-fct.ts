function average(values: number[]): number | null {
  if (values.length === 0) return null;
  const sum = values.reduce((total, v) => total + v, 0);
  return Math.round((sum / values.length) * 100) / 100;
}

export function summarizeGrades(grades: { subject: string; value: number }[]) {
  const bySubject = new Map<string, number[]>();
  for (const grade of grades) {
    const values = bySubject.get(grade.subject) ?? [];
    values.push(grade.value);
    bySubject.set(grade.subject, values);
  }

  return {
    average: average(grades.map((g) => g.value)),
    subjectAverages: [...bySubject.entries()]
      .map(([subject, values]) => ({
        subject,
        average: average(values)!,
        count: values.length,
      }))
      .sort((a, b) => a.subject.localeCompare(b.subject)),
  };
}
