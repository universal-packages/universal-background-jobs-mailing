import { TestEngine } from '@universal-packages/mailing'

jest.retryTimes(10)
jest.setTimeout(10000)

TestEngine.mock = jest.fn()

beforeEach((): void => {
  TestEngine.mock.mockClear()
})
