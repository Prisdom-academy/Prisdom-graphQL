import { ScheduleModule } from '@nestjs/schedule';
import { CourseModule } from './courses/Course.module';
import { CacheModule, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AuthModule } from './auth/Auth.module';
import { HeartBeat as HeartBeatModule } from './HeartBeat/HeartBeat.module';
import { PermissionModule } from './permission/permission.module';
import { AdminUserModule } from './AdminUser/AdminUser.module';
import { APP_GUARD } from '@nestjs/core';
import { PermissionGuard } from './common/guards/permission.guard';
import { CommonModule } from './common/Common.module';
import { ConfigModule } from '@nestjs/config';
import { TagModule } from './tag/tag.module';
import { InstructorModule } from './instructor/instructor.module';
import { AssignmentModule } from './assignment/assignment.module';

const graphQLModuleInit = GraphQLModule.forRoot({
  typePaths: ['./**/*.graphql'],
  installSubscriptionHandlers: true,
  definitions: {
    path: join(process.cwd(), 'src/graphql.ts'),
    outputAs: 'class',
    emitTypenameField: true,
  },
  cors: {
    origin: 'http://localhost:3000',
  },
  fieldResolverEnhancers: ['guards'],
});

const typeORMModuleInit = TypeOrmModule.forRoot();
const EnvInitModule = ConfigModule.forRoot({
  envFilePath: ['.env.development'],
});

const cacheManagerModule = CacheModule.register({
  ttl: 1000, // 1000s
  max: 100
})

const scheduleModule = ScheduleModule.forRoot()

@Module({
  imports: [
    scheduleModule,
    typeORMModuleInit,
    graphQLModuleInit,
    cacheManagerModule,
    HeartBeatModule,
    AuthModule,
    AdminUserModule,
    PermissionModule,
    CommonModule,
    InstructorModule,
    CourseModule,
    EnvInitModule,
    TagModule,
    AssignmentModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule {}
