
import { UseGuards } from '@nestjs/common';
import { InstructorService } from './../services/instructor.service';
import { Args, Query, ResolveField } from '@nestjs/graphql';
import { Resolver } from '@nestjs/graphql';
import { PermissionRequire } from 'src/common/decorators/PermissionRequire.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';

@UseGuards(AuthGuard)
@Resolver('InstructorQuery')
export class InstructorQueryResolver {
  constructor(
    private instructorService: InstructorService
  ) { }

  @PermissionRequire({ instructor: ['R'] })
  @Query()
  instructorQuery() {
    return {};
  }

  @ResolveField('instructors')
  async getAllInstructors () {
    return this.instructorService.findWithOptions();
  }

  @ResolveField('instructor')
  getInstructorById(@Args('id') id: string) {
    return this.instructorService.findById(id);
  }
}