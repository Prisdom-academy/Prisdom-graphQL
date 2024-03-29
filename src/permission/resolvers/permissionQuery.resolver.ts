import { UseGuards } from '@nestjs/common'
import { Resolver, Query, ResolveField, Args, Context } from '@nestjs/graphql'
import { PermissionRequire } from 'src/common/decorators/PermissionRequire.decorator'
import { AuthGuard } from 'src/common/guards/auth.guard'
import { PaginationInput } from 'src/graphql'
import { SearchOptionInput } from '../../graphql'
import { PermissionSet } from '../entities/Permission.entity'
import { PermissionService } from '../services/permission.service'

@UseGuards(AuthGuard)
@Resolver('PermissionQuery')
export class PermissionQueryResolver {
  constructor(private permissionService: PermissionService) {}

  @Query()
  permissionQuery() {
    return {}
  }

  @PermissionRequire({ permission: ['R'] })
  @ResolveField('permissions')
  async getAllPermissions(
    @Context() { req }: DynamicObject,
    @Args('pagination') pg: PaginationInput,
    @Args('searchOption') searchOpt: SearchOptionInput
  ) {
    const pgOptions =
      this.permissionService.buildPaginationOptions<PermissionSet>(pg)
    const token = this.permissionService.getTokenFromHttpHeader(req.headers)
    const permissions = await this.permissionService.findWithOptions(
      {
        relations: {
          role: true,
          createdBy: true,
        },
        ...pgOptions,
      },
      { token, strictResourceName: 'permission' }
    )

    let filterPattern: RegExp = null

    if (searchOpt) {
      filterPattern = new RegExp(searchOpt.searchString, 'i')
    }

    return permissions
      .map((item) => ({
        ...item,
        roleName: item.role.name,
      }))
      .filter((item) =>
        filterPattern ? filterPattern.test(item.roleName) : true
      )
  }

  @PermissionRequire({ permission: ['R'] })
  @ResolveField('permissionWithId')
  async getPermissionById(
    @Args('id') id: string,
    @Context() { req }: DynamicObject
  ) {
    const token = this.permissionService.getTokenFromHttpHeader(req.headers)
    const permission = await this.permissionService.findById(
      id,
      {
        relations: { role: true, createdBy: true },
      },
      { token, strictResourceName: 'permission' }
    )

    return {
      ...permission,
      roleName: permission.role.name,
    }
  }

  @PermissionRequire({ permission: ['R'] })
  @ResolveField('permissionWithRole')
  async getPermissionByRole(@Args('roleName') roleName: string) {
    const permissionSet = await this.permissionService.getPermissionByRole(
      roleName
    )

    return {
      ...permissionSet,
      roleName: permissionSet.role.name,
    }
  }

  @PermissionRequire({ permission: ['R'] })
  @ResolveField()
  async totalPermissions(@Context() { req }: DynamicObject) {
    const token = this.permissionService.getTokenFromHttpHeader(req.headers)

    return this.permissionService.countingTotalItem({
      token,
      strictResourceName: 'permission',
    })
  }
}
