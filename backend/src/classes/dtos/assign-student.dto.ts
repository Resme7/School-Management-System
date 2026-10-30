import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

export class AssignStudentsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  studentIds: number[];
}
