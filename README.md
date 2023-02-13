# Background Jobs

[![npm version](https://badge.fury.io/js/@universal-packages%2Fbackground-jobs-mailing.svg)](https://www.npmjs.com/package/@universal-packages/background-jobs-mailing)
[![Testing](https://github.com/universal-packages/universal-background-jobs-mailing/actions/workflows/testing.yml/badge.svg)](https://github.com/universal-packages/universal-background-jobs-mailing/actions/workflows/testing.yml)
[![codecov](https://codecov.io/gh/universal-packages/universal-background-jobs-mailing/branch/main/graph/badge.svg?token=CXPJSN8IGL)](https://codecov.io/gh/universal-packages/universal-background-jobs-mailing)

[Mailing](https://github.com/universal-packages/universal-mailing) on top of [Background Jobs](https://github.com/universal-packages/universal-background-jobs).

## Install

```shell
npm install @universal-packages/background-jobs-mailing

npm install @universal-packages/background-jobs
npm install redis
```

## Mailing

Mailing is still the main interface for email sending, but depends on Jobs to load the email classes to be able to be send later.

```js
import { Jobs } from '@universal-packages/background-jobs-mailing'
import { Mailing } from '@universal-packages/background-jobs-mailing'
import WelcomeEmail from './src/emails/Welcome.email'

const jobs = new Jobs({ jobsLocation: './src/jobs', additional: [{ conventionPrefix: 'email', location: './src/emails' }] })
await jobs.prepare()

const mailing = new Mailing( emailsLocation: './src/emails', engine: 'nodemailer', engineOptions: { transport: 'smtp', options: { host: 'smtp.com'} })
await mailing.prepare()

await WelcomeEmail.sendLater({ userId: 123 })

await jobs.release()
```

```js
// WelcomeEmail.job.js|ts
import { BaseEmail } from '@universal-packages/background-jobs-mailing'

export default class WelcomeEmail extends BaseEmail {
  async build(params) {
    const user = await User.find(params.userId)

    return { subject: `Welcome ${user.name}`, to: user.email, from: 'support@company.com' }
  }
}
```

### Options

`Mailing` takes the same [options](https://github.com/universal-packages/universal-mailing#options) as the original Mailing.

Additionally takes the following ones:

- `emailsLocation` `String` `default: ./src`
  Where all email files are, all files should add a `.email` prefix, ex: `Welcome.email.js`.

### Instance methods

#### **`prepare`**

Loads all emails so they can be enabled to send emails.

## BaseEmail

Base interface to enable a JS class to be used as a mailer class, it will need a `build` method that return the send options.

### Static properties

Same [static properties](https://github.com/universal-packages/universal-background-jobs#static-properties) as `BaseJob`

### Templates

Instead of passing a `templatesLocation` an Email class can automatically infer a template derived from the same name as the class.

```
- emails
  |- Welcome.email.js
  |- welcome-email.html
  |- welcome-email.txt
```

Now the `welcome-email` template will be rendered and used as html contents when sending the welcome email without specifying it.

## Typescript

This library is developed in TypeScript and shipped fully typed.

## Contributing

The development of this library happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in improving this library.

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Contributing Guide](./CONTRIBUTING.md)

### License

[MIT licensed](./LICENSE).
