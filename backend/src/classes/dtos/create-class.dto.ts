import {
  IsInt, IsNotEmpty, IsOptional,IsString, MaxLength,
} from 'class-validator';

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsInt()
  teacherId?: number | null;
}
