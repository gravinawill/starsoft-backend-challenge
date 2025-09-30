import { notificationServerENV } from '@niki/env'
import { makeLoggerProvider } from '@niki/logger'
import nodemailer, { type Transporter } from 'nodemailer'

import { generateBillingCreatedEmailHTML } from './email-html/billing-created.email-html'
import { generateOrderCreatedEmailHTML } from './email-html/order-created.email-html'
import { generatePaymentDoneEmailHTML } from './email-html/payment-done.email-html'
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

export interface EmailRecipient {
  email: string
  name: string
}

export interface BaseEmailOptions {
  to: EmailRecipient
}

type SendEmailParams = {
  to: string
  subject: string
  html: string
}

export const sendEmail = async ({ to, subject, html }: SendEmailParams): Promise<void> => {
  const logger = makeLoggerProvider()
  try {
    const mailOptions = {
      from: `"${notificationServerENV.NOTIFICATION_SERVER_ETHEREAL_USER}" <${notificationServerENV.NOTIFICATION_SERVER_ETHEREAL_USER}>`,
      to,
      subject,
      html
    }
    const result = await getTransporter().sendMail(mailOptions)
    logger.sendLogInfo({
      message: '📧 Email sent successfully',
      data: {
        messageId: result.messageId,
        to,
        subject
      }
    })
  } catch (error) {
    logger.sendLogError({
      message: '❌ Failed to send email',
      value: {
        error: error instanceof Error ? error.message : String(error),
        to,
        subject
      }
    })
    throw error
  }
}

function buildSubject(prefix: string, name: string, fallback = ''): string {
  return `${prefix} ${fallback || name}!`
}

export async function sendWelcomeCustomerEmail(params: BaseEmailOptions & { customerID: string }): Promise<void> {
  const { to, customerID } = params
  const subject = buildSubject('🎉 Welcome to our platform,', to.name)
  const html = generateWelcomeCustomerEmailHTML({ customerName: to.name, customerID })
  await sendEmail({ to: to.email, subject, html })
}

export async function sendWelcomeEmployeeEmail(params: BaseEmailOptions & { employeeID: string }): Promise<void> {
  const { to, employeeID } = params
  const subject = buildSubject('👷 Welcome to the team,', to.name)
  const html = generateWelcomeEmployeeEmailHTML({ employeeName: to.name, employeeID })
  await sendEmail({ to: to.email, subject, html })
}

export async function sendOrderCreatedEmail(
  params: BaseEmailOptions & { orderID: string; customerID: string }
): Promise<void> {
  const { to, orderID, customerID } = params
  const subject = buildSubject('🛒 Order Created Successfully,', to.name)
  const html = generateOrderCreatedEmailHTML({
    customerName: to.name,
    customerID,
    orderID
  })
  await sendEmail({ to: to.email, subject, html })
}

export async function sendBillingCreatedEmail(
  params: BaseEmailOptions & {
    orderID: string
    customerID: string
    paymentURL: string
    amountInCents: number
    paymentMethod: string
  }
): Promise<void> {
  const { to, orderID, customerID, paymentURL, amountInCents, paymentMethod } = params
  const subject = buildSubject('💳 Billing Created Successfully,', to.name)
  const html = generateBillingCreatedEmailHTML({
    customerName: to.name,
    customerID,
    orderID,
    paymentURL,
    amountInCents,
    paymentMethod
  })
  await sendEmail({ to: to.email, subject, html })
}

export async function sendPaymentDoneEmail(
  params: BaseEmailOptions & {
    orderID: string
    customerID: string
    amountInCents: number
    paymentMethod: string
    paymentAt: string
  }
): Promise<void> {
  const { to, orderID, customerID, amountInCents, paymentMethod, paymentAt } = params
  const subject = buildSubject('💳 Payment Done Successfully,', to.name)
  const html = generatePaymentDoneEmailHTML({
    customerName: to.name,
    customerID,
    orderID,
    amountInCents,
    paymentMethod,
    paymentDate: paymentAt
  })
  await sendEmail({ to: to.email, subject, html })
}
