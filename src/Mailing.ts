import { Mailing as ML } from '@universal-packages/mailing'
import { loadModules } from '@universal-packages/module-loader'
import BaseEmail from './BaseEmail'
import { MailingOptions } from './Mailing.types'

export default class Mailing extends ML {
  public readonly options: MailingOptions

  public constructor(options: MailingOptions) {
    super(options)
    this.options = { emailsLocation: './src', ...this.options }
  }

  public async prepare(): Promise<void> {
    await super.prepare()
    await this.loadEmails()
  }

  private async loadEmails(): Promise<void> {
    const modules = await loadModules(this.options.emailsLocation, { conventionPrefix: 'email' })

    for (let i = 0; i < modules.length; i++) {
      const currentModule = modules[i]

      if (currentModule.error) {
        throw currentModule.error
      } else {
        const Email: typeof BaseEmail = currentModule.exports

        Email['__send'] = this.send.bind(this)
      }
    }
  }
}
