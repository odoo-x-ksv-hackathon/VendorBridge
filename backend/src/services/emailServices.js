import nodemailer from 'nodemailer';
import { config } from '../config/email.js';

// Create transporter
const transporter = nodemailer.createTransport({
  host: config.host,
  port: config.port,
  secure: config.secure,
  auth: config.auth,
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter error (Check your env vars):', error);
  } else {
    console.log('Email server is ready to send VendorBridge emails');
  }
});

// 1. Send Welcome Email
export const sendWelcomeEmail = async (userEmail, userName, role, orgName) => {
  try {
    const mailOptions = {
      from: config.from,
      to: userEmail,
      subject: `Welcome to ${config.appName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h1 style="color: #2563eb;">Welcome to ${config.appName}!</h1>
          <p>Hi ${userName},</p>
          <p>You have been invited to join the <strong>${orgName}</strong> organization as a <strong>${role}</strong>.</p>
          <div style="margin: 30px 0;">
            <a href="${config.baseUrl}/login" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Login to Your Dashboard
            </a>
          </div>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">This is an automated message from ${config.appName}.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

// 2. Send Password Reset Email (Pairs with the route we just built)
export const sendPasswordResetEmail = async (userEmail, resetToken) => {
  try {
    const resetLink = `${config.baseUrl}/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: config.from,
      to: userEmail,
      subject: `Reset Your Password - ${config.appName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #dc2626;">Password Reset Request</h2>
          <p>We received a request to reset your password. This link will expire in 15 minutes.</p>
          <div style="margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};

// 3. Send RFQ Invitation (For Vendors)
export const sendRfqInvitationEmail = async (vendorEmail, rfqTitle, deadline, orgName) => {
  try {
    const mailOptions = {
      from: config.from,
      to: vendorEmail,
      subject: `New RFQ Invitation: ${rfqTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #059669;">New Request for Quotation (RFQ)</h2>
          <p><strong>${orgName}</strong> has invited you to submit a quotation.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>RFQ Title:</strong> ${rfqTitle}</p>
            <p><strong>Submission Deadline:</strong> ${new Date(deadline).toLocaleDateString()}</p>
          </div>
          
          <div style="margin: 30px 0;">
            <a href="${config.baseUrl}/rfqs" 
               style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              View RFQ & Submit Quote
            </a>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('RFQ invitation email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending RFQ email:', error);
  }
};

// 4. Send Invoice (Hits Problem Statement Requirement: "Send invoice through email")
export const sendInvoiceEmail = async (targetEmail, invoiceNumber, poNumber, totalAmount) => {
  try {
    const mailOptions = {
      from: config.from,
      to: targetEmail,
      subject: `Invoice Generated: ${invoiceNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #4f46e5;">Invoice Generated</h2>
          <p>An invoice has been successfully generated for Purchase Order <strong>${poNumber}</strong>.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">Invoice Summary</h3>
            <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
            <p><strong>Total Amount:</strong> $${totalAmount}</p>
          </div>
          
          <p>Please log in to the portal to download the full PDF version of this invoice.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Invoice email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending invoice email:', error);
  }
};
const sendVendorWelcomeEmail = async (vendorEmail, contactName, orgName, tempPassword) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'no-reply@vendorbridge.local',
      to: vendorEmail,
      subject: `Welcome to VendorBridge - Invited by ${orgName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #2563eb;">Welcome, ${contactName}!</h2>
          <p><strong>${orgName}</strong> has registered your company on the VendorBridge procurement network.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin-top: 0;"><strong>Your Login Credentials:</strong></p>
            <p><strong>Email:</strong> ${vendorEmail}</p>
            <p><strong>Temporary Password:</strong> <span style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${tempPassword}</span></p>
          </div>
          
          <p style="color: #dc2626; font-size: 14px;"><em>Please log in and change your password immediately.</em></p>
          
          <div style="margin: 30px 0;">
            <a href="http://localhost:5173/login" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Login to Vendor Portal
            </a>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Vendor welcome email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending vendor welcome email:', error);
  }
};

export default {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendRfqInvitationEmail,
  sendInvoiceEmail,
  sendVendorWelcomeEmail
};