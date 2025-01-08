// src/helpers/sendEmail.js
const nodemailer = require("nodemailer");

// Function to send a reset password email
const sendResetEmail = async (email, resetToken) => {
  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail", // or another email service
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
      },
    });

    // Create the email content
    const resetLink = `http://127.0.0.1:3061/reset-password/${resetToken}`; // Adjust this based on your frontend
    const mailOptions = {
      from: process.env.EMAIL_USER, // Your email address
      to: email, // The user's email
      subject: "Password Reset Request",
      text: `Please click the following link to reset your password: ${resetLink}`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    console.log(`Reset email sent to ${email}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send password reset email.");
  }
};

module.exports = sendResetEmail;
