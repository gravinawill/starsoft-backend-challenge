export function generateWelcomeCustomerEmailHTML(parameters: { customerName: string; customerID: string }): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Welcome to Our Platform!</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 30px; border-radius: 10px; }
        .header { text-align: center; margin-bottom: 30px; }
        .welcome-text { font-size: 24px; color: #2c5aa0; margin-bottom: 20px; }
        .content { background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; }
        .footer { text-align: center; font-size: 12px; color: #666; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2c5aa0; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="welcome-text">🎉 Welcome ${parameters.customerName}!</h1>
        </div>

        <div class="content">
          <p>Thank you for joining our platform! We're excited to have you as part of our community.</p>

          <p>Your customer ID is: <strong>${parameters.customerID}</strong></p>

          <p>Here's what you can expect:</p>
          <ul>
            <li>Access to our full range of products</li>
            <li>Personalized recommendations</li>
            <li>Exclusive member benefits</li>
            <li>24/7 customer support</li>
          </ul>

          <p>If you have any questions or need assistance, don't hesitate to reach out to our support team.</p>

          <p>Best regards,<br>The Team</p>
        </div>

        <div class="footer">
          <p>This email was sent automatically. Please do not reply to this email.</p>
          <p>Customer ID: ${parameters.customerID}</p>
        </div>
      </div>
    </body>
    </html>
  `
}
