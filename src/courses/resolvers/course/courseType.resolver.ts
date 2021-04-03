import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Course } from 'src/courses/entities/Course.entity';
import { CourseService } from 'src/courses/services/course.service';
import { CourseType } from 'src/graphql';

@Resolver('CourseType')
export class CourseTypeResolver {
  constructor(private courseService: CourseService) {}

  @ResolveField()
  async instructor(@Parent() courseParent: CourseType) {
    const course = await this.courseService.findById(courseParent.id, {
      relations: ['instructor'],
    });
    return course.instructor;
  }

  @ResolveField()
  async tags(@Parent() courseParent: CourseType) {
    const course = await this.courseService.findById(courseParent.id, {
      relations: ['tags'],
    });
    return course.tags;
  }

  @ResolveField()
  async lessons(@Parent() courseParent: CourseType) {
    const course = await this.courseService.findById(courseParent.id, {
      relations: ['lessons'],
    });
    return course.lessons;
  }

  @ResolveField()
  async benefits(@Parent() courseParent: Course) {
    return courseParent.benefits.split('|');
  }

  @ResolveField()
  async requirements(@Parent() courseParent: Course) {
    return courseParent.requirements.split('|');
  }
}