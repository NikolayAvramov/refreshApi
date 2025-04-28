import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other services like 'outlook', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASSWORD // Your email password or app password
  }
});

export const sendOrderConfirmationEmail = async (userEmail, orderDetails) => {
  try {
    // Create email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Order Confirmation',
      html: `
        <h1>Thank you for your order!</h1>
        <p>Dear Customer,</p>
        <p>Your order has been received and is being processed.</p>
        <h2>Order Details:</h2>
        <ul>
          ${orderDetails.items.map(item => `
            <li>
              ${item.name} - Quantity: ${item.quantity} - Price: $${item.price}
            </li>
          `).join('')}
        </ul>
        <p>Total Amount: $${orderDetails.totalAmount}</p>
        <p>Order Date: ${new Date().toLocaleDateString()}</p>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br>Your Store Team</p>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}; 