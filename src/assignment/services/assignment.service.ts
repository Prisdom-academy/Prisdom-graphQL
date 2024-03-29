import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { BaseService } from 'src/common/services/base.service'
import { LessonService } from 'src/courses/services/lesson.service'
import {
  CodeChallengeSetInput,
  CodeConfigInput,
  EvaluationInput,
  FileAssignmentSetInput,
  QuizSetInput,
  SubmitInput,
  TypeAssign,
} from 'src/graphql'
import { Repository } from 'typeorm'
import * as _ from 'lodash'
import { Assignment } from 'src/assignment/entities/Assignment.entity'
import { CourseService } from 'src/courses/services/course.service'
import { CodeChallengeService } from './codeChallenge/codeChallenge.service'
import { QuizService } from './quiz/quiz.service'
import { TestCaseProgrammingLanguage } from '../entities/codeChallenge/Testcase.entity'
import { FileAssignmentService } from './fileAssignment/fileAssignment.service'

@Injectable()
export class AssignmentService extends BaseService<Assignment> {
  constructor(
    @InjectRepository(Assignment)
    private assignmentRepo: Repository<Assignment>,
    @Inject(forwardRef(() => LessonService))
    private lessonService: LessonService,
    private codeChallengeService: CodeChallengeService,
    private quizService: QuizService,
    private fileAssignService: FileAssignmentService,
    private courseService: CourseService
  ) {
    super(assignmentRepo, 'Assignment')
  }

  async getTypeAssign(id, idAssign) {
    const assignment = await this.findById(id, {
      relations: {
        codeChallenges: true,
        quizs: true,
        fileAssignments: true,
      },
    })
    const codeChallenges = _.some(assignment.codeChallenges, ['id', idAssign])

    if (codeChallenges) {
      return TypeAssign.codeChallenge
    }

    const quizs = _.some(assignment.quizs, ['id', idAssign])

    if (quizs) {
      return TypeAssign.quiz
    }

    const fileAssignment = _.some(assignment.fileAssignments, ['id', idAssign])

    if (fileAssignment) {
      return TypeAssign.fileAssignment
    }

    throw new NotFoundException(`Assignment with id ${idAssign} is not exist`)
  }

  async createAssignment(lessonId: string) {
    const lesson = await this.lessonService.findById(lessonId)
    const assignment = this.assignmentRepo.create({
      lesson,
    })

    return this.assignmentRepo.save(assignment)
  }

  /**
   * -------------------------
   * Code Challenge Service
   * -------------------------
   */
  async runCode(code: string, language: TestCaseProgrammingLanguage) {
    return this.codeChallengeService.runCode(code, language)
  }

  async runTestCase(challengeId: string, data: CodeConfigInput) {
    return this.codeChallengeService.runTestCase(challengeId, data)
  }

  async getCodeChallenge(id: string) {
    return this.codeChallengeService.findById(id)
  }

  async setCodeChallenge(id: string, data: CodeChallengeSetInput) {
    if (!id) {
      return this.codeChallengeService.create(data)
    }

    return this.codeChallengeService.update(id, data)
  }

  async deleteCodeChallenge(id: string) {
    return this.codeChallengeService.delete(id)
  }
  /**
   * -----------------------------
   * Code Challenge Service end
   * -----------------------------
   */

  /**
   * ---------------
   * Quiz Service
   * ---------------
   */
  async getQuiz(id: string) {
    return this.quizService.findById(id)
  }

  async setQuiz(id: string, data: QuizSetInput) {
    if (!id) {
      return this.quizService.create(data)
    }

    return this.quizService.update(id, data)
  }

  async deleteQuiz(id: string) {
    return this.quizService.delete(id)
  }
  /**
   * -------------------
   * Quiz Service end
   * -------------------
   */

  /**
   * ---------------------------
   *  File Assignment Service
   * ---------------------------
   */

  async getFileAssign(id: string) {
    return this.fileAssignService.findById(id)
  }

  async setFileAssign(id: string, data: FileAssignmentSetInput) {
    if (!id) {
      return this.fileAssignService.create(data)
    }

    return this.fileAssignService.update(id, data)
  }

  async deleteFileAssign(id: string) {
    return this.fileAssignService.delete(id)
  }

  async submitAssignment(id: string, data: SubmitInput, userId: string) {
    const course = await this.courseService.findById(data.courseId, {
      relations: { joinedUsers: true },
    })
    const checkUserJoinedCourse = _.some(course.joinedUsers, ['id', userId])
    if (!checkUserJoinedCourse) {
      throw new BadRequestException(
        `User with id ${userId} doesn't join this course`
      )
    }

    if (!data.groupAssignmentId) {
      return this.fileAssignService.firstSubmit(id, data, userId)
    }

    return this.fileAssignService.submit(id, data, userId)
  }

  async evaluationAssignment(id: string, data: EvaluationInput, token: string) {
    return this.fileAssignService.evaluation(id, data, token)
  }

  async viewSubmittedAssign(groupAssignId: string, order: number) {
    return this.fileAssignService.viewSubmittedAssign(groupAssignId, order)
  }

  /**
   * ------------------------------
   * File Assignment Service end
   * ------------------------------
   */

  async deleteAssign(id: string) {
    const { codeChallenges, quizs, fileAssignments } = await this.findById(id, {
      relations: {
        codeChallenges: true,
        quizs: true,
        fileAssignments: true,
      },
    })

    if (
      codeChallenges.length === 0 &&
      quizs.length === 0 &&
      fileAssignments.length === 0
    ) {
      this.deleteOneById(id)
    }
  }
}
