import {
  Body,Controller, Delete,Get, HttpCode, HttpStatus, Param,ParseIntPipe, Patch,Post,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { CreateTeacherDto } from '../dtos/create-teacher.dto';
import { UpdateTeacherDto } from '../dtos/update-teacher.dto';
import { TeacherService } from '../services/teacher.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('teachers')
@ApiBearerAuth()
@Controller('teachers')
@Roles(Role.ADMIN)
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Get('me')
  @Roles(Role.TEACHER)
  findMe(@CurrentUser() user: JwtPayload) {
    return this.teacherService.findMe(user.sub);
  }

  @Post()
  create(@Body() dto: CreateTeacherDto) {
    return this.teacherService.create(dto);
  }

  @Get()
  findAll() {
    return this.teacherService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teacherService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTeacherDto) {
    return this.teacherService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.teacherService.remove(id);
  }
}
