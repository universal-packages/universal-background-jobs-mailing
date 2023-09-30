import { Jobs } from '@universal-packages/background-jobs'
import { TestEngine } from '@universal-packages/mailing'

import { Mailing } from '../src'
import ExcellentEmail from './__fixtures__/emails/Excellent.email'
import GoodEmail from './__fixtures__/emails/Good.email'
import FailingEmail from './__fixtures__/failing/Failing.email'

describe(Mailing, (): void => {
  it('loads emails to be performed by the jobs system', async (): Promise<void> => {
    const enqueuedMock = jest.fn()
    const jobs = new Jobs({ jobsLocation: './tests/__fixtures__/emails', additional: [{ conventionPrefix: 'email' }] })

    await jobs.prepare()
    await jobs.queue.clear()

    jobs.on('enqueued', enqueuedMock)

    const mailing = new Mailing({ emailsLocation: './tests/__fixtures__/emails' })

    await mailing.prepare()

    await GoodEmail.sendLater({ good: true })
    await ExcellentEmail.sendLater({ excellent: true })

    await jobs.release()

    expect(enqueuedMock.mock.calls).toEqual([
      [
        {
          event: 'enqueued',
          payload: {
            jobItem: {
              payload: { good: true },
              srcFile: expect.stringMatching(/__fixtures__\/emails\/Good.email.ts/),
              name: 'GoodEmail',
              maxRetries: 5,
              queue: 'emails',
              retryAfter: '1 minute'
            }
          }
        }
      ],
      [
        {
          event: 'enqueued',
          payload: {
            jobItem: {
              payload: { excellent: true },
              srcFile: expect.stringMatching(/__fixtures__\/emails\/Excellent.email.ts/),
              name: 'ExcellentEmail',
              maxRetries: 5,
              queue: 'emails',
              retryAfter: '1 minute'
            }
          }
        }
      ]
    ])
  })

  it('throws when the build method is not implemented', async (): Promise<void> => {
    let error: Error
    const mailing = new Mailing({ emailsLocation: './tests/__fixtures__/failing' })

    await mailing.prepare()

    try {
      await new FailingEmail().send({ good: true })
    } catch (err) {
      error = err
    }

    expect(error.message).toEqual('Email "build" method not implemented')
  })

  it('perform behaves as if using send', async (): Promise<void> => {
    const mailing = new Mailing({ emailsLocation: './tests/__fixtures__/emails' })

    await mailing.prepare()

    await new GoodEmail().perform({ good: true })

    expect(TestEngine.mock).toHaveBeenCalledWith({ locals: { good: true }, subject: 'good', html: 'html' })
  })

  it('renders the matching named templates', async (): Promise<void> => {
    const mailing = new Mailing({ emailsLocation: './tests/__fixtures__/emails' })

    await mailing.prepare()

    await new ExcellentEmail().perform({ local: 'for sure' })

    expect(TestEngine.mock).toHaveBeenCalledWith({
      subject: 'excellent',
      locals: { local: 'for sure' },
      template: expect.stringMatching(/.*emails\/excellent-email/),
      html: '<html>\n' + '  <body>\n' + '    <p>\n' + '  This is an excellent email for sure\n' + '</p>\n' + '\n' + '  </body>\n' + '</html>\n',
      text: 'This is an excellent email for sure\n'
    })
  })

  it('throws if a job has an error at loading', async (): Promise<void> => {
    let error: Error
    const mailing = new Mailing({ emailsLocation: './tests/__fixtures__/load-error' })

    try {
      await mailing.prepare()
    } catch (err) {
      error = err
    }

    expect(error).toEqual('Error')
  })
})
