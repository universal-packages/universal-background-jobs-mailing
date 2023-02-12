import { BaseJob, LaterOptions } from '@universal-packages/background-jobs'
import { SendFunction, SendOptions } from '@universal-packages/mailing'
import { paramCase } from 'change-case'
import path from 'path'

export default class BaseEmail<P = Record<string, any>> extends BaseJob<P> {
  public static queue: string = 'emails'

  protected static __send: SendFunction

  public static async sendLater<P = Record<string, any>>(payload: P, options?: LaterOptions): Promise<void> {
    await this.performLater(payload, options)
  }

  public async build(_payload: P): Promise<SendOptions> {
    throw new Error('Email "build" method not implemented')
  }

  public async perform(payload: P): Promise<void> {
    await this.send(payload)
  }

  public async send(payload: P): Promise<void> {
    let finalOptions = await this.build(payload)

    if (!finalOptions.html && !finalOptions.template) {
      const baseTemplate = path.dirname(this.constructor['__srcFile'])
      const templateName = paramCase(this.constructor.name)
      const finalTemplate = path.join(baseTemplate, templateName)

      finalOptions.template = finalTemplate
    }

    await this.constructor['__send'](finalOptions)
  }

  public async sendLater(payload: P, options?: LaterOptions): Promise<void> {
    await this.performLater(payload, options)
  }
}
