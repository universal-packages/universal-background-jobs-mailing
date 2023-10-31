import { LoaderOptions } from '@universal-packages/background-jobs'
import BaseLoader from '@universal-packages/background-jobs/BaseLoader'
import { Mailing, SendOptions } from '@universal-packages/mailing'

import BaseEmail from './BaseEmail'

export default class MailingLoader extends BaseLoader {
  public static readonly conventionPrefix = 'email'

  public mailingInstance: Mailing

  public constructor(options: LoaderOptions) {
    super(options)

    this.mailingInstance = new Mailing(options.passedOptions.mailing)
  }

  public async prepare(): Promise<void> {
    await this.mailingInstance.prepare()
    await this.loadJobs()

    const jobClasses = Object.values(this.jobsCollection)

    for (let i = 0; i < jobClasses.length; i++) {
      const Email = jobClasses[i] as typeof BaseEmail

      Email['__send'] = async (options: SendOptions): Promise<void> => {
        return this.mailingInstance.send(options)
      }
    }
  }
}
