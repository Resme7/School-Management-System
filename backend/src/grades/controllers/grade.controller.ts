import {
  Get,HttpCode,HttpStatus, Param, Body, Controller, Delete,ParseIntPipe,Patch, Post,Query,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { CreateGradeDto } from '../dtos/create-grade.dto';
import { QueryGradesDto } from '../dtos/query-grades.dto';
import { UpdateGradeDto } from '../dtos/update-grade.dto';
import { GradeService } from '../services/grade.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('grades')
@ApiBearerAuth()
@Controller('grades')
@Roles(Role.ADMIN, Role.TEACHER)
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Get('me')
  @Roles(Role.STUDENT)
  findMine(@CurrentUser() user: JwtPayload) {
    return this.gradeService.findMine(user);
  }

  @Get('student/:studentId')
  findForStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.gradeService.findForStudent(studentId, user);
  }

  @Get()
  findAll(@Query() query: QueryGradesDto, @CurrentUser() user: JwtPayload) {
    return this.gradeService.findAll(query, user);
  }

  @Post()
  create(@Body() dto: CreateGradeDto, @CurrentUser() user: JwtPayload) {
    return this.gradeService.create(dto, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGradeDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.gradeService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gradeService.remove(id);
  }
}
