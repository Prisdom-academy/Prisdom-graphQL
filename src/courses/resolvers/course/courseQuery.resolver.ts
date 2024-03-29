import { UseGuards } from '@nestjs/common'
import { Resolver, Query, ResolveField, Args, Context } from '@nestjs/graphql'
import { PermissionRequire } from 'src/common/decorators/PermissionRequire.decorator'
import { AuthGuard } from 'src/common/guards/auth.guard'
import { CourseService } from 'src/courses/services/course.service'
import { PaginationInput } from 'src/graphql'
import { SearchOptionInput } from '../../../graphql'

@UseGuards(AuthGuard)
@Resolver('CourseQuery')
export class CourseQueryResolver {
  constructor(private courseService: CourseService) {}

  @PermissionRequire({ course: ['R'] })
  @Query()
  courseQuery() {
    return {}
  }

  @ResolveField('courses')
  async getAllCourses(
    @Context() { req }: DynamicObject,
    @Args('pagination') pg?: PaginationInput,
    @Args('searchOption') searchOpt?: SearchOptionInput
  ) {
    const pgOptions = this.courseService.buildPaginationOptions(pg)
    const searchOption = this.courseService.buildSearchOptions(searchOpt)

    const token = this.courseService.getTokenFromHttpHeader(req.headers)
    const courses = await this.courseService.findWithOptions(
      { ...pgOptions, ...searchOption },
      { token, strictResourceName: 'course' }
    )

    return courses.map((course) => ({
      ...course,
    }))
  }

  @ResolveField('course')
  async getCourseById(
    @Args('id') id: string,
    @Context() { req }: DynamicObject
  ) {
    const token = this.courseService.getTokenFromHttpHeader(req.headers)
    const course = await this.courseService.findById(
      id,
      {},
      { token, strictResourceName: 'course' }
    )

    return {
      ...course,
    }
  }

  @ResolveField('totalCourses')
  async totalCourses(@Context() { req }: DynamicObject) {
    const token = this.courseService.getTokenFromHttpHeader(req.headers)

    return this.courseService.countingTotalItem({
      token,
      strictResourceName: 'course',
    })
  }
}
