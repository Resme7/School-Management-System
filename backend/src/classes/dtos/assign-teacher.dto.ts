import { IsInt, IsOptional } from 'class-validator';

export class AssignTeacherDto {
  @IsOptional()
  @IsInt()
  teacherId?: number | null;
}
