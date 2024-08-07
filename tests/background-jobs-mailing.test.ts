import { BackgroundJobs } from '@universal-packages/background-jobs'
import { Mailing } from '@universal-packages/mailing'

import { MailingLoader } from '../src'
import ExcellentEmail from './__fixtures__/emails/Excellent.email'
import GoodEmail from './__fixtures__/emails/Good.email'
import FailingEmail from './__fixtures__/failing/Failing.email'

describe('background-jobs-mailing', (): void => {
  it('loads emails to be performed by the jobs system', async (): Promise<void> => {
    const listener = jest.fn()
    const backgroundJobs = new BackgroundJobs({ jobsLocation: './tests/__fixtures__/emails', loaders: { mailing: MailingLoader } })

    await backgroundJobs.prepare()
    await backgroundJobs.queue.clear()

    backgroundJobs.on('enqueued', listener)

    await GoodEmail.sendLater({ good: true })
    await ExcellentEmail.sendLater({ excellent: true })

    await backgroundJobs.release()

    expect(GoodEmail).toHaveBeenEnqueuedWith({ good: true })
    expect(ExcellentEmail).toHaveBeenEnqueuedWith({ excellent: true })
    expect(listener.mock.calls).toEqual([
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
    const backgroundJobs = new BackgroundJobs({ jobsLocation: './tests/__fixtures__/failing', loaders: { mailing: MailingLoader } })

    await backgroundJobs.prepare()

    try {
      await new FailingEmail().send({ good: true })
    } catch (err) {
      error = err
    }

    expect(FailingEmail).not.toHaveBeenEnqueuedWith({ good: true })
    expect(error.message).toEqual('Email "build" method not implemented')
  })

  it('perform behaves as if using send', async (): Promise<void> => {
    const backgroundJobs = new BackgroundJobs({ jobsLocation: './tests/__fixtures__/emails', loaders: { mailing: MailingLoader } })

    await backgroundJobs.prepare()

    await new GoodEmail().perform({ good: true })

    expect(Mailing).toHaveSentOneWithOptions({ locals: { good: true }, subject: 'good', html: 'html' })
  })

  it('renders the matching named templates', async (): Promise<void> => {
    const backgroundJobs = new BackgroundJobs({ jobsLocation: './tests/__fixtures__/emails', loaders: { mailing: MailingLoader } })

    await backgroundJobs.prepare()

    await new ExcellentEmail().perform({ local: 'for sure' })

    expect(Mailing).toHaveSentOneWithOptions({
      subject: 'excellent',
      locals: { local: 'for sure' },
      template: expect.stringMatching(/.*emails\/excellent-email/),
      html: '<html>\n' + '  <body>\n' + '    <p>\n' + '  This is an excellent email for sure\n' + '</p>\n' + '\n' + '  </body>\n' + '</html>\n',
      text: 'This is an excellent email for sure\n'
    })
  })

  it('throws if a job has an error at loading', async (): Promise<void> => {
    let error: Error
    const backgroundJobs = new BackgroundJobs({ jobsLocation: './tests/__fixtures__/load-error', loaders: { mailing: MailingLoader } })

    try {
      await backgroundJobs.prepare()
    } catch (err) {
      error = err
    }

    expect(error).toEqual('Error')
  })
})
