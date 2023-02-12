import { SendOptions } from '@universal-packages/mailing'
import BaseEmail from '../../../src/BaseEmail'

export default class GoodEmail extends BaseEmail {
  public async build(payload: any): Promise<SendOptions> {
    return { subject: 'good', locals: payload, html: 'html' }
  }
}
