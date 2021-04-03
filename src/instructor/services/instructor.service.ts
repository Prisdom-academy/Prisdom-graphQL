import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { Instructor } from './../entities/Instructor.entity';
import * as _ from 'lodash';

interface InstructorInput {
  name: string;
  email: string;
  title: string;
  description: string;
  imageUrl: string;
  filePath: string;
  phone: string;
  clientUserId?: string;
}

@Injectable()
export class InstructorService extends BaseService<Instructor> {
  constructor(
    @InjectRepository(Instructor)
    private instructorRepo: Repository<Instructor>,
  ) {
    super(instructorRepo, 'Instructor');
  }

  createInstructor(data: InstructorInput) {
    const instructor = this.instructorRepo.create({
      ...data,
    });
    return this.instructorRepo.save(instructor);
  }

  async updateInstructor(id: string, data: InstructorInput) {
    const inst = await this.instructorRepo.findOne(id);

    if (!inst) {
      throw new NotFoundException('Cannot found this instructor');
    }

    _.forOwn(data, (value, key: keyof InstructorInput) => {
      value && (inst[key] = value);
    });

    return this.instructorRepo.save(inst);
  }
}