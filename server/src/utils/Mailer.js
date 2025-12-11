import nodemailer from "nodemailer";
import { env } from "../config/env.js";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.emailUser,
    pass: env.emailPass,
  },
});

console.log("Email config check:");
console.log("Email User:", env.emailUser);
console.log("Email Pass exists:", !!env.emailPass); // Check if password exists

export async function sendEmail(to, subject, text, html = null) {
  try {
    console.log(`Attempting to send email to: ${to}`);
    console.log(`Subject: ${subject}`);
    
    if (!env.emailUser || !env.emailPass) {
      throw new Error("Email credentials not configured (EMAIL_USER or EMAIL_PASS missing)");
    }
    
    const mailOptions = {
      from: env.emailUser,
      to,
      subject,
      text,
    };
    
    // Add HTML if provided
    if (html) {
      mailOptions.html = html;
    }
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log("Email sent successfully! Message ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("FAILED TO SEND EMAIL:", error.message);
    console.error("Full error:", error);
    throw error; // Re-throw so caller knows it failed
  }
}