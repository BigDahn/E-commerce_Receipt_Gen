const nodemailer = require("nodemailer");
const fs = require("fs");

const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: "465",
  auth: {
    user: "apikey",
    pass: process.env.SENDGRID_API_KEY,
  },
  secure: true,
  debug: true,
  logger: true,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 45000,
});

module.exports = async ({ receiptNumber, pdfPath, to, receipt }) => {
  const attachment = fs.readFileSync(pdfPath);

  try {
    const result = await transporter.sendMail({
      from: "dannieyung123@gmail.com",
      to,
      subject: `Receipt #${receiptNumber} - Order Confirmation`,
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            background-color: #f9f9f9;
            padding: 30px 20px;
          }
          .receipt-box {
            background-color: white;
            padding: 25px;
            border-radius: 8px;
            margin: 20px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            padding: 12px 10px;
            border-bottom: 1px solid #eee;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: 600;
            color: #666;
          }
          .value {
            color: #333;
            text-align: right;
          }
          .total-row {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 2px solid #667eea;
          }
          .total {
            font-size: 23px;
            font-weight: bold;
            color: #667eea;
          }
          .items-table {
            width: 100%;
            margin: 20px 0;
            border-collapse: collapse;
          }
          .items-table th {
            background-color: #f5f5f5;
            padding: 12px;
            text-align: left;
            border-bottom: 2px solid #ddd;
          }
          .items-table td {
            padding: 12px;
            border-bottom: 1px solid #eee;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
            background-color: #f0f0f0;
            border-radius: 0 0 10px 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Order Confirmed!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for your purchase</p>
          </div>
      
          <div class="content">
            <p style="font-size: 16px; margin: 0 0 10px 0;">
              Hi <strong>${receipt.customerName}</strong>,
            </p>
            <p style="margin: 0 0 20px 0;">
              Your order has been confirmed and your receipt is ready! You'll find it attached to this email.
            </p>
      
            <div class="receipt-box">
              <h2 style="margin-top: 0; color: #667eea;">📋 Order Summary</h2>
      
              <div class="info-row">
                <span class="label">Receipt Number</span>
                <span class="value"><strong>${
                  receipt.receiptNumber
                }</strong></span>
              </div>
      
              <div class="info-row">
                <span class="label">Order Number</span>
                <span class="value">${receipt.orderId}</span>
              </div>
      
              <div class="info-row">
                <span class="label">Date</span>
                <span class="value">${new Date(
                  receipt.generatedAt
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</span>
              </div>
      
              <div class="info-row">
                <span class="label">Payment Method</span>
                <span class="value">${receipt.paymentMethod
                  .replace("_", " ")
                  .toUpperCase()}</span>
              </div>
      
              ${
                receipt.items && receipt.items.length > 0
                  ? `
                <h3 style="margin: 25px 0 15px 0; color: #333;">Items Ordered</h3>
                <table class="items-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th style="text-align: center;">Qty</th>
                      <th style="text-align: right;">Price</th>
                      <th style="text-align: right;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${receipt.items
                      .map(
                        (item) => `
                      <tr>
                        <td>${item.productName}</td>
                        <td style="text-align: center;">${item.quantity}</td>
                        <td style="text-align: right;">$${item.unitPrice.toFixed(
                          2
                        )}</td>
                        <td style="text-align: right;">$${item.totalPrice.toFixed(
                          2
                        )}</td>
                      </tr>
                    `
                      )
                      .join("")}
                  </tbody>
                </table>
              `
                  : ""
              }
      
              <!-- ✅ Fixed Subtotal Row -->
              <div class="info-row" style="margin-top: 15px;">
                <span class="label">Subtotal</span>
                <span class="value">$${receipt.subtotal.toFixed(2)}</span>
              </div>
      
              <!-- ✅ Fixed Tax Row -->
              <div class="info-row">
                <span class="label">Tax</span>
                <span class="value">$${receipt.tax.toFixed(2)}</span>
              </div>
      
              ${
                receipt.discount > 0
                  ? `
                <div class="info-row">
                  <span class="label">Discount</span>
                  <span class="value" style="color: #4CAF50;">-$${receipt.discount.toFixed(
                    2
                  )}</span>
                </div>
              `
                  : ""
              }
      
              ${
                receipt.shippingCost > 0
                  ? `
                <div class="info-row">
                  <span class="label">Shipping</span>
                  <span class="value">$${receipt.shippingCost.toFixed(2)}</span>
                </div>
              `
                  : ""
              }
      
              <!-- ✅ Fixed Total Row -->
              <div class="info-row total-row">
                <span class="label" style="font-size: 18px;">Total Paid</span>
                <span class="total">$${receipt.totalAmount.toFixed(2)}</span>
              </div>
            </div>
      
            <p style="margin: 20px 0;">
              📎 Your receipt PDF is attached to this email. You can download and save it for your records.
            </p>
      
            <p style="margin: 20px 0;">
              If you have any questions about your order, please contact us at
              <a href="mailto:${
                receipt.businessEmail
              }" style="color: #667eea; text-decoration: none;">
                ${receipt.businessEmail}
              </a>
            </p>
          </div>
      
          <div class="footer">
            <p style="margin: 5px 0; font-weight: bold; font-size: 14px;">${
              receipt.businessName
            }</p>
            <p style="margin: 5px 0;">${receipt.businessEmail}${
        receipt.businessPhone ? " | " + receipt.businessPhone : ""
      }</p>
            ${
              receipt.businessAddress
                ? `
              <p style="margin: 5px 0;">
                ${receipt.businessAddress.street},
                ${receipt.businessAddress.city},
                ${receipt.businessAddress.state}
                ${receipt.businessAddress.zipCode}
              </p>
            `
                : ""
            }
            <p style="margin: 15px 0 5px 0; color: #999;">
              This is an automated email. Please do not reply directly to this message.
            </p>
          </div>
        </div>
      </body>
      </html>
      `,
      attachments: [
        {
          filename: `${receiptNumber}.pdf`,
          content: attachment,
          contentType: "application/pdf",
        },
      ],
    });

    return result;
  } catch (error) {
    console.log("\n❌ EMAIL SENDING FAILED!");

    console.log("Error Message:", error.message);

    throw new Error(`Email failed: ${error.message}`);
  }
};
