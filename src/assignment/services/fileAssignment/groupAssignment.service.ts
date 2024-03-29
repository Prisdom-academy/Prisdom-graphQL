import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as _ from 'lodash'
import { GroupAssignment } from 'src/assignment/entities/fileAssignment/groupAssignment.entity'
import { SubmittedAssignment } from 'src/assignment/entities/fileAssignment/SubmittedAssignment.entity'
import { ClientUserService } from 'src/clientUser/services/clientUser.service'
import { BaseService } from 'src/common/services/base.service'
import { EvaluationInput, SubmitInput, UpdateScore } from 'src/graphql'
import { Repository } from 'typeorm'
import { SubmittedAssignmentService } from './submittedAssignment.service'

@Injectable()
export class GroupAssignmentService extends BaseService<GroupAssignment> {
  constructor(
    @InjectRepository(GroupAssignment)
    private groupAssignRepo: Repository<GroupAssignment>,
    private clientUserService: ClientUserService,
    private submittedAssignService: SubmittedAssignmentService
  ) {
    super(groupAssignRepo)
  }

  async create(data: SubmitInput, userID: string) {
    const [user, submitted] = await Promise.all([
      this.clientUserService.findById(userID),
      this.submittedAssignService.submit(data),
    ])

    const groupAssignment = this.groupAssignRepo.create({
      title: user.name,
      user,
      submitteds: [submitted],
    })

    return this.groupAssignRepo.save(groupAssignment)
  }

  async update(id: string, data: SubmitInput, userId: string) {
    const group = await this.findById(data.groupAssignmentId, {
      relations: {
        submitteds: true,
        fileAssignment: true,
        user: true,
      },
    })

    if (id !== group.fileAssignment.id.toString()) {
      throw new BadRequestException(
        `this assignment doesn't contain submitted assignment with id ${data.groupAssignmentId}`
      )
    }

    if (group.user.id !== userId) {
      throw new BadRequestException(
        `user with id ${userId} can't excute this action`
      )
    }

    let submittedAssignment: SubmittedAssignment
    let submittedAssignments: SubmittedAssignment[]

    if (!group.submitteds) {
      submittedAssignment = await this.submittedAssignService.submit(data)
      submittedAssignments = []
    } else {
      submittedAssignment = await this.submittedAssignService.submit(
        data,
        group.submitteds.length + 1
      )
      submittedAssignments = _.cloneDeep(group.submitteds)
    }

    submittedAssignments.push(submittedAssignment)
    group.submitteds = submittedAssignments
    group.isUpdated = true

    return this.groupAssignRepo.save(group)
  }

  async evaluation(id: string, data: EvaluationInput, token: string) {
    const group = await this.findById(id, {
      relations: {
        submitteds: true,
        fileAssignment: true,
        user: true,
      },
    })
    if (group.submitteds.length < data.order) {
      throw new BadRequestException(
        `Submitted with order = ${data.order} doesn't exist`
      )
    }

    const submitted = _.find(group.submitteds, ['order', data.order])

    if (data.score || data.score === 0) {
      if (data.score < 0) {
        throw new BadRequestException('A score should be a positive number')
      }

      if (data.score > group.fileAssignment.maxScore) {
        data.score = group.fileAssignment.maxScore
      }
      const scoreInput: UpdateScore = {
        score: Math.abs(data.score - group.previousScore),
        isAdd: data.score > group.previousScore,
      }

      this.clientUserService.updateScore(group.user.id, scoreInput)
      group.previousScore = data.score
    }

    await Promise.all([
      this.groupAssignRepo.save(group),
      this.submittedAssignService.evaluation(submitted.id, data, token),
    ])

    return group
  }

  async delete(id: string) {
    return !!(await this.deleteOneById(id))
  }

  async viewSubmitted(id: string, order: number) {
    const group = await this.findById(id, { relations: { submitteds: true } })

    if (group.submitteds.length < order) {
      throw new BadRequestException(
        `Submitted with order = ${order} doesn't exist`
      )
    }
    const submitteds = _.cloneDeep(group.submitteds)
    const submitted = _.find(submitteds, ['order', order])
    const updateSubmitted = await this.submittedAssignService.view(submitted.id)

    submitted.hasSeen = true
    const checkUpdate = _.some(submitteds, ['hasSeen', false])

    if (!checkUpdate) {
      group.isUpdated = false
    }
    this.groupAssignRepo.save(group)

    return updateSubmitted
  }
}
