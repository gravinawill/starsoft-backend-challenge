export function generateOrderCreatedEmailHTML(parameters: {
  customerName: string
  customerID: string
  orderID: string
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Your Order Has Been Created!</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 30px; border-radius: 10px; }
        .header { text-align: center; margin-bottom: 30px; }
        .order-text { font-size: 24px; color: #2c5aa0; margin-bottom: 20px; }
        .content { background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; }
        .footer { text-align: center; font-size: 12px; color: #666; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2c5aa0; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="order-text">🛒 Order Created Successfully!</h1>
        </div>

        <div class="content">
          <p>Hi <strong>${parameters.customerName}</strong>,</p>
          <p>Thank you for your order! Your order has been successfully created.</p>
          <p><strong>Order ID:</strong> ${parameters.orderID}</p>
          <p><strong>Customer ID:</strong> ${parameters.customerID}</p>
          <p>We appreciate your business and will notify you once your order is processed and shipped.</p>
          <p>If you have any questions or need assistance, please contact our support team.</p>
          <p>Best regards,<br>The Team</p>
        </div>

        <div class="footer">
          <p>This email was sent automatically. Please do not reply to this email.</p>
          <p>Order ID: ${parameters.orderID} | Customer ID: ${parameters.customerID}</p>
        </div>
      </div>
    </body>
    </html>
  `
}
