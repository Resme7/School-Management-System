import {
  IsDateString, IsEmail, IsInt,IsNotEmpty,IsOptional, IsString, MaxLength,MinLength,
} from 'class-validator';
import { IsNotFutureDate } from '../../common/validators/is-not-future-date.validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;


  @IsDateString()
  @IsNotFutureDate()
  dateOfBirth: string;

  @IsOptional()
  @IsInt()
  classId?: number | null;
}
