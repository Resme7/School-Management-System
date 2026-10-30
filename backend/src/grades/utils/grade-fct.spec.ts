import { summarizeGrades } from './grade-fct';

const grade = (subject: string, value: number) => ({ subject, value });

describe('summarizeGrades', () => {
  it('returns no average when the student has no grades', () => {
    const result = summarizeGrades([]);

    expect(result.average).toBeNull();
    expect(result.subjectAverages).toEqual([]);
  });

  it('uses the grade itself as the average when there is only one', () => {
    const result = summarizeGrades([grade('Mathematics', 7)]);

    expect(result.average).toBe(7);
    expect(result.subjectAverages).toEqual([{ subject: 'Mathematics', average: 7, count: 1 }]);
  });

  it('computes the overall average of all grades', () => {
    const result = summarizeGrades([
      grade('Mathematics', 8),
      grade('English', 10),
      grade('History', 6),
    ]);

    expect(result.average).toBe(8);
  });

  it('rounds averages to two decimals', () => {
    // 9 + 7 + 10 = 26, and 26 / 3 = 8.666...
    const result = summarizeGrades([
      grade('Mathematics', 9),
      grade('Mathematics', 7),
      grade('English', 10),
    ]);

    expect(result.average).toBe(8.67);
  });

  it('computes a separate average for each subject', () => {
    const result = summarizeGrades([
      grade('Mathematics', 9),
      grade('English', 10),
      grade('Mathematics', 7),
    ]);

    expect(result.subjectAverages).toEqual([
      { subject: 'English', average: 10, count: 1 },
      { subject: 'Mathematics', average: 8, count: 2 },
    ]);
  });

  it('sorts subjects alphabetically', () => {
    const result = summarizeGrades([
      grade('Physics', 5),
      grade('Biology', 6),
      grade('English', 7),
    ]);

    expect(result.subjectAverages.map((s) => s.subject)).toEqual(['Biology', 'English', 'Physics']);
  });

  it('averages all grades, not the subject averages', () => {
    // Overall: (10 + 10 + 10 + 4) / 4 = 8.5
    // Average of subject averages would be: (10 + 4) / 2 = 7
    const result = summarizeGrades([
      grade('Mathematics', 10),
      grade('Mathematics', 10),
      grade('Mathematics', 10),
      grade('English', 4),
    ]);

    expect(result.average).toBe(8.5);
  });
});