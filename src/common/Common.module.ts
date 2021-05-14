import { CourseModule } from './../courses/Course.module';
import { InstructorModule } from './../instructor/instructor.module';
import { CronService } from './services/cron.service';
import { TokenService } from './services/token.service';
import { AuthGuard } from './guards/auth.guard';
import { CacheModule, forwardRef, Module } from '@nestjs/common';
import { PasswordService } from './services/password.service';
import { PermissionModule } from 'src/permission/permission.module';
import { FileService } from './services/file.service';
import { GCStorageService } from './services/GCStorage.service';
import { ConfigService } from '@nestjs/config';
import { CacheService } from './services/cache.service';
import { SubscriptionService } from './services/subscription.service';

@Module({
  imports: [
    forwardRef(() => PermissionModule),
    forwardRef(() => InstructorModule),
    forwardRef(() => CourseModule),
    CacheModule.register(),
  ],
  providers: [
    PasswordService,
    TokenService,
    AuthGuard,
    FileService,
    GCStorageService,
    ConfigService,
    CacheService,
    CronService,
    SubscriptionService,
  ],
  exports: [
    PasswordService,
    AuthGuard,
    TokenService,
    FileService,
    GCStorageService,
    CacheService,
    SubscriptionService,
  ],
})
export class CommonModule {}
