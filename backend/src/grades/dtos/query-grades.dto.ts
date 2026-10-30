import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class QueryGradesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  studentId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  classId?: number;

  @IsOptional()
  @IsString()
  subject?: string;
}
