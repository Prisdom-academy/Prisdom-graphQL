import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CommonModule } from 'src/common/Common.module'
import { PermissionModule } from 'src/permission/permission.module'
import { AdminUserTypeResolver } from './resolvers/adminUserType.Resolver'
import { AdminUser } from './AdminUser.entity'
import { AdminUserMutationResolver } from './resolvers/adminUserMutation.resolver'
import { AdminUserQueryResolver } from './resolvers/adminUserQuery.resolver'
import { AdminUserService } from './services/AdminUser.service'

@Module({
  imports: [
    forwardRef(() => CommonModule),
    TypeOrmModule.forFeature([AdminUser]),
    forwardRef(() => PermissionModule),
  ],
  providers: [
    AdminUserService,
    AdminUserMutationResolver,
    AdminUserQueryResolver,
    AdminUserTypeResolver,
  ],
  exports: [AdminUserService],
})
export class AdminUserModule {}
