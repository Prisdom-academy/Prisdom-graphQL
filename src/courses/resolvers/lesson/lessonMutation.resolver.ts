import { UseGuards } from '@nestjs/common';
import { Args, Mutation, ResolveField, Resolver } from '@nestjs/graphql';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Lesson } from 'src/courses/entities/Lesson.entity';
import { LessonService } from 'src/courses/services/lesson.service';
import { LessonSetInput } from 'src/graphql';

@UseGuards(AuthGuard)
@Resolver('LessonMutation')
export class LessonMutationResolver {
  constructor(private lessonService: LessonService) {}

  @Mutation()
  lessonMutation() {
    return {};
  }

  @ResolveField()
  async setLesson(@Args('data') data: LessonSetInput, @Args('id') id?: string) {
    let lesson: Lesson;

    if (!id) {
      lesson = await this.lessonService.createLesson(data);
    } else {
      lesson = await this.lessonService.updateLesson(id, data);
    }

    return {
      ...lesson,
    };
  }

  @ResolveField()
  async deleteLesson(@Args('id') id: string) {
    return !!this.lessonService.deleteOneById(id);
  }
}