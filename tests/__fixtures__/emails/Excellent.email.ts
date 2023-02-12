import { SendOptions } from '@universal-packages/mailing'
import BaseEmail from '../../../src/BaseEmail'

export default class ExcellentEmail extends BaseEmail {
  public async build(payload: any): Promise<SendOptions> {
    return { subject: 'excellent', locals: payload }
  }
}
