import { ClientUser } from 'src/ClientUser/entities/ClientUser.entity';

import { UserComment } from 'src/comment/entities/UserComment.entity';
import { BaseEntity } from 'src/common/Entity/base.entity';
import { Instructor } from 'src/instructor/entities/Instructor.entity';
import { Tag } from 'src/tag/entities/tag.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { Lesson } from './Lesson.entity';

@Entity()
export class Course extends BaseEntity {
  @Column()
  description: string;

  @Column('int4')
  votes: number;

  @Column()
  imageUrl: string;

  @Column('int2')
  timeByHour: number;

  @OneToMany(() => Lesson, (lesson) => lesson.course)
  lessons: Lesson[];

  @ManyToOne(() => Instructor, (instructor) => instructor.courses)
  @JoinColumn()
  instructor: Instructor;

  @Column()
  isCompleted: boolean;

  @Column()
  benefits: string;

  @Column()
  requirements: string;

  @ManyToMany(() => ClientUser, clientUser => clientUser.courses)
  @JoinTable()
  joiningUsers?: string[];

  @OneToMany(() => Tag, (tag) => tag.course)
  tags: Tag[];

  @Column('int2')
  levels: number;

  @OneToMany(() => UserComment, (userComment) => userComment.course)
  comments: UserComment[];
}
