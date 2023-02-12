import { TestEngine } from '@universal-packages/mailing'

jest.retryTimes(process.env.CI ? 2 : 0)
jest.setTimeout(10000)

TestEngine.mock = jest.fn()

beforeEach((): void => {
  TestEngine.mock.mockClear()
})
