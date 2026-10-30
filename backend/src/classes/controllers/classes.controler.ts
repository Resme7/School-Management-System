import {
  Body, Controller,Param,ParseIntPipe,Patch,Post, Delete, Get, HttpCode, HttpStatus,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { AssignStudentsDto } from '../dtos/assign-student.dto';
import { AssignTeacherDto } from '../dtos/assign-teacher.dto';
import { CreateClassDto } from '../dtos/create-class.dto';
import { UpdateClassDto } from '../dtos/update-class.dto';
import { ClassesService } from '../services/classes.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('classes')
@ApiBearerAuth()
@Controller('classes')
@Roles(Role.ADMIN)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  create(@Body() dto: CreateClassDto) {
    return this.classesService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  findAll(@CurrentUser() user: JwtPayload) {
    return this.classesService.findAll(user);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.classesService.findOne(id, user);
  }

  @Get(':id/students')
  @Roles(Role.ADMIN, Role.TEACHER)
  findStudents(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.classesService.findStudents(id, user);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClassDto) {
    return this.classesService.update(id, dto);
  }

  @Patch(':id/teacher')
  assignTeacher(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignTeacherDto,
  ) {
    return this.classesService.assignTeacher(id, dto.teacherId ?? null);
  }

  @Post(':id/students')
  addStudents(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignStudentsDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.classesService.addStudents(id, dto.studentIds, user);
  }

  @Delete(':id/students/:studentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeStudent(
    @Param('id', ParseIntPipe) id: number,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.classesService.removeStudent(id, studentId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.remove(id);
  }
}
