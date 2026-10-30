import type { Role } from '../api/types';

export function homePath(role: Role): string {
  if (role === 'ADMIN') return '/students';
  if (role === 'TEACHER') return '/classes';
  return '/me';
}