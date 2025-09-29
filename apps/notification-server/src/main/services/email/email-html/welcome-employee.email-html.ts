export function generateWelcomeEmployeeEmailHTML(parameters: { employeeName: string; employeeID: string }): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Welcome to the Team!</title>
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
          <h1 class="welcome-text">👷 Welcome ${parameters.employeeName}!</h1>
        </div>

        <div class="content">
          <p>We're thrilled to welcome you to our team! Your skills and talents will be a great addition to our company.</p>

          <p>Your employee ID is: <strong>${parameters.employeeID}</strong></p>

          <p>Here's what you can expect as you get started:</p>
          <ul>
            <li>Access to onboarding resources and training</li>
            <li>Support from your manager and colleagues</li>
            <li>Opportunities for growth and development</li>
            <li>A collaborative and inclusive work environment</li>
          </ul>

          <p>If you have any questions or need assistance, please reach out to your manager or HR representative.</p>

          <p>Best regards,<br>The HR Team</p>
        </div>

        <div class="footer">
          <p>This email was sent automatically. Please do not reply to this email.</p>
          <p>Employee ID: ${parameters.employeeID}</p>
        </div>
      </div>
    </body>
    </html>
  `
}
