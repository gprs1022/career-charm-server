import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { generateOTPEmailTemplate } from './EmailTemplate';

dotenv.config();

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};

// Create reusable transporter
let transporter: nodemailer.Transporter;

// Initialize transporter on first use
const getTransporter = async (): Promise<nodemailer.Transporter> => {
  if (!transporter) {
    // Check if we have email credentials
    const hasEmailCredentials = !!(
      emailConfig.auth.user && 
      emailConfig.auth.pass
    );

    // Debug log to check credentials
    console.log('Email credentials check:', {
      hasUser: !!process.env.SMTP_USER,
      hasValidUser: !!process.env.SMTP_USER && process.env.SMTP_USER.length > 0,
      hasPass: !!process.env.SMTP_PASS,
      hasValidPass: !!process.env.SMTP_PASS && process.env.SMTP_PASS.length > 0,
      isValid: hasEmailCredentials
    });
    
    console.log('Email configuration:', {
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: { 
        user: process.env.SMTP_USER ? 'set' : '[not set]', 
        pass: process.env.SMTP_PASS ? 'set' : '[not set]' 
      }
    });

    if (!hasEmailCredentials) {
      console.warn('Missing email credentials. Using test account.');
      // Create test account if no credentials
      const testAccount = await nodemailer.createTestAccount();
      
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    } else {
      // Create real transporter
      transporter = nodemailer.createTransport(emailConfig);
    }
  }
  
  return transporter;
};

interface OTPEmailRequest {
  verifyCode: string;
  fullName: string;
  email: string;
}

export const sendMail = async ({ verifyCode, fullName, email }: OTPEmailRequest): Promise<{
  messageId: string;
  previewUrl?: string;
  simulated?: boolean;
}> => {
  try {
    // Generate email content using template
    const { subject, html, text } = generateOTPEmailTemplate({
      verifyCode,
      fullName
    });

    // Check for simulation mode
    if (process.env.EMAIL_SIMULATION === 'true') {
      console.log('Email simulation mode active. Not sending real emails.');
      console.log('Email would have been sent to:', email);
      console.log('Subject:', subject);
      console.log('Verification Code:', verifyCode);
      
      // Return simulated response
      return {
        messageId: `simulated-${Date.now()}`,
        simulated: true
      };
    }
    
    const transport = await getTransporter();
    
    // Prepare mail options
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Career Charma" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      html,
      text
    };
    
    // Send mail
    const info = await transport.sendMail(mailOptions);
    
    // Return message ID and preview URL if using test account
    return {
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info) || undefined
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export default {
  sendMail
}; 