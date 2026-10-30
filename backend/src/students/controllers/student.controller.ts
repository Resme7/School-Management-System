import {
  Post, Param,ParseIntPipe,Patch,Body, Controller, Delete, Get, HttpCode,HttpStatus,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { AssignClassDto } from '../dtos/assign-class.dto';
import { CreateStudentDto } from '../dtos/create-student.dto';
import { UpdateStudentDto } from '../dtos/update-student.dto';
import { StudentService } from '../services/student.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('students')
@ApiBearerAuth()
@Controller('students')
@Roles(Role.ADMIN)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('me')
  @Roles(Role.STUDENT)
  findMe(@CurrentUser() user: JwtPayload) {
    return this.studentService.findMe(user.sub);
  }

  @Post()
  create(@Body() dto: CreateStudentDto) {
    return this.studentService.create(dto);
  }

  @Get()
  findAll() {
    return this.studentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStudentDto) {
    return this.studentService.update(id, dto);
  }

  @Patch(':id/class')
  assignClass(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignClassDto,
  ) {
    return this.studentService.assignClass(id, dto.classId ?? null);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.remove(id);
  }
}
