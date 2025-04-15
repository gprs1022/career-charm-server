interface OTPEmailProps {
    verifyCode: string;
    fullName: string;
}

export const generateOTPEmailTemplate = ({
    verifyCode,
    fullName
}: OTPEmailProps): {
    subject: string;
    html: string;
    text: string;
} => {
    const subject = 'OTP Verification Code';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>OTP Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50; margin-bottom: 20px;">Verify Your Email</h2>
            
            <p>Hello ${fullName},</p>
            
            <p>Your verification code is:</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; text-align: center; margin: 20px 0;">
              <h1 style="color: #2c3e50; letter-spacing: 5px; margin: 0;">${verifyCode}</h1>
            </div>
            
            <p>Please use this code to verify your account. This code will expire in 10 minutes.</p>
            
            <p style="color: #777;">If you didn't request this code, please ignore this email.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #777;">
                This is an automated message, please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `Hello ${fullName}, Your verification code is: ${verifyCode}`;

    return {
        subject,
        html,
        text
    };
};

// Example usage:
/*
const emailContent = generateOTPEmailTemplate({
  verifyCode: '123456',
  fullName: 'John Doe'
});
*/