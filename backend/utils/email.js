const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async (options) => {
  // 1. Create a transporter using the SMTP variables from your .env file
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // Handles both secure and non-secure ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // 2. Define the email options
  const mailOptions = {
    from: `MoDX <${process.env.SMTP_USER}>`, // Set the "from" name for your app
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html, // You can also send HTML content if you want
  };

  try {
    // 3. Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
    return info;
  } catch (error) {
    console.error("Error occurred while sending email:", error);
    throw error; // Pass the error along to be handled by the controller
  }
};

module.exports = sendEmail;
