import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsModule } from '../students/students.module';
import { TeachersModule } from '../teachers/teachers.module';
import { GradeController } from './controllers/grade.controller';
import { Grade } from './entities/grade.entity';
import { GradeRepository } from './repositories/grade.repository';
import { GradeService } from './services/grade.service';

@Module({
  imports: [TypeOrmModule.forFeature([Grade]), StudentsModule, TeachersModule],
  controllers: [GradeController],
  providers: [GradeRepository, GradeService],
})
export class GradesModule {}
