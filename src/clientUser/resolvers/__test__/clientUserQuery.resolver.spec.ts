import { Test } from '@nestjs/testing'
import { ClientUserService } from 'src/clientUser/services/clientUser.service'
import { AuthGuard } from 'src/common/guards/auth.guard'
import { baseServiceMock } from 'src/common/mock/baseServiceMock'
import { guardMock } from 'src/common/mock/guardMock'
import { createClientUserEntityMock } from 'src/common/mock/mockEntity'
import { clientUserQueryResolver } from '../clientUserQuery.resolver'

const clientUserServiceMock = {
  ...baseServiceMock,
}

describe('ClientUserQueryResolver', () => {
  let resolver: clientUserQueryResolver
  const user = createClientUserEntityMock()
  beforeAll(async () => {
    const setupTestModule = Test.createTestingModule({
      providers: [clientUserQueryResolver, ClientUserService],
    })

    setupTestModule
      .overrideProvider(ClientUserService)
      .useValue(clientUserServiceMock)
    setupTestModule.overrideGuard(AuthGuard).useValue(guardMock)

    const compliedModule = await setupTestModule.compile()

    resolver = compliedModule.get(clientUserQueryResolver)
  })

  beforeEach(() => {
    jest.resetAllMocks()
    jest.spyOn(clientUserServiceMock, 'findById').mockResolvedValue(user)
  })

  describe('clientUserQuery', () => {
    it('It should return empty object', () => {
      expect(resolver.clientUserQuery()).toEqual({})
    })
  })

  describe('userDetail', () => {
    it('It should return clientUser', async () => {
      expect(await resolver.userDetail('id')).toEqual(
        createClientUserEntityMock()
      )
    })
  })
})
