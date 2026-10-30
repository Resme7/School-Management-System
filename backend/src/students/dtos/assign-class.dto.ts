import { IsInt, IsOptional } from 'class-validator';

export class AssignClassDto {
  @IsOptional()
  @IsInt()
  classId?: number | null;
}
