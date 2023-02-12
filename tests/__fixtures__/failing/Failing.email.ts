import BaseEmail from '../../../src/BaseEmail'

export default class FailingEmail extends BaseEmail {
  public static retryAfter = '1 second'
  public static maxRetries = 3
}
