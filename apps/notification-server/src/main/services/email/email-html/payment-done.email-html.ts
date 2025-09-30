export function generatePaymentDoneEmailHTML(parameters: {
  customerName: string
  customerID: string
  orderID: string
  amountInCents: number
  paymentMethod: string
  paymentDate: string
}): string {
  const formattedAmount = (parameters.amountInCents / 100).toLocaleString(undefined, {
    style: 'currency',
    currency: 'BRL'
  })

  // Format payment date for better readability
  const formattedDate = new Date(parameters.paymentDate).toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Payment Received Successfully!</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 30px; border-radius: 10px; }
        .header { text-align: center; margin-bottom: 30px; }
        .payment-text { font-size: 24px; color: #27ae60; margin-bottom: 20px; }
        .content { background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; }
        .footer { text-align: center; font-size: 12px; color: #666; }
        .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .details-table th, .details-table td { text-align: left; padding: 8px; }
        .details-table th { background: #f0f0f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="payment-text">✅ Payment Received!</h1>
        </div>

        <div class="content">
          <p>Hi <strong>${parameters.customerName}</strong>,</p>
          <p>We have received your payment. Thank you for your prompt action!</p>
          <table class="details-table">
            <tr>
              <th>Order ID:</th>
              <td>${parameters.orderID}</td>
            </tr>
            <tr>
              <th>Customer ID:</th>
              <td>${parameters.customerID}</td>
            </tr>
            <tr>
              <th>Amount Paid:</th>
              <td>${formattedAmount}</td>
            </tr>
            <tr>
              <th>Payment Method:</th>
              <td>${parameters.paymentMethod}</td>
            </tr>
            <tr>
              <th>Payment Date:</th>
              <td>${formattedDate}</td>
            </tr>
          </table>
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
