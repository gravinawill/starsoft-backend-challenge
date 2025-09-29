import { type ILoggerProvider } from '@niki/domain'
import { notificationServerENV } from '@niki/env'
import nodemailer, { type Transporter } from 'nodemailer'

import { generateWelcomeCustomerEmailHTML } from './email-html/welcome-customer.email-html'
import { generateWelcomeEmployeeEmailHTML } from './email-html/welcome-employee.email-html'

let transporter: Transporter | null = null

function getTransporter(): Transporter {
  // eslint-disable-next-line sonarjs/no-clear-text-protocols -- TODO: change to secure
  transporter ??= nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: notificationServerENV.NOTIFICATION_SERVER_ETHEREAL_USER,
      pass: notificationServerENV.NOTIFICATION_SERVER_ETHEREAL_PASSWORD
    }
  })
  return transporter
}

interface EmailRecipient {
  email: string
  name: string
}

interface BaseEmailOptions {
  to: EmailRecipient
  logger: ILoggerProvider
}

export const sendEmail = async (parameters: {
  to: string
  subject: string
  html: string
  logger: ILoggerProvider
}): Promise<void> => {
  try {
    const mailOptions = {
      from: `${notificationServerENV.NOTIFICATION_SERVER_ETHEREAL_USER} <${notificationServerENV.NOTIFICATION_SERVER_ETHEREAL_USER}>`,
      to: parameters.to,
      subject: parameters.subject,
      html: parameters.html
    }
    const result = await getTransporter().sendMail(mailOptions)
    console.log({ result })
    parameters.logger.sendLogInfo({
      message: '📧 Email sent successfully',
      data: {
        messageId: result.messageId,
        to: parameters.to,
        subject: parameters.subject
      }
    })
  } catch (error) {
    console.log({ error })
    parameters.logger.sendLogError({
      message: '❌ Failed to send email',
      value: {
        error: error instanceof Error ? error.message : String(error),
        to: parameters.to,
        subject: parameters.subject
      }
    })
    throw error
  }
}

export async function sendWelcomeCustomerEmail(parameters: BaseEmailOptions & { customerID: string }): Promise<void> {
  const subject = `🎉 Welcome to our platform, ${parameters.to.name}!`
  const html = generateWelcomeCustomerEmailHTML({ customerName: parameters.to.name, customerID: parameters.customerID })
  await sendEmail({
    to: parameters.to.email,
    subject,
    html,
    logger: parameters.logger
  })
}

export async function sendWelcomeEmployeeEmail(parameters: BaseEmailOptions & { employeeID: string }): Promise<void> {
  const subject = `👷 Welcome to the team, ${parameters.to.name}!`
  const html = generateWelcomeEmployeeEmailHTML({ employeeName: parameters.to.name, employeeID: parameters.employeeID })
  await sendEmail({
    to: parameters.to.email,
    subject,
    html,
    logger: parameters.logger
  })
}
