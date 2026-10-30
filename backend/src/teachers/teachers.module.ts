import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/user.module';
import { TeacherController } from './controllers/teacher.controllers';
import { Teacher } from './entities/teacher.entity';
import { TeacherRepository } from './repositories/teacher.repository';
import { TeacherService } from './services/teacher.service';

@Module({
  imports: [TypeOrmModule.forFeature([Teacher]), UsersModule],
  controllers: [TeacherController],
  providers: [TeacherRepository, TeacherService],
  exports: [TeacherService],
})
export class TeachersModule {}
