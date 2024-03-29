import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { cacheConstant } from '../constants/cache.contant'
import { CacheService } from '../services/cache.service'
import { TokenService } from '../services/token.service'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private tokenService: TokenService,
    private cacheService: CacheService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context)
    const headers = ctx.getContext().req.headers as DynamicObject
    const isCleaningUp = await this.cacheService.getValue<boolean>(
      cacheConstant.CLEAR_FILE
    )

    if (isCleaningUp) {
      throw new InternalServerErrorException(
        'Server is maintaining, please wait 2-5 minutes'
      )
    }

    if (!headers.authorization) {
      return false
    }

    const token = headers.authorization.split(' ')[1] as string
    let isValidToken: boolean

    try {
      const user = this.tokenService.verifyAndDecodeToken(token)
      await this.cacheService.setValue(`${cacheConstant.ADMIN_USER}-${token}`, {
        ...user,
      })

      isValidToken = true
    } catch (error) {
      isValidToken = false
    }

    return isValidToken
  }
}
