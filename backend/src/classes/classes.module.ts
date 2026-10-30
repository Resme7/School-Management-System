import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../students/entities/student.entity';
import { TeachersModule } from '../teachers/teachers.module';
import { ClassesController } from './controllers/classes.controler';
import { SchoolClass } from './entities/school-class.entity';
import { ClassesRepository } from './repositories/classes.repository';
import { ClassesService } from './services/classes.service';

@Module({
  imports: [TypeOrmModule.forFeature([SchoolClass, Student]), TeachersModule],
  controllers: [ClassesController],
  providers: [ClassesRepository, ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
