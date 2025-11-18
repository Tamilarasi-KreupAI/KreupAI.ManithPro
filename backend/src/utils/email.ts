import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('Email service not configured. Skipping email to:', options.to);
      return;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log('Email sent successfully to:', options.to);
  } catch (error) {
    console.error('Failed to send email:', error);
    // Don't throw error to prevent email failures from breaking the application
  }
};

export const sendApplicationSubmittedEmail = async (
  candidateEmail: string,
  candidateName: string,
  jobTitle: string
): Promise<void> => {
  const subject = `Application Submitted: ${jobTitle}`;
  const html = `
    <h2>Application Submitted Successfully</h2>
    <p>Dear ${candidateName},</p>
    <p>Thank you for applying for the position of <strong>${jobTitle}</strong>.</p>
    <p>Your application has been received and is being reviewed by our recruitment team.</p>
    <p>We will contact you if your profile matches our requirements.</p>
    <br>
    <p>Best regards,</p>
    <p>KreupAI Recruitment Team</p>
  `;

  await sendEmail({ to: candidateEmail, subject, html });
};

export const sendApplicationStatusEmail = async (
  candidateEmail: string,
  candidateName: string,
  jobTitle: string,
  status: string
): Promise<void> => {
  const subject = `Application Status Update: ${jobTitle}`;
  const html = `
    <h2>Application Status Update</h2>
    <p>Dear ${candidateName},</p>
    <p>Your application for <strong>${jobTitle}</strong> has been updated.</p>
    <p>New Status: <strong>${status.replace('_', ' ')}</strong></p>
    <br>
    <p>Best regards,</p>
    <p>KreupAI Recruitment Team</p>
  `;

  await sendEmail({ to: candidateEmail, subject, html });
};
