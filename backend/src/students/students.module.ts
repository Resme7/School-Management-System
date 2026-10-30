import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesModule } from '../classes/classes.module';
import { UsersModule } from '../users/user.module';
import { StudentController } from './controllers/student.controller';
import { Student } from './entities/student.entity';
import { StudentRepository } from './repositories/student.repository';
import { StudentService } from './services/student.service';

@Module({
  imports: [TypeOrmModule.forFeature([Student]), UsersModule, ClassesModule],
  controllers: [StudentController],
  providers: [StudentRepository, StudentService],
  exports: [StudentService],
})
export class StudentsModule {}
