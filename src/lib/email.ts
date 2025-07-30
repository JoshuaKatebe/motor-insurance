import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
}

export const emailTemplates = {
  welcome: (userEmail: string, userName: string): EmailTemplate => ({
    to: userEmail,
    subject: 'Welcome to SecureMotor Insurance!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to SecureMotor Insurance!</h1>
        <p>Hi ${userName},</p>
        <p>Thank you for joining SecureMotor Insurance. We're excited to help you protect what matters most.</p>
        <p>With your account, you can:</p>
        <ul>
          <li>Get instant motor insurance quotes</li>
          <li>Manage your policies online</li>
          <li>File and track claims easily</li>
          <li>Access your documents 24/7</li>
        </ul>
        <p>Get started by getting your first quote!</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/quote" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Get Quote</a>
        <p>Best regards,<br>The SecureMotor Team</p>
      </div>
    `,
  }),

  quoteGenerated: (userEmail: string, userName: string, quoteId: string, premium: number): EmailTemplate => ({
    to: userEmail,
    subject: 'Your Motor Insurance Quote is Ready!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Your Quote is Ready!</h1>
        <p>Hi ${userName},</p>
        <p>Great news! Your motor insurance quote has been generated.</p>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0; color: #1e40af;">Quote Details</h3>
          <p><strong>Quote ID:</strong> ${quoteId}</p>
          <p><strong>Premium:</strong> K${premium.toLocaleString()}</p>
          <p><strong>Valid Until:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
        </div>
        <p>Your quote is valid for 30 days. Don't miss out on this great rate!</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">View Quote</a>
        <p>Best regards,<br>The SecureMotor Team</p>
      </div>
    `,
  }),

  paymentConfirmation: (userEmail: string, userName: string, policyNumber: string, premium: number): EmailTemplate => ({
    to: userEmail,
    subject: 'Payment Confirmed - Your Policy is Active!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #16a34a;">Payment Confirmed!</h1>
        <p>Hi ${userName},</p>
        <p>Congratulations! Your payment has been processed and your motor insurance policy is now active.</p>
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
          <h3 style="margin: 0; color: #15803d;">Policy Details</h3>
          <p><strong>Policy Number:</strong> ${policyNumber}</p>
          <p><strong>Premium Paid:</strong> K${premium.toLocaleString()}</p>
          <p><strong>Status:</strong> Active</p>
        </div>
        <p>Your policy documents will be available in your dashboard shortly.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">View Policy</a>
        <p>Best regards,<br>The SecureMotor Team</p>
      </div>
    `,
  }),

  claimSubmitted: (userEmail: string, userName: string, claimNumber: string): EmailTemplate => ({
    to: userEmail,
    subject: 'Claim Submitted Successfully',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Claim Submitted</h1>
        <p>Hi ${userName},</p>
        <p>We have received your insurance claim and it's being processed by our team.</p>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0; color: #1e40af;">Claim Details</h3>
          <p><strong>Claim Number:</strong> ${claimNumber}</p>
          <p><strong>Status:</strong> Under Review</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <p>Our claims team will review your submission and contact you within 2-3 business days.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/claims" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Track Claim</a>
        <p>Best regards,<br>The SecureMotor Team</p>
      </div>
    `,
  }),
};

export async function sendEmail(template: EmailTemplate) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'SecureMotor <noreply@securemotor.com>',
      to: [template.to],
      subject: template.subject,
      html: template.html,
    });

    if (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }

    return data;
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
}
