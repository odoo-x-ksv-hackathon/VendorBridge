export const config = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com', // Defaulting to Gmail/Mailtrap standard
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: process.env.EMAIL_USER ? {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  } : undefined,
  from: process.env.EMAIL_FROM || 'no-reply@vendorbridge.local',
  appName: process.env.APP_NAME || 'VendorBridge ERP',
  baseUrl: process.env.BASE_URL || 'http://localhost:5173',
};