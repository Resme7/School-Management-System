import {
  IsDateString,IsInt, IsNotEmpty, IsOptional,IsString, Max,MaxLength, Min,
} from 'class-validator';
import { IsNotFutureDate } from '../../common/validators/is-not-future-date.validator';

export class CreateGradeDto {
  @IsInt()
  studentId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  subject: string;

  @IsInt()
  @Min(1)
  @Max(10)
  value: number;

  @IsOptional()
  @IsDateString()
  @IsNotFutureDate()
  date?: string;
}
