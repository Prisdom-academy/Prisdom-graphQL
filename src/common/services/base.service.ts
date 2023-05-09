import { ForbiddenException, NotFoundException } from '@nestjs/common'
import * as _ from 'lodash'
import {
  Repository,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
} from 'typeorm'
import { CacheService } from './cache.service'
import { PermissionSet } from '../../permission/entities/Permission.entity'
import { ICachedPermissionSet } from '../guards/permission.guard'
import { cacheConstant } from '../constants/cache.contant'
import { UtilService } from './util.service'
import { AdminUser } from 'src/adminUser/AdminUser.entity'
import { ClientUser } from 'src/clientUser/entities/ClientUser.entity'
import { FlexiblePerm } from '../decorators/PermissionRequire.decorator'
import { REGEX_PERM } from '../constants/permission.constant'

export interface BaseRepoEntity {
  id: string | number
  createdBy?: AdminUser | ClientUser
}

export interface IStrictConfig {
  token: string
  strictResourceName: keyof Omit<PermissionSet, 'id' | 'role' | 'createdBy'>
}
export abstract class BaseService<
  T extends BaseRepoEntity
> extends UtilService {
  protected repository: Repository<T>

  protected resourceName: string

  protected cachingService: CacheService

  /**
   * BaseService help us solving the DRY problem or working with DB
   * @param repo the repository class you use for the child class
   * @param resourceName using for showing error, and help them know which resources the error come from
   * @param cachingService if the resource using strict, you should inject the caching service
   */
  constructor(
    repo: Repository<T>,
    resourceName?: string,
    cachingService?: CacheService
  ) {
    super()
    this.repository = repo
    this.resourceName = resourceName
    this.cachingService = cachingService
  }

  /**
   * findById using for getting one resource, get the detail
   * @param id the resource id
   * @param options the find-one options pass from other services (@interface FindOneOptions)
   * @param strictConfig params using for strict the resource with permission S
   * @returns one resource
   */
  async findById(
    id: string,
    options: FindOneOptions<T> = {},
    strictConfig?: IStrictConfig
  ) {
    const resource = await this.repository.findOne({
      where: {
        id: id,
      } as FindOptionsWhere<T>,
      ...options,
    })

    if (!resource) {
      throw new NotFoundException(
        `${this.resourceName} with id=${id} not found!!`
      )
    }

    if (_.isEmpty(strictConfig)) return resource

    const { user: adminUser, permissionSet } =
      await this.getAdminUserCredential(strictConfig.token)
    const resourcePerm = permissionSet[strictConfig.strictResourceName]
    const flexibleReadPerm = resourcePerm.match(
      REGEX_PERM.READ
    )[0] as FlexiblePerm
    const isValidPermission = this.isValidPermissionOnResource(
      resource,
      adminUser,
      flexibleReadPerm
    )

    if (!isValidPermission) {
      throw new ForbiddenException(
        "You don't have permission to do this action on resource"
      )
    }

    return resource
  }

  /**
   * using for query multiple resource
   * @param options the common options passing from otherService (@interface FindManyOptions
   * @param strictConfig using for strict the resource with permission S (optional)
   * @returns many resource from DB
   */
  async findWithOptions(
    options?: FindManyOptions<T>,
    strictConfig?: IStrictConfig
  ) {
    if (strictConfig) {
      const { user: adminUser, permissionSet } =
        await this.getAdminUserCredential(strictConfig.token)
      const resourcePerm = permissionSet[strictConfig.strictResourceName]
      const flexibleReadPerm = resourcePerm.match(
        REGEX_PERM.READ
      )[0] as FlexiblePerm
      const grainedPerm = flexibleReadPerm.split(':')[1]

      if (grainedPerm === 'x') {
        throw new ForbiddenException(
          "You don't have permission to do this action on resource"
        )
      }

      const conditionPerm: { createdBy?: AdminUser | ClientUser } = {}
      if (grainedPerm === '+') {
        conditionPerm.createdBy = adminUser
      }

      if (_.isArray(options.where)) {
        const strictWhereOptions = _.map(options.where, (whereOpt) => {
          return _.assign(whereOpt, conditionPerm) as FindOptionsWhere<T>
        })
        options = {
          ...options,
          where: strictWhereOptions,
        }
      } else {
        const whereOptions = _.assign(
          options.where,
          conditionPerm
        ) as FindOptionsWhere<T>
        options = {
          ...options,
          where: whereOptions,
          cache: true,
        }
      }
    }

    const resource = await this.repository.find(options)
    if (!resource) {
      throw new NotFoundException(
        `Resources ${this.resourceName || ''} not found`
      )
    }

    return resource
  }

  /**
   * Using for delete only one resource
   * @param id the id of a resource
   * @param strictConfig params using for strict the resource with permission S
   * @returns delete information
   */
  async deleteOneById(id: string, strictConfig?: IStrictConfig) {
    const existed = await this.findById(id, {}, strictConfig)

    if (!existed) {
      throw new NotFoundException(
        `Resource ${this.resourceName || ''} with id: ${id} not found`
      )
    }

    if (_.isEmpty(strictConfig)) return this.repository.delete(id)

    const { user: adminUser, permissionSet } =
      await this.getAdminUserCredential(strictConfig.token)
    const resourcePerm = permissionSet[strictConfig.strictResourceName]
    const flexibleDeletePerm = resourcePerm.match(
      REGEX_PERM.DELETE
    )[0] as FlexiblePerm
    const isValidPermission = this.isValidPermissionOnResource(
      existed,
      adminUser,
      flexibleDeletePerm
    )

    if (!isValidPermission) {
      throw new ForbiddenException(
        "You don't have permission to do this action on resource"
      )
    }

    return this.repository.delete(id)
  }

  /**
   * Counting maximum number of items can be retrieved
   * @param strict StrictConfig using for resource is strict
   * @returns number of items
   */
  async countingTotalItem(strict?: IStrictConfig) {
    const { user: adminUser, permissionSet } =
      await this.getAdminUserCredential(strict.token)
    const resourcePerm = permissionSet[strict.strictResourceName]
    const flexibleReadPerm = resourcePerm.match(
      REGEX_PERM.READ
    )[0] as FlexiblePerm
    const grainedPerm = flexibleReadPerm.split(':')[1]

    if (grainedPerm === 'x') {
      throw new ForbiddenException(
        "You don't have permission to do this action on resource"
      )
    }

    const builder = this.repository.createQueryBuilder('entity')

    if (grainedPerm === '+') {
      builder.where('entity.createdById = :id', { id: adminUser.id })
    }

    return builder.getCount()
  }

  private isValidPermissionOnResource(
    resource: BaseRepoEntity,
    user: AdminUser | ClientUser,
    flexiblePerm: FlexiblePerm
  ) {
    if (_.isEmpty(flexiblePerm)) return false
    const grainedPerm = flexiblePerm.split(':')[1]

    return (
      grainedPerm === '*' ||
      (grainedPerm === '+' && resource.createdBy.id === user.id)
    )
  }

  /**
   * Require caching service, inject it before you use this function
   * @param token String
   * @returns user credentials which encrypted in the token
   */
  protected async getAdminUserCredential(token: string) {
    if (!this.cachingService) {
      throw new Error('You should inject caching service before using it!!')
    }

    return await this.cachingService.getValue<ICachedPermissionSet>(
      `${cacheConstant.PERMISSION}-${token}`
    )
  }
}
